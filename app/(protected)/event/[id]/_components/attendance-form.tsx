"use client"

import { useRef, useState, useEffect } from "react"
import { Check, Loader2, ScanLine, ChevronDown, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { registerAttendanceAction } from "../../actions"
import { useDocumentLookup } from "@/app/_hooks/use-document-lookup"
import PrintModal from "./print-modal"
import type { GafeteData } from "@/app/_components/print/gafete"

interface AttendanceFormProps {
    cities: string[]
    events: {
        id: string
        title: string
        city: string
        date: string
        status: "active" | "upcoming" | "past"
    }[]
    preselectedEventId?: string
}

interface FormData {
    cedula: string
    nombre: string
    apellido: string
    telefono: string
    correo: string
    confirma: boolean
}

const EMPTY_FORM: FormData = {
    cedula: "",
    nombre: "",
    apellido: "",
    telefono: "",
    correo: "",
    confirma: false,
}

export default function AttendanceForm({
    cities,
    events,
    preselectedEventId,
}: AttendanceFormProps) {
    const selectedEventOnMount = events.find((e) => e.id === preselectedEventId)
    const [city, setCity] = useState<string>(selectedEventOnMount?.city ?? "")
    const [eventId, setEventId] = useState<string>(preselectedEventId ?? "")
    const [form, setForm] = useState<FormData>(EMPTY_FORM)

    // UI States
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [count, setCount] = useState(0)
    
    // Auto-registration states
    const [isAutoSubmitting, setIsAutoSubmitting] = useState(false)
    const autoSubmitTimeout = useRef<NodeJS.Timeout | null>(null)

    // Printing state
    const [printData, setPrintData] = useState<GafeteData | null>(null)
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)

    const cedulaRef = useRef<HTMLInputElement>(null)

    // Hook de lookup
    const lookup = useDocumentLookup(form.cedula)

    // Auto-focus en cédula cuando cambia evento
    useEffect(() => {
        if (eventId && !isPrintModalOpen) {
            cedulaRef.current?.focus()
        }
    }, [eventId, isPrintModalOpen])

    // Sincronizar datos del lookup con el form
    useEffect(() => {
        if (lookup.assistant && !success && !isAutoSubmitting && !isPrintModalOpen) {
            setForm((prev) => ({
                ...prev,
                nombre: lookup.assistant!.nombre,
                apellido: lookup.assistant!.apellido,
                telefono: lookup.assistant!.telefono || prev.telefono,
                correo: lookup.assistant!.correo || prev.correo,
                confirma: true, // Auto-confirmar si lo encontramos
            }))
        }
    }, [lookup.assistant, success, isAutoSubmitting, isPrintModalOpen])

    // Auto-disparo
    useEffect(() => {
        if (
            lookup.status === "found" &&
            form.nombre &&
            form.apellido &&
            form.cedula.length >= 6 &&
            !loading &&
            !success &&
            !isAutoSubmitting &&
            !isPrintModalOpen
        ) {
            setIsAutoSubmitting(true)
            toast.info("Documento reconocido. Registrando en 1s...")
            
            autoSubmitTimeout.current = setTimeout(() => {
                // Trigger form submission
                const submitBtn = document.getElementById("attendance-submit")
                if (submitBtn) submitBtn.click()
            }, 1000)
        }

        // Cancelar auto-disparo si cambia el status a algo inválido
        if (lookup.status !== "found" && isAutoSubmitting) {
            if (autoSubmitTimeout.current) clearTimeout(autoSubmitTimeout.current)
            setIsAutoSubmitting(false)
        }

        return () => {
            if (autoSubmitTimeout.current) clearTimeout(autoSubmitTimeout.current)
        }
    }, [lookup.status, form.nombre, form.apellido, form.cedula, loading, success, isAutoSubmitting, isPrintModalOpen])


    const cityEvents = events.filter((e) => e.city === city && e.status !== "past")
    const selectedEvent = events.find((e) => e.id === eventId)

    function setField<K extends keyof FormData>(key: K, value: FormData[K]) {
        setForm((prev) => ({ ...prev, [key]: value }))
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!eventId) {
            toast.error("Selecciona un evento primero")
            setIsAutoSubmitting(false)
            return
        }
        if (!form.cedula || !form.nombre || !form.apellido) {
            toast.error("Completa los datos obligatorios")
            setIsAutoSubmitting(false)
            return
        }
        if (!form.confirma) {
            toast.error("Debes confirmar la asistencia")
            setIsAutoSubmitting(false)
            return
        }

        setLoading(true)
        const fd = new FormData()
        fd.append("eventId", eventId)
        fd.append("cedula", form.cedula)
        fd.append("nombre", form.nombre)
        fd.append("apellido", form.apellido)
        fd.append("telefono", form.telefono)
        fd.append("correo", form.correo)

        const res = await registerAttendanceAction(fd)
        setLoading(false)
        setIsAutoSubmitting(false)

        if (res?.error) {
            toast.error(res.error)
            return
        }

        setSuccess(true)
        setCount((c) => c + 1)
        toast.success(`✓ ${res.assistantName} registrado/a`)

        if (res.gafeteData) {
            setPrintData(res.gafeteData as GafeteData)
            setIsPrintModalOpen(true)
        } else {
            resetScanner()
        }
    }

    function resetScanner() {
        setIsPrintModalOpen(false)
        setPrintData(null)
        setSuccess(false)
        setForm(EMPTY_FORM)
        setTimeout(() => {
            cedulaRef.current?.focus()
        }, 100)
    }

    const inputStyle: React.CSSProperties = {
        width: "100%",
        padding: "0.625rem 0.75rem",
        fontSize: "0.875rem",
        background: "var(--color-surface)",
        color: "var(--color-text)",
        border: "1px solid var(--color-border)",
        borderRadius: "4px",
        outline: "none",
        fontFamily: "inherit",
        transition: "border-color 150ms",
    }

    const focusProps = {
        onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
            e.target.style.borderColor = "var(--color-primary)"
        },
        onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
            e.target.style.borderColor = "var(--color-border)"
        },
    }

    // Color del borde de la cédula según status del lookup
    let cedulaBorderColor = "var(--color-border)"
    if (lookup.status === "found") cedulaBorderColor = "var(--color-primary)"
    if (lookup.status === "not_found") cedulaBorderColor = "var(--color-accent)"
    if (lookup.status === "already_checked_in") cedulaBorderColor = "var(--color-danger)"

    return (
        <div className="flex flex-col gap-8">
            <PrintModal 
                isOpen={isPrintModalOpen} 
                onClose={resetScanner} 
                data={printData} 
            />

            {/* ── Selector "Estoy en..." ────────────────────────── */}
            <div
                className="flex flex-col gap-2 p-5 rounded-sm"
                style={{
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                }}
            >
                <div className="flex items-baseline gap-3 flex-wrap">
                    <span
                        className="text-2xl font-medium"
                        style={{
                            fontFamily: "var(--font-galindo)",
                            color: "var(--color-text-muted)",
                        }}
                    >
                        Estoy en
                    </span>
                    <div className="relative">
                        <select
                            id="city-select"
                            value={city}
                            onChange={(e) => {
                                setCity(e.target.value)
                                setEventId("")
                            }}
                            style={{
                                appearance: "none" as const,
                                background: "transparent",
                                border: "none",
                                borderBottom: city
                                    ? "2px solid var(--color-primary)"
                                    : "2px solid var(--color-border)",
                                borderRadius: 0,
                                outline: "none",
                                cursor: "pointer",
                                fontSize: "1.5rem",
                                fontFamily: "var(--font-galindo)",
                                color: city ? "var(--color-primary)" : "var(--color-text-muted)",
                                paddingRight: "1.5rem",
                                paddingBottom: "2px",
                                fontWeight: 500,
                                minWidth: "160px",
                                transition: "color 150ms, border-color 150ms",
                            }}
                        >
                            <option value="" disabled>
                                una ciudad
                            </option>
                            {cities.map((c) => (
                                <option key={c} value={c}>
                                    {c}
                                </option>
                            ))}
                        </select>
                        <ChevronDown
                            size={14}
                            className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2"
                            style={{
                                color: city ? "var(--color-primary)" : "var(--color-text-muted)",
                            }}
                        />
                    </div>
                </div>

                {/* Selector de evento */}
                {city && (
                    <div className="flex items-baseline gap-3 flex-wrap mt-1">
                        <span
                            className="text-base font-medium"
                            style={{ color: "var(--color-text-muted)" }}
                        >
                            Atendiendo en
                        </span>
                        <div className="relative">
                            <select
                                id="event-select"
                                value={eventId}
                                onChange={(e) => setEventId(e.target.value)}
                                style={{
                                    appearance: "none" as const,
                                    background: "transparent",
                                    border: "none",
                                    borderBottom: eventId
                                        ? "2px solid var(--color-accent)"
                                        : "2px solid var(--color-border)",
                                    borderRadius: 0,
                                    outline: "none",
                                    cursor: "pointer",
                                    fontSize: "1rem",
                                    fontFamily: "inherit",
                                    color: eventId ? "var(--color-accent)" : "var(--color-text-muted)",
                                    paddingRight: "1.5rem",
                                    paddingBottom: "2px",
                                    fontWeight: 500,
                                    minWidth: "200px",
                                    transition: "color 150ms, border-color 150ms",
                                }}
                            >
                                <option value="" disabled>
                                    selecciona un evento
                                </option>
                                {cityEvents.map((ev) => (
                                    <option key={ev.id} value={ev.id}>
                                        {ev.title}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown
                                size={12}
                                className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2"
                                style={{
                                    color: eventId ? "var(--color-accent)" : "var(--color-text-muted)",
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* ── Formulario de asistencia ─────────────────────── */}
            {eventId && (
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    {/* Indicador scanner-ready */}
                    <div
                        className="flex items-center gap-2 px-3 py-2 rounded-sm"
                        style={{
                            background: success
                                ? "rgba(18,90,245,0.06)"
                                : "var(--color-background)",
                            border: "1px solid var(--color-border)",
                            transition: "background 300ms",
                        }}
                    >
                        {success ? (
                            <Check size={14} style={{ color: "var(--color-primary)" }} />
                        ) : (
                            <ScanLine
                                size={14}
                                style={{ color: "var(--color-text-muted)" }}
                                className="animate-pulse"
                            />
                        )}
                        <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                            {success
                                ? "Registrado · Imprimiendo..."
                                : count > 0
                                    ? `Listo para escanear · ${count} registrado${count !== 1 ? "s" : ""}`
                                    : "Listo para escanear · ingresa o escanea el documento"}
                        </span>
                    </div>

                    {/* Cédula — campo escáner-first */}
                    <label className="flex flex-col gap-1.5">
                        <span
                            className="text-xs font-medium uppercase tracking-wide flex justify-between items-end"
                            style={{ color: "var(--color-text-muted)" }}
                        >
                            <span>
                                Número de identificación <span style={{ color: "var(--color-danger)" }}>*</span>
                            </span>
                            
                            {lookup.status === "checking" && (
                                <span className="flex items-center gap-1 text-[10px] text-gray-400 normal-case">
                                    <Loader2 size={10} className="animate-spin" /> Buscando...
                                </span>
                            )}
                            {lookup.status === "found" && (
                                <span className="text-[10px] normal-case" style={{ color: "var(--color-primary)" }}>
                                    ✓ Encontrado
                                </span>
                            )}
                            {lookup.status === "not_found" && form.cedula.length >= 6 && (
                                <span className="text-[10px] normal-case" style={{ color: "var(--color-accent)" }}>
                                    Usuario nuevo
                                </span>
                            )}
                        </span>
                        <input
                            id="attendance-cedula"
                            ref={cedulaRef}
                            type="text"
                            inputMode="numeric"
                            autoComplete="off"
                            placeholder="1234567890"
                            value={form.cedula}
                            onChange={(e) => setField("cedula", e.target.value)}
                            style={{ 
                                ...inputStyle, 
                                fontSize: "1rem", 
                                fontWeight: 500,
                                borderColor: cedulaBorderColor,
                                outlineColor: cedulaBorderColor 
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = "var(--color-primary)"
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = cedulaBorderColor
                            }}
                        />
                        
                        {/* Mensaje de error si ya tiene checkin */}
                        {lookup.status === "already_checked_in" && (
                            <span className="text-xs flex items-center gap-1 mt-0.5" style={{ color: "var(--color-danger)" }}>
                                <AlertCircle size={12} />
                                Este asistente ya se registró hoy
                            </span>
                        )}
                    </label>

                    {/* Nombre + Apellido */}
                    <div className="grid grid-cols-2 gap-3">
                        <label className="flex flex-col gap-1.5">
                            <span
                                className="text-xs font-medium uppercase tracking-wide"
                                style={{ color: "var(--color-text-muted)" }}
                            >
                                Nombre <span style={{ color: "var(--color-danger)" }}>*</span>
                            </span>
                            <input
                                id="attendance-nombre"
                                type="text"
                                autoComplete="given-name"
                                placeholder="María"
                                value={form.nombre}
                                onChange={(e) => setField("nombre", e.target.value)}
                                style={inputStyle}
                                {...focusProps}
                            />
                        </label>
                        <label className="flex flex-col gap-1.5">
                            <span
                                className="text-xs font-medium uppercase tracking-wide"
                                style={{ color: "var(--color-text-muted)" }}
                            >
                                Apellido <span style={{ color: "var(--color-danger)" }}>*</span>
                            </span>
                            <input
                                id="attendance-apellido"
                                type="text"
                                autoComplete="family-name"
                                placeholder="García"
                                value={form.apellido}
                                onChange={(e) => setField("apellido", e.target.value)}
                                style={inputStyle}
                                {...focusProps}
                            />
                        </label>
                    </div>

                    {/* Teléfono + Correo */}
                    <div className="grid grid-cols-2 gap-3">
                        <label className="flex flex-col gap-1.5">
                            <span
                                className="text-xs font-medium uppercase tracking-wide"
                                style={{ color: "var(--color-text-muted)" }}
                            >
                                Teléfono
                            </span>
                            <input
                                id="attendance-telefono"
                                type="tel"
                                inputMode="tel"
                                autoComplete="tel"
                                placeholder="300 000 0000"
                                value={form.telefono}
                                onChange={(e) => setField("telefono", e.target.value)}
                                style={inputStyle}
                                {...focusProps}
                            />
                        </label>
                        <label className="flex flex-col gap-1.5">
                            <span
                                className="text-xs font-medium uppercase tracking-wide"
                                style={{ color: "var(--color-text-muted)" }}
                            >
                                Correo electrónico
                            </span>
                            <input
                                id="attendance-correo"
                                type="email"
                                autoComplete="email"
                                placeholder="correo@dominio.com"
                                value={form.correo}
                                onChange={(e) => setField("correo", e.target.value)}
                                style={inputStyle}
                                {...focusProps}
                            />
                        </label>
                    </div>

                    {/* Checkbox de confirmación */}
                    <label
                        className="flex items-start gap-3 cursor-pointer"
                        htmlFor="attendance-confirmar"
                    >
                        <div className="relative mt-0.5">
                            <input
                                id="attendance-confirmar"
                                type="checkbox"
                                checked={form.confirma}
                                onChange={(e) => setField("confirma", e.target.checked)}
                                className="sr-only"
                            />
                            <div
                                className="w-4 h-4 rounded-sm flex items-center justify-center transition-all"
                                style={{
                                    border: form.confirma
                                        ? "2px solid var(--color-primary)"
                                        : "2px solid var(--color-border)",
                                    background: form.confirma
                                        ? "var(--color-primary)"
                                        : "var(--color-surface)",
                                }}
                                onClick={() => setField("confirma", !form.confirma)}
                            >
                                {form.confirma && (
                                    <Check size={10} strokeWidth={3} style={{ color: "#fff" }} />
                                )}
                            </div>
                        </div>
                        <span className="text-sm" style={{ color: "var(--color-text)" }}>
                            Confirmo mi asistencia al evento{" "}
                            <strong>{selectedEvent?.title}</strong>.
                        </span>
                    </label>

                    {/* Submit */}
                    <button
                        id="attendance-submit"
                        type="submit"
                        disabled={loading || success || lookup.status === "already_checked_in"}
                        className="flex items-center justify-center gap-2 w-full py-3 px-4 text-sm font-medium rounded-sm transition-all"
                        style={{
                            background:
                                success
                                    ? "var(--color-primary)"
                                    : loading || isAutoSubmitting || lookup.status === "already_checked_in"
                                        ? "var(--color-border)"
                                        : "var(--color-text)",
                            color: success || loading || isAutoSubmitting || lookup.status === "already_checked_in" 
                                ? "var(--color-text-muted)" 
                                : "var(--color-surface)",
                            border: "none",
                            cursor: loading || success || isAutoSubmitting || lookup.status === "already_checked_in" 
                                ? "default" 
                                : "pointer",
                        }}
                    >
                        {loading || isAutoSubmitting ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                {isAutoSubmitting ? "Registrando..." : "Guardando..."}
                            </>
                        ) : success ? (
                            <>
                                <Check size={15} strokeWidth={2.5} />
                                Asistencia registrada
                            </>
                        ) : lookup.status === "already_checked_in" ? (
                            "Ya registrado hoy"
                        ) : (
                            "Registrar asistencia"
                        )}
                    </button>
                </form>
            )}
        </div>
    )
}
