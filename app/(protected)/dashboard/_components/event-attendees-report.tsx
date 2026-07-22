"use client"

import { useState, useEffect, useTransition } from "react"
import {
    Search,
    FileSpreadsheet,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Users,
    CheckCircle2,
    XCircle,
    Calendar,
    Building2,
    MapPin,
    Clock,
    Filter,
} from "lucide-react"
import { toast } from "sonner"
import {
    getEventAttendeesReportAction,
    exportEventAttendeesReportToExcelAction,
} from "../analytics-actions"

interface SelectorEvent {
    id: string
    name: string
    startDate: string
}

interface EventAttendeesReportProps {
    events: SelectorEvent[]
}

interface EventMetadata {
    id: string
    name: string
    description: string
    cityName: string
    organizationName: string
    startDate: string
    endDate: string
    location: string
    capacity: number | null
    totalDays: number
}

interface AttendeeRow {
    id: string
    name: string
    identification: string
    email: string
    phone: string
    firstAttendedAt: string | null
    registeredBy: string
    qrCode?: string
    ipAddress?: string
    days: Record<string, { attended: boolean; attendedAt?: string; staffName?: string; qrCode?: string; ipAddress?: string }>
}

interface DayHeader {
    id: string
    label: string
    date: string
}

export default function EventAttendeesReport({ events }: EventAttendeesReportProps) {
    const [selectedEventId, setSelectedEventId] = useState<string>(events[0]?.id || "")
    const [daysRange, setDaysRange] = useState<number>(0)
    const [search, setSearch] = useState<string>("")
    const [debouncedSearch, setDebouncedSearch] = useState<string>("")
    const [page, setPage] = useState<number>(1)
    const [limit] = useState<number>(15)

    const [eventMeta, setEventMeta] = useState<EventMetadata | null>(null)
    const [days, setDays] = useState<DayHeader[]>([])
    const [attendees, setAttendees] = useState<AttendeeRow[]>([])
    const [total, setTotal] = useState<number>(0)
    const [totalPages, setTotalPages] = useState<number>(1)

    const [isPending, startTransition] = useTransition()
    const [isExporting, setIsExporting] = useState<boolean>(false)

    // Debounce búsqueda
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search)
            setPage(1)
        }, 300)
        return () => clearTimeout(handler)
    }, [search])

    // Cargar reporte al cambiar evento, rango de tiempo, búsqueda o página
    useEffect(() => {
        if (!selectedEventId) return

        startTransition(async () => {
            const res = await getEventAttendeesReportAction({
                eventId: selectedEventId,
                daysRange,
                page,
                limit,
                search: debouncedSearch,
            })

            if ("error" in res) {
                toast.error(res.error)
                return
            }

            setEventMeta(res.eventMetadata || null)
            setDays(res.days || [])
            setAttendees(res.attendees || [])
            setTotal(res.total || 0)
            setTotalPages(res.totalPages || 1)
        })
    }, [selectedEventId, daysRange, debouncedSearch, page, limit])

    // Exportar a Excel
    const handleExportExcel = async () => {
        if (!selectedEventId) return
        setIsExporting(true)
        toast.info("Generando informe completo de asistentes en Excel...")

        try {
            const res = await exportEventAttendeesReportToExcelAction(selectedEventId, daysRange)
            if ("error" in res) {
                toast.error(res.error)
            } else {
                const link = document.createElement("a")
                link.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${res.base64}`
                link.download = res.filename
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                toast.success("Informe Excel descargado correctamente")
            }
        } catch {
            toast.error("Error al exportar archivo Excel")
        } finally {
            setIsExporting(false)
        }
    }

    return (
        <section
            className="flex flex-col gap-5 p-5 lg:p-6 rounded-sm"
            style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
            }}
        >
            {/* Header + Selectores (Evento & Rango de tiempo) + Exportar Excel */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <Users size={18} style={{ color: "var(--color-primary)" }} />
                        <h2 className="text-base font-semibold" style={{ color: "var(--color-text)" }}>
                            Informe de Participantes y Metadata del Evento
                        </h2>
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                        Genera y descarga informes detallados por intervalos de tiempo (30 días, 90 días, 1 año).
                    </p>
                </div>

                {/* Controles: Event Selector, Time Range & Excel Export */}
                <div className="flex items-center gap-2 flex-wrap">
                    {/* Selector de Evento */}
                    <select
                        id="dashboard-report-event-select"
                        value={selectedEventId}
                        onChange={(e) => {
                            setSelectedEventId(e.target.value)
                            setPage(1)
                        }}
                        className="px-3 py-1.5 text-xs rounded border outline-none font-medium transition-colors"
                        style={{
                            background: "var(--color-background)",
                            borderColor: "var(--color-border)",
                            color: "var(--color-text)",
                        }}
                    >
                        {events.map((ev) => (
                            <option key={ev.id} value={ev.id}>
                                {ev.name} ({new Date(ev.startDate).toLocaleDateString("es-CO")})
                            </option>
                        ))}
                    </select>

                    {/* Selector de Intervalo de Tiempo */}
                    <div className="flex items-center gap-1.5 bg-[var(--color-background)] px-2 py-1 rounded border border-[var(--color-border)]">
                        <Clock size={13} className="text-[var(--color-text-muted)]" />
                        <select
                            id="dashboard-report-days-select"
                            value={daysRange}
                            onChange={(e) => {
                                setDaysRange(Number(e.target.value))
                                setPage(1)
                            }}
                            className="bg-transparent text-xs outline-none font-medium cursor-pointer"
                            style={{ color: "var(--color-text)" }}
                        >
                            <option value={0}>Histórico completo</option>
                            <option value={30}>Últimos 30 días</option>
                            <option value={90}>Últimos 90 días</option>
                            <option value={365}>Último 1 año (365d)</option>
                        </select>
                    </div>

                    {/* Botón de Exportar Excel */}
                    <button
                        onClick={handleExportExcel}
                        disabled={isExporting || !selectedEventId || total === 0}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-all shadow-sm"
                        style={{
                            background: "var(--color-primary)",
                            color: "#ffffff",
                            opacity: isExporting || !selectedEventId || total === 0 ? 0.6 : 1,
                            cursor: isExporting || !selectedEventId || total === 0 ? "not-allowed" : "pointer",
                        }}
                    >
                        {isExporting ? (
                            <Loader2 size={14} className="animate-spin" />
                        ) : (
                            <FileSpreadsheet size={14} />
                        )}
                        Exportar Excel
                    </button>
                </div>
            </div>

            {/* ── Metadata del Evento Seleccionado ── */}
            {eventMeta && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-3.5 rounded border border-[var(--color-border)] bg-[var(--color-background)] text-xs">
                    <div className="flex items-center gap-2">
                        <Building2 size={15} className="text-[var(--color-primary)] shrink-0" />
                        <div className="truncate">
                            <span className="text-[10px] text-[var(--color-text-muted)] block uppercase font-medium">Organización</span>
                            <span className="font-semibold text-[var(--color-text)] truncate block">{eventMeta.organizationName}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <MapPin size={15} className="text-[var(--color-primary)] shrink-0" />
                        <div className="truncate">
                            <span className="text-[10px] text-[var(--color-text-muted)] block uppercase font-medium">Ciudad / Ubicación</span>
                            <span className="font-semibold text-[var(--color-text)] truncate block">
                                {eventMeta.cityName} {eventMeta.location ? `(${eventMeta.location})` : ""}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Calendar size={15} className="text-[var(--color-primary)] shrink-0" />
                        <div className="truncate">
                            <span className="text-[10px] text-[var(--color-text-muted)] block uppercase font-medium">Fechas ({eventMeta.totalDays}d)</span>
                            <span className="font-semibold text-[var(--color-text)] block">
                                {new Date(eventMeta.startDate).toLocaleDateString("es-CO", { day: "numeric", month: "short" })} - {" "}
                                {new Date(eventMeta.endDate).toLocaleDateString("es-CO", { day: "numeric", month: "short" })}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Filter size={15} className="text-[var(--color-primary)] shrink-0" />
                        <div className="truncate">
                            <span className="text-[10px] text-[var(--color-text-muted)] block uppercase font-medium">Filtro de Tiempo</span>
                            <span className="font-semibold text-[var(--color-text)] block">
                                {daysRange === 30 ? "Últimos 30 días" : daysRange === 90 ? "Últimos 90 días" : daysRange === 365 ? "Último 1 año" : "Todo el historial"}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Buscador + Stats de conteo */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                    <Search
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2"
                        style={{ color: "var(--color-text-muted)" }}
                    />
                    <input
                        type="text"
                        placeholder="Buscar por cédula, nombre o correo..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 text-xs rounded border outline-none transition-colors"
                        style={{
                            background: "var(--color-background)",
                            borderColor: "var(--color-border)",
                            color: "var(--color-text)",
                        }}
                    />
                </div>

                <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] self-end sm:self-auto">
                    <span>Participantes en período:</span>
                    <span className="font-bold text-[var(--color-text)] bg-[var(--color-background)] px-2 py-0.5 rounded border border-[var(--color-border)]">
                        {total.toLocaleString("es-CO")}
                    </span>
                </div>
            </div>

            {/* Tabla de Asistentes & Metadata */}
            <div className="overflow-x-auto border border-[var(--color-border)] rounded-sm">
                <table className="w-full text-left text-xs border-collapse">
                    <thead>
                        <tr style={{ background: "var(--color-background)", borderBottom: "1px solid var(--color-border)" }}>
                            <th className="py-2.5 px-3 font-semibold text-[var(--color-text-muted)]">Participante</th>
                            <th className="py-2.5 px-3 font-semibold text-[var(--color-text-muted)]">Contacto</th>
                            {days.map((d) => (
                                <th key={d.id} className="py-2.5 px-3 font-semibold text-[var(--color-text-muted)] text-center">
                                    <div className="flex flex-col items-center">
                                        <span>{d.label}</span>
                                        <span className="text-[10px] font-normal opacity-70">
                                            {new Date(d.date).toLocaleDateString("es-CO", { day: "numeric", month: "short" })}
                                        </span>
                                    </div>
                                </th>
                            ))}
                            <th className="py-2.5 px-3 font-semibold text-[var(--color-text-muted)]">Primer Registro</th>
                            <th className="py-2.5 px-3 font-semibold text-[var(--color-text-muted)]">Staff Responsable</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-border)]">
                        {isPending ? (
                            <tr>
                                <td colSpan={4 + days.length} className="py-8 text-center text-[var(--color-text-muted)]">
                                    <div className="flex items-center justify-center gap-2">
                                        <Loader2 size={16} className="animate-spin text-[var(--color-primary)]" />
                                        <span>Cargando informe de participantes y metadata...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : attendees.length === 0 ? (
                            <tr>
                                <td colSpan={4 + days.length} className="py-8 text-center text-[var(--color-text-muted)]">
                                    No se encontraron participantes registrados en el intervalo seleccionado.
                                </td>
                            </tr>
                        ) : (
                            attendees.map((row) => (
                                <tr key={row.id} className="hover:bg-[var(--color-background)]/50 transition-colors">
                                    {/* Nombre + Cédula */}
                                    <td className="py-2.5 px-3">
                                        <div className="font-medium text-[var(--color-text)]">{row.name}</div>
                                        <div className="text-[10px] text-[var(--color-text-muted)]">C.C. {row.identification}</div>
                                    </td>

                                    {/* Contacto */}
                                    <td className="py-2.5 px-3">
                                        <div className="text-[var(--color-text)]">{row.email}</div>
                                        <div className="text-[10px] text-[var(--color-text-muted)]">{row.phone}</div>
                                    </td>

                                    {/* Días del evento */}
                                    {days.map((d) => {
                                        const dayInfo = row.days[d.id]
                                        const attended = dayInfo?.attended
                                        const timeStr = dayInfo?.attendedAt
                                            ? new Date(dayInfo.attendedAt).toLocaleTimeString("es-CO", {
                                                  hour: "2-digit",
                                                  minute: "2-digit",
                                              })
                                            : null

                                        return (
                                            <td key={d.id} className="py-2.5 px-3 text-center">
                                                {attended ? (
                                                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                                        <CheckCircle2 size={11} /> {timeStr || "Sí"}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded text-[var(--color-text-muted)] opacity-60">
                                                        <XCircle size={11} /> No
                                                    </span>
                                                )}
                                            </td>
                                        )
                                    })}

                                    {/* Primer Registro */}
                                    <td className="py-2.5 px-3 text-[var(--color-text-muted)]">
                                        {row.firstAttendedAt ? (
                                            <span className="flex items-center gap-1 text-[11px]">
                                                <Calendar size={11} />
                                                {new Date(row.firstAttendedAt).toLocaleString("es-CO", {
                                                    day: "numeric",
                                                    month: "short",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </span>
                                        ) : (
                                            "—"
                                        )}
                                    </td>

                                    {/* Staff */}
                                    <td className="py-2.5 px-3 text-[var(--color-text-muted)] text-[11px]">
                                        <div className="font-medium text-[var(--color-text)]">{row.registeredBy}</div>
                                        {row.ipAddress && row.ipAddress !== "N/A" && (
                                            <div className="text-[9px] text-[var(--color-text-muted)]">IP: {row.ipAddress}</div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-[var(--color-text-muted)]">
                        Página <span className="font-semibold text-[var(--color-text)]">{page}</span> de{" "}
                        <span className="font-semibold text-[var(--color-text)]">{totalPages}</span>
                    </span>

                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1 || isPending}
                            className="p-1.5 rounded border border-[var(--color-border)] hover:bg-[var(--color-background)] disabled:opacity-40 transition-colors"
                        >
                            <ChevronLeft size={14} />
                        </button>
                        <button
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages || isPending}
                            className="p-1.5 rounded border border-[var(--color-border)] hover:bg-[var(--color-background)] disabled:opacity-40 transition-colors"
                        >
                            <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            )}
        </section>
    )
}

