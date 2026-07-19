"use client"

import { useState, useTransition, useCallback } from "react"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts"
import { BarChart2, ChevronDown, Download, Loader2 } from "lucide-react"
import { toast } from "sonner"
import {
    getAttendanceByEventDayAction,
    exportTableToExcelAction,
} from "../analytics-actions"

interface Event {
    id: string
    name: string
    startDate: string
}

interface DayData {
    id: string
    label: string
    date: string
    attendees: number
}

interface Props {
    events: Event[]
}

function downloadBase64(base64: string, filename: string) {
    const link = document.createElement("a")
    link.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${base64}`
    link.download = filename
    link.click()
}

export default function AttendanceByEvent({ events }: Props) {
    const [selectedEventId, setSelectedEventId] = useState<string>("")
    const [days, setDays] = useState<DayData[]>([])
    const [isPending, startTransition] = useTransition()
    const [isExporting, startExportTransition] = useTransition()
    const [activeIndex, setActiveIndex] = useState<number | null>(null)

    const handleEventChange = useCallback(
        (eventId: string) => {
            setSelectedEventId(eventId)
            if (!eventId) {
                setDays([])
                return
            }
            startTransition(async () => {
                const res = await getAttendanceByEventDayAction(eventId)
                if ("error" in res) {
                    toast.error(res.error)
                } else {
                    setDays(res.days)
                }
            })
        },
        []
    )

    function handleExport() {
        if (!selectedEventId) return
        startExportTransition(async () => {
            const res = await exportTableToExcelAction(
                "attendance-by-event",
                selectedEventId
            )
            if ("error" in res) {
                toast.error(res.error)
            } else {
                downloadBase64(res.base64, res.filename)
                toast.success("Archivo descargado")
            }
        })
    }

    const maxAttendees = Math.max(...days.map((d) => d.attendees), 1)

    return (
        <section>
            {/* Cabecera de sección */}
            <div className="flex items-center justify-between mb-3">
                <h2
                    className="text-xs uppercase tracking-widest font-medium"
                    style={{ color: "var(--color-text-muted)" }}
                >
                    Asistencia por Evento
                </h2>
                {selectedEventId && days.length > 0 && (
                    <button
                        onClick={handleExport}
                        disabled={isExporting}
                        className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-sm transition-colors"
                        style={{
                            color: "var(--color-primary)",
                            border: "1px solid var(--color-border)",
                            background: "var(--color-surface)",
                        }}
                    >
                        {isExporting ? (
                            <Loader2 size={11} className="animate-spin" />
                        ) : (
                            <Download size={11} />
                        )}
                        Exportar Excel
                    </button>
                )}
            </div>

            {/* Card principal */}
            <div
                className="flex flex-col gap-5 p-4 rounded-sm"
                style={{
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                }}
            >
                {/* Selector de evento */}
                <div className="flex flex-col gap-1.5">
                    <label
                        className="text-[10px] uppercase tracking-widest font-medium"
                        style={{ color: "var(--color-text-muted)" }}
                    >
                        Seleccionar evento
                    </label>
                    <div className="relative">
                        <select
                            value={selectedEventId}
                            onChange={(e) => handleEventChange(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "0.5rem 2rem 0.5rem 0.75rem",
                                fontSize: "0.875rem",
                                background: "var(--color-background)",
                                color: "var(--color-text)",
                                border: "1px solid var(--color-border)",
                                borderRadius: "4px",
                                outline: "none",
                                fontFamily: "inherit",
                                appearance: "none",
                                cursor: "pointer",
                            }}
                        >
                            <option value="">— Elige un evento —</option>
                            {events.map((ev) => (
                                <option key={ev.id} value={ev.id}>
                                    {ev.name}
                                </option>
                            ))}
                        </select>
                        <ChevronDown
                            size={14}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                            style={{ color: "var(--color-text-muted)" }}
                        />
                    </div>
                </div>

                {/* Estado vacío / loading */}
                {!selectedEventId && (
                    <div
                        className="flex flex-col items-center justify-center gap-2 py-10"
                        style={{ color: "var(--color-text-muted)" }}
                    >
                        <BarChart2 size={28} strokeWidth={1} />
                        <p className="text-xs">
                            Selecciona un evento para ver la asistencia por día
                        </p>
                    </div>
                )}

                {isPending && (
                    <div className="flex items-center justify-center py-10">
                        <Loader2
                            size={20}
                            className="animate-spin"
                            style={{ color: "var(--color-text-muted)" }}
                        />
                    </div>
                )}

                {/* Gráficas */}
                {!isPending && selectedEventId && days.length === 0 && (
                    <p
                        className="text-xs text-center py-6"
                        style={{ color: "var(--color-text-muted)" }}
                    >
                        Este evento no tiene días con asistencia registrada.
                    </p>
                )}

                {!isPending && days.length > 0 && (
                    <div className="flex flex-col gap-6">
                        {/* Barras absolutas */}
                        <div>
                            <p
                                className="text-[10px] uppercase tracking-widest mb-3 font-medium"
                                style={{ color: "var(--color-text-muted)" }}
                            >
                                Asistentes por día
                            </p>
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart
                                    data={days}
                                    margin={{ top: 4, right: 0, left: -20, bottom: 0 }}
                                    barSize={days.length <= 4 ? 40 : 28}
                                    onMouseLeave={() => setActiveIndex(null)}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="var(--color-border)"
                                        vertical={false}
                                    />
                                    <XAxis
                                        dataKey="label"
                                        tick={{
                                            fontSize: 11,
                                            fill: "var(--color-text-muted)",
                                        }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        tick={{
                                            fontSize: 11,
                                            fill: "var(--color-text-muted)",
                                        }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip
                                        cursor={{ fill: "rgba(18,90,245,0.04)" }}
                                        contentStyle={{
                                            background: "var(--color-surface)",
                                            border: "1px solid var(--color-border)",
                                            borderRadius: "4px",
                                            fontSize: "12px",
                                            color: "var(--color-text)",
                                        }}
                                        formatter={(val: number) => [
                                            `${val} asistentes`,
                                            "Total",
                                        ]}
                                    />
                                    <Bar
                                        dataKey="attendees"
                                        radius={[3, 3, 0, 0]}
                                        onMouseEnter={(_, idx) => setActiveIndex(idx)}
                                    >
                                        {days.map((_, idx) => (
                                            <Cell
                                                key={idx}
                                                fill={
                                                    activeIndex === idx
                                                        ? "var(--color-primary-hover)"
                                                        : "var(--color-primary)"
                                                }
                                                fillOpacity={activeIndex === null || activeIndex === idx ? 1 : 0.45}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Distribución relativa (caída entre días) */}
                        {days.length > 1 && (
                            <div>
                                <p
                                    className="text-[10px] uppercase tracking-widest mb-3 font-medium"
                                    style={{ color: "var(--color-text-muted)" }}
                                >
                                    Distribución relativa (% vs día 1)
                                </p>
                                <div className="flex flex-col gap-2">
                                    {days.map((d, i) => {
                                        const pct =
                                            days[0].attendees > 0
                                                ? Math.round(
                                                      (d.attendees /
                                                          days[0].attendees) *
                                                          100
                                                  )
                                                : 0
                                        const isFirst = i === 0
                                        return (
                                            <div
                                                key={d.id}
                                                className="flex items-center gap-3"
                                            >
                                                <span
                                                    className="text-xs shrink-0"
                                                    style={{
                                                        width: "90px",
                                                        color: "var(--color-text-muted)",
                                                        fontSize: "11px",
                                                    }}
                                                >
                                                    {d.label}
                                                </span>
                                                <div
                                                    className="flex-1 h-2 rounded-full overflow-hidden"
                                                    style={{
                                                        background: "var(--color-background)",
                                                    }}
                                                >
                                                    <div
                                                        className="h-full rounded-full transition-all"
                                                        style={{
                                                            width: `${pct}%`,
                                                            background: isFirst
                                                                ? "var(--color-primary)"
                                                                : pct >= 80
                                                                ? "var(--color-primary)"
                                                                : pct >= 50
                                                                ? "var(--color-accent)"
                                                                : "var(--color-danger)",
                                                        }}
                                                    />
                                                </div>
                                                <span
                                                    className="text-xs font-semibold shrink-0"
                                                    style={{
                                                        width: "40px",
                                                        textAlign: "right",
                                                        color: isFirst
                                                            ? "var(--color-primary)"
                                                            : pct >= 80
                                                            ? "var(--color-primary)"
                                                            : pct >= 50
                                                            ? "var(--color-accent)"
                                                            : "var(--color-danger)",
                                                    }}
                                                >
                                                    {pct}%
                                                </span>
                                                <span
                                                    className="text-xs shrink-0"
                                                    style={{
                                                        color: "var(--color-text-muted)",
                                                        fontSize: "11px",
                                                    }}
                                                >
                                                    {d.attendees.toLocaleString("es-CO")}
                                                </span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </section>
    )
}
