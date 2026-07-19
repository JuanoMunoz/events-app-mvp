"use client"

import { useTransition } from "react"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts"
import { Download, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { exportTableToExcelAction } from "../analytics-actions"

interface CityData {
    id: number
    name: string
    totalEvents: number
    totalAttendees: number
    avgAttendeesPerEvent: number
}

interface Props {
    cities: CityData[]
}

function downloadBase64(base64: string, filename: string) {
    const link = document.createElement("a")
    link.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${base64}`
    link.download = filename
    link.click()
}

export default function CityRanking({ cities }: Props) {
    const [isExporting, startExportTransition] = useTransition()

    function handleExport() {
        startExportTransition(async () => {
            const res = await exportTableToExcelAction("city-ranking")
            if ("error" in res) {
                toast.error(res.error)
            } else {
                downloadBase64(res.base64, res.filename)
                toast.success("Archivo descargado")
            }
        })
    }

    const top10 = cities.slice(0, 10)

    return (
        <section>
            <div className="flex items-center justify-between mb-3">
                <h2
                    className="text-xs uppercase tracking-widest font-medium"
                    style={{ color: "var(--color-text-muted)" }}
                >
                    Ranking de Ciudades
                </h2>
                <button
                    onClick={handleExport}
                    disabled={isExporting || cities.length === 0}
                    className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-sm transition-colors"
                    style={{
                        color: "var(--color-primary)",
                        border: "1px solid var(--color-border)",
                        background: "var(--color-surface)",
                        opacity: cities.length === 0 ? 0.5 : 1,
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
                className="flex flex-col gap-5 p-4 rounded-sm"
                style={{
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                }}
            >
                {cities.length === 0 ? (
                    <p
                        className="text-xs text-center py-6"
                        style={{ color: "var(--color-text-muted)" }}
                    >
                        Sin datos de ciudades disponibles
                    </p>
                ) : (
                    <>
                        {/* Dos gráficas lado a lado */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {/* Eventos por ciudad */}
                            <div>
                                <p
                                    className="text-[10px] uppercase tracking-widest mb-3 font-medium"
                                    style={{ color: "var(--color-text-muted)" }}
                                >
                                    Eventos por ciudad
                                </p>
                                <ResponsiveContainer width="100%" height={180}>
                                    <BarChart
                                        data={[...top10].sort(
                                            (a, b) => b.totalEvents - a.totalEvents
                                        )}
                                        layout="vertical"
                                        margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
                                        barSize={14}
                                    >
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            stroke="var(--color-border)"
                                            horizontal={false}
                                        />
                                        <XAxis
                                            type="number"
                                            tick={{ fontSize: 10, fill: "var(--color-text-muted)" }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <YAxis
                                            type="category"
                                            dataKey="name"
                                            tick={{ fontSize: 11, fill: "var(--color-text)" }}
                                            axisLine={false}
                                            tickLine={false}
                                            width={80}
                                        />
                                        <Tooltip
                                            cursor={{ fill: "rgba(18,90,245,0.04)" }}
                                            contentStyle={{
                                                background: "var(--color-surface)",
                                                border: "1px solid var(--color-border)",
                                                borderRadius: "4px",
                                                fontSize: "12px",
                                            }}
                                            formatter={(val: any) => [`${val ?? 0} eventos`, "Total"]}
                                        />
                                        <Bar
                                            dataKey="totalEvents"
                                            fill="var(--color-primary)"
                                            radius={[0, 3, 3, 0]}
                                            fillOpacity={0.85}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Asistentes por ciudad */}
                            <div>
                                <p
                                    className="text-[10px] uppercase tracking-widest mb-3 font-medium"
                                    style={{ color: "var(--color-text-muted)" }}
                                >
                                    Asistentes por ciudad
                                </p>
                                <ResponsiveContainer width="100%" height={180}>
                                    <BarChart
                                        data={top10}
                                        layout="vertical"
                                        margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
                                        barSize={14}
                                    >
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            stroke="var(--color-border)"
                                            horizontal={false}
                                        />
                                        <XAxis
                                            type="number"
                                            tick={{ fontSize: 10, fill: "var(--color-text-muted)" }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <YAxis
                                            type="category"
                                            dataKey="name"
                                            tick={{ fontSize: 11, fill: "var(--color-text)" }}
                                            axisLine={false}
                                            tickLine={false}
                                            width={80}
                                        />
                                        <Tooltip
                                            cursor={{ fill: "rgba(225,131,53,0.04)" }}
                                            contentStyle={{
                                                background: "var(--color-surface)",
                                                border: "1px solid var(--color-border)",
                                                borderRadius: "4px",
                                                fontSize: "12px",
                                            }}
                                            formatter={(val: any) => [
                                                `${(val ?? 0).toLocaleString("es-CO")} asistentes`,
                                                "Total",
                                            ]}
                                        />
                                        <Bar
                                            dataKey="totalAttendees"
                                            fill="var(--color-accent)"
                                            radius={[0, 3, 3, 0]}
                                            fillOpacity={0.85}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Tabla resumen */}
                        <div>
                            <p
                                className="text-[10px] uppercase tracking-widest mb-2 font-medium"
                                style={{ color: "var(--color-text-muted)" }}
                            >
                                Detalle por ciudad
                            </p>
                            <div className="overflow-x-auto">
                                <table
                                    className="w-full text-xs"
                                    style={{ borderCollapse: "collapse" }}
                                >
                                    <thead>
                                        <tr
                                            style={{
                                                borderBottom: "1px solid var(--color-border)",
                                            }}
                                        >
                                            {["Ciudad", "Eventos", "Asistentes", "Promedio/Evento"].map(
                                                (h) => (
                                                    <th
                                                        key={h}
                                                        className="text-left py-1.5 pr-4 text-[10px] uppercase tracking-wider font-medium"
                                                        style={{ color: "var(--color-text-muted)" }}
                                                    >
                                                        {h}
                                                    </th>
                                                )
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cities.map((c) => (
                                            <tr
                                                key={c.id}
                                                style={{
                                                    borderBottom: "1px solid var(--color-border)",
                                                }}
                                            >
                                                <td
                                                    className="py-2 pr-4 font-medium"
                                                    style={{ color: "var(--color-text)" }}
                                                >
                                                    {c.name}
                                                </td>
                                                <td
                                                    className="py-2 pr-4"
                                                    style={{ color: "var(--color-text)" }}
                                                >
                                                    {c.totalEvents}
                                                </td>
                                                <td
                                                    className="py-2 pr-4"
                                                    style={{ color: "var(--color-text)" }}
                                                >
                                                    {c.totalAttendees.toLocaleString("es-CO")}
                                                </td>
                                                <td
                                                    className="py-2"
                                                    style={{ color: "var(--color-text)" }}
                                                >
                                                    {c.avgAttendeesPerEvent.toLocaleString("es-CO")}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </section>
    )
}
