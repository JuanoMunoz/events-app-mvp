"use client"

/**
 * use-offline-queue.ts
 *
 * Hook que envuelve el registro de asistencias con soporte offline completo:
 *
 *  - Si hay conexión  → llama directamente al server action
 *  - Si no hay conexión → encola en IndexedDB y genera la gafete localmente
 *  - Al reconectar   → sincroniza la cola automáticamente en background
 *
 * Diseñado para aguantar horas offline e incluso gestión completa de un
 * evento sin internet.
 */

import { useState, useEffect, useCallback, useRef } from "react"
import { registerAttendanceAction }                  from "@/app/(protected)/event/actions"
import {
    enqueuePendingAttendance,
    getAllPending,
    removePending,
    updatePendingRetry,
    countPending,
    markLocalCheckin,
} from "@/app/_lib/offline-db"
import type { GafeteData } from "@/app/_components/print/gafete"

// ─── Tipos públicos ───────────────────────────────────────────────────────────

/** Datos que necesita submitAttendance para funcionar online y offline. */
export interface OfflineSubmitData {
    eventId:          string
    eventDayId:       string
    cedula:           string
    nombre:           string
    apellido:         string
    telefono:         string
    correo:           string
    // Datos del evento necesarios para generar la gafete offline
    eventName:        string
    eventDate:        string   // ISO
    eventLocation?:   string | null
    organizationName?: string
}

/** Respuesta de submitAttendance — misma forma que registerAttendanceAction + queued. */
export type SubmitResult =
    | { success: true;  assistantName: string; gafeteData: GafeteData }
    | { queued:  true;  assistantName: string; gafeteData: GafeteData }
    | { error: string }

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useOfflineQueue() {
    const [isOnline, setIsOnline]       = useState<boolean>(() =>
        typeof navigator !== "undefined" ? navigator.onLine : true
    )
    const [pendingCount, setPendingCount] = useState(0)
    const isSyncing                       = useRef(false)

    // ── Conteo de pendientes ──────────────────────────────────────────────────

    const refreshCount = useCallback(async () => {
        try {
            const n = await countPending()
            setPendingCount(n)
        } catch {
            // IndexedDB no disponible (SSR o permisos de seguridad)
        }
    }, [])

    // ── Sincronización de la cola ─────────────────────────────────────────────

    /**
     * Procesa todos los registros pendientes en orden cronológico.
     * - Si el servidor responde (éxito o error de negocio) → elimina el registro
     * - Si falla por red → incrementa reintentos y detiene el procesamiento
     *   (se reintentará en la próxima reconexión)
     */
    const syncPending = useCallback(async () => {
        if (isSyncing.current) return
        isSyncing.current = true

        try {
            const pending = await getAllPending()
            if (pending.length === 0) return

            console.info(`[OfflineQueue] Sincronizando ${pending.length} registro(s) pendiente(s)…`)

            for (const item of pending) {
                try {
                    const fd = new FormData()
                    fd.append("eventId",    item.eventId)
                    fd.append("eventDayId", item.eventDayId)
                    fd.append("cedula",     item.cedula)
                    fd.append("nombre",     item.nombre)
                    fd.append("apellido",   item.apellido)
                    fd.append("telefono",   item.telefono)
                    fd.append("correo",     item.correo)

                    const res = await registerAttendanceAction(fd)

                    // Éxito o error de negocio (ej. ya registrado) → descartar de la cola
                    // El upsert del server action maneja duplicados sin romper
                    await removePending(item.id)

                    if ("success" in res) {
                        console.info(
                            `[OfflineQueue] ✓ ${item.cedula} sincronizado (${item.nombre} ${item.apellido})`
                        )
                    } else if ("error" in res) {
                        console.warn(
                            `[OfflineQueue] Descartado ${item.cedula}: ${res.error}`
                        )
                    }

                    // Pausa entre requests para no saturar el servidor
                    await new Promise<void>(r => setTimeout(r, 200))

                } catch {
                    // Error de red — la conexión volvió pero se fue de nuevo
                    await updatePendingRetry(item.id, item.retries + 1)
                    console.warn(
                        `[OfflineQueue] Error de red sincronizando ${item.cedula}, se reintentará al reconectar`
                    )
                    break // Detener; el próximo evento "online" reintentará
                }
            }
        } finally {
            isSyncing.current = false
            await refreshCount()
        }
    }, [refreshCount])

    // ── Listeners de conectividad ─────────────────────────────────────────────

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true)
            // Espera breve para que la conexión se estabilice antes de sincronizar
            setTimeout(syncPending, 1500)
        }
        const handleOffline = () => {
            setIsOnline(false)
        }

        window.addEventListener("online",  handleOnline)
        window.addEventListener("offline", handleOffline)

        // Al montar: leer conteo y sincronizar si hay pendientes y hay conexión
        refreshCount()
        if (navigator.onLine) {
            syncPending()
        }

        return () => {
            window.removeEventListener("online",  handleOnline)
            window.removeEventListener("offline", handleOffline)
        }
    }, [syncPending, refreshCount])

    // ── submitAttendance ──────────────────────────────────────────────────────

    /**
     * Reemplaza la llamada directa a registerAttendanceAction.
     *
     * Flujo:
     *   Online  → server action → marca checkin local si OK → retorna resultado
     *   Online pero falla la red → encola + gafete offline
     *   Offline → encola + gafete offline
     */
    const submitAttendance = useCallback(
        async (data: OfflineSubmitData): Promise<SubmitResult> => {
            const fullName = `${data.nombre} ${data.apellido}`.trim()

            // ── Path online ───────────────────────────────────────────────────
            if (isOnline) {
                try {
                    const fd = new FormData()
                    fd.append("eventId",    data.eventId)
                    fd.append("eventDayId", data.eventDayId)
                    fd.append("cedula",     data.cedula)
                    fd.append("nombre",     data.nombre)
                    fd.append("apellido",   data.apellido)
                    fd.append("telefono",   data.telefono)
                    fd.append("correo",     data.correo)

                    const res = await registerAttendanceAction(fd)

                    if ("success" in res) {
                        // Registrar en índice local para consistencia futura offline
                        await markLocalCheckin(data.cedula, data.eventDayId).catch(() => {})
                    }

                    return res as SubmitResult

                } catch {
                    // La red falló a pesar de navigator.onLine → caer al path offline
                    console.warn("[OfflineQueue] Fallo de red en submit online, encolando…")
                    setIsOnline(false)
                }
            }

            // ── Path offline ──────────────────────────────────────────────────
            await enqueuePendingAttendance({
                eventId:    data.eventId,
                eventDayId: data.eventDayId,
                cedula:     data.cedula,
                nombre:     data.nombre,
                apellido:   data.apellido,
                telefono:   data.telefono,
                correo:     data.correo,
            })

            await refreshCount()

            // Generar gafete localmente con los datos disponibles en el cliente
            const offlineGafete: GafeteData = {
                attendanceId:     `offline-${crypto.randomUUID()}`,
                eventName:        data.eventName,
                eventDate:        data.eventDate,
                assistantName:    fullName,
                identification:   data.cedula,
                location:         data.eventLocation,
                organizationName: data.organizationName,
            }

            return { queued: true, assistantName: fullName, gafeteData: offlineGafete }
        },
        [isOnline, refreshCount]
    )

    // ── API pública ───────────────────────────────────────────────────────────

    return {
        /** true si el browser tiene conexión a internet */
        isOnline,
        /** número de registros pendientes de sincronizar */
        pendingCount,
        /** reemplaza registerAttendanceAction con soporte offline transparente */
        submitAttendance,
        /** dispara manualmente la sincronización (normalmente automático al reconectar) */
        syncPending,
    }
}
