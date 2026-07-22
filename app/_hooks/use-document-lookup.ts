"use client"

import { useState, useEffect, useRef } from "react"
import { findAssistantByIdentificationAction } from "@/app/(protected)/event/actions"
import { isLocallyCheckedIn }                  from "@/app/_lib/offline-db"

export type DocumentStatus = "idle" | "checking" | "not_found" | "found" | "already_checked_in"

export interface AssistantData {
    nombre:   string
    apellido: string
    telefono: string
    correo:   string
}

export function useDocumentLookup(identification: string, eventDayId?: string) {
    const [status,    setStatus]    = useState<DocumentStatus>("idle")
    const [assistant, setAssistant] = useState<AssistantData | null>(null)
    const [gafeteData, setGafeteData] = useState<any | null>(null)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        if (!identification || identification.length < 5) {
            setStatus("idle")
            setAssistant(null)
            setGafeteData(null)
            if (timeoutRef.current) clearTimeout(timeoutRef.current)
            return
        }

        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        setStatus("checking")

        timeoutRef.current = setTimeout(async () => {
            // ── Path offline ──────────────────────────────────────────────────
            if (!navigator.onLine) {
                try {
                    if (eventDayId) {
                        const locallyIn = await isLocallyCheckedIn(identification, eventDayId)
                        if (locallyIn) {
                            setStatus("already_checked_in")
                            return
                        }
                    }
                } catch {
                    // IndexedDB no disponible — continuar como not_found
                }
                // Sin red y sin registro local → permitir ingreso manual
                setStatus("not_found")
                setAssistant(null)
                setGafeteData(null)
                return
            }

            // ── Path online ───────────────────────────────────────────────────
            try {
                const res = await findAssistantByIdentificationAction(identification, eventDayId)
                if (res?.error) {
                    setStatus("not_found")
                    setAssistant(null)
                    setGafeteData(null)
                } else if (res?.found) {
                    setAssistant(res.assistant || null)
                    setGafeteData(res.gafeteData || null)
                    setStatus(res.alreadyCheckedIn ? "already_checked_in" : "found")
                } else {
                    setStatus("not_found")
                    setAssistant(null)
                    setGafeteData(null)
                }
            } catch {
                // Error de red inesperado → tratar como not_found para no bloquear
                setStatus("not_found")
                setAssistant(null)
                setGafeteData(null)
            }
        }, 400)

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current)
        }
    }, [identification, eventDayId])

    return { status, assistant, gafeteData }
}


