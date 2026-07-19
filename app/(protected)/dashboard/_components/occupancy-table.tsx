"use client"

import { useState, useTransition } from "react"
import { ChevronUp, ChevronDown as ChevronDownIcon, Download, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { exportTableToExcelAction } from "../analytics-actions"

interface EventOccupancy {
    id: string
    name: string
    city: string
    date: string
    capacity: number
    totalAttendees: number
    occupancyPct: number | null
}

interface Props {
    events: EventOccupancy[]
}

type SortKey = "name" | "capacity" | "totalAttendees" | "occupancyPct"
type SortDir = "asc" | "desc"

function downloadBase64(base64: string, filename: string) {
    const link = document.createElement("a")
    link.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${base64}`
    link.download = filename
    link.click()
}

export default function OccupancyTable({ events }: Props) {
    const [sortKey, setSortKey] = useState<SortKey>("occupancyPct")
    const [sortDir, setSortDir] = useState<SortDir>("asc")
    const [isExporting, startExportTransition] = useTransition()

    function handleSort(key: SortKey) {
        if (sortKey === key) {
            setSortDir((d) => (d === "asc" ? "desc" : "asc"))
        } else {
            setSortKey(key)
            setSortDir("asc")
        }
    }

    const sorted = [...events].sort((a, b) => {
        let va: number | string = a[sortKey] ?? 999
        let vb: number | string = b[sortKey] ?? 999
        if (typeof va === "string") va = va.toLowerCase()
        if (typeof vb === "string") vb = vb.toLowerCase()
        if (va < vb) return sortDir === "asc" ? -1 : 1
        if (va > vb) return sortDir === "asc" ? 1 : -1
        return 0
    })

    function handleExport() {
        startExportTransition(async () => {
            const res = await exportTableToExcelAction("occupancy")
            if ("error" in res) {
                toast.error(res.error)
            } else {
                downloadBase64(res.base64, res.filename)
                toast.success("Archivo descargado")
            }
        })
    }

    const SortIcon = ({ col }: { col: SortKey }) => {
        if (sortKey !== col)
            return (
                <ChevronDownIcon
                    size={10}
                    style={{ color: "var(--color-border)" }}
                />
            )
        return sortDir === "asc" ? (
            <ChevronUp size={10} style={{ color: "var(--color-primary)" }} />
        ) : (
            <ChevronDownIcon
                size={10}
                style={{ color: "var(--color-primary)" }}
            />
        )
    }

    const columns: { key: SortKey; label: string; align?: "right" }[] = [
        { key: "name", label: "Evento" },
        { key: "capacity", label: "Capacidad", align: "right" },
        { key: "totalAttendees", label: "Asistentes", align: "right" },
        { key: "occupancyPct", label: "% Ocupación", align: "right" },
    ]

    return (
        <section>
            <div className="flex items-center justify-between mb-3">
                <h2
                    className="text-xs uppercase tracking-widest font-medium"
                    style={{ color: "var(--color-text-muted)" }}
                >
                    Ocupación por Evento
                </h2>
                <button
                    onClick={handleExport}
                    disabled={isExporting || events.length === 0}
                    className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-sm transition-colors"
                    style={{
                        color: "var(--color-primary)",
                        border: "1px solid var(--color-border)",
                        background: "var(--color-surface)",
                        opacity: events.length === 0 ? 0.5 : 1,
                    }}
                >
                    {isExporting ? (
                        <Loader2 size={11} className="animate-spin" />
                    ) : (
                        <Download size={11} />
                    )}
                    Exportar Excel
                </button>
            </div>

            <div
                className="rounded-sm overflow-hidden"
                style={{
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                }}
            >
                {events.length === 0 ? (
                    <p
                        className="text-xs text-center py-6"
                        style={{ color: "var(--color-text-muted)" }}
                    >
                        Sin eventos con capacidad registrada
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table
                            className="w-full text-xs"
                            style={{ borderCollapse: "collapse" }}
                        >
                            <thead>
                                <tr
                                    style={{
                                        background: "var(--color-background)",
                                        borderBottom: "1px solid var(--color-border)",
                                    }}
                                >
                                    {columns.map((col) => (
                                        <th
                                            key={col.key}
                                            className={`py-2.5 px-4 cursor-pointer select-none text-[10px] uppercase tracking-wider font-medium whitespace-nowrap ${col.align === "right" ? "text-right" : "text-left"}`}
                                            style={{ color: "var(--color-text-muted)" }}
                                            onClick={() => handleSort(col.key)}
                                        >
                                            <span className="inline-flex items-center gap-1">
                                                {col.label}
                                                <SortIcon col={col.key} />
                                            </span>
                                        </th>
                                    ))}
                                    <th className="py-2.5 px-4 text-left text-[10px] uppercase tracking-wider font-medium" style={{ color: "var(--color-text-muted)" }}>
                                        Ciudad
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {sorted.map((ev, i) => {
                                    const pct = ev.occupancyPct
                                    const color =
                                        pct === null
                                            ? "var(--color-text-muted)"
                                            : pct >= 80
                                            ? "var(--color-primary)"
                                            : pct >= 50
                                            ? "var(--color-accent)"
                                            : "var(--color-danger)"

                                    return (
                                        <tr
                                            key={ev.id}
                                            style={{
                                                borderBottom:
                                                    i < sorted.length - 1
                                                        ? "1px solid var(--color-border)"
                                                        : "none",
                                            }}
                                        >
                                            <td
                                                className="py-2.5 px-4 font-medium"
                                                style={{
                                                    color: "var(--color-text)",
                                                    maxWidth: "200px",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                {ev.name}
                                            </td>
                                            <td
                                                className="py-2.5 px-4 text-right"
                                                style={{ color: "var(--color-text)" }}
                                            >
                                                {ev.capacity.toLocaleString("es-CO")}
                                            </td>
                                            <td
                                                className="py-2.5 px-4 text-right font-semibold"
                                                style={{ color: "var(--color-text)" }}
                                            >
                                                {ev.totalAttendees.toLocaleString("es-CO")}
                                            </td>
                                            <td className="py-2.5 px-4 text-right">
                                                <span
                                                    className="font-semibold px-2 py-0.5 rounded-sm text-[10px]"
                                                    style={{
                                                        color,
                                                        background:
                                                            pct === null
                                                                ? "transparent"
                                                                : `${color}18`,
                                                    }}
                                                >
                                                    {pct !== null ? `${pct}%` : "—"}
                                                </span>
                                            </td>
                                            <td
                                                className="py-2.5 px-4"
                                                style={{ color: "var(--color-text-muted)" }}
                                            >
                                                {ev.city}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </section>
    )
}
