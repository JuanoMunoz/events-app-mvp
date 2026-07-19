"use client"

import { useState, useTransition, useEffect } from "react"
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts"
import { TrendingUp, Loader2 } from "lucide-react"
import { toast } from "sonner"
import {
    getAttendanceTrendAction,
    getAttendanceByHourAction,
} from "../analytics-actions"

type RangeDays = 30 | 90

interface TrendPoint {
    day: string
    total: number
}

interface HourPoint {
    hour: number
    label: string
    total: number
}

interface Props {
    initialTrend: TrendPoint[]
    initialHours: HourPoint[]
}

export default function AttendanceTrend({ initialTrend, initialHours }: Props) {
    const [range, setRange] = useState<RangeDays>(30)
    const [trend, setTrend] = useState<TrendPoint[]>(initialTrend)
    const [hours] = useState<HourPoint[]>(initialHours)
    const [isPending, startTransition] = useTransition()

    useEffect(() => {
        startTransition(async () => {
            const res = await getAttendanceTrendAction(range)
            if ("error" in res) {
                toast.error(res.error)
            } else {
                setTrend(res.trend)
            }
        })
    }, [range])

    // Formatear eje X para no sobrecargar
    function formatDay(iso: string) {
        const d = new Date(iso)
        return d.toLocaleDateString("es-CO", { day: "numeric", month: "short" })
    }

    // Muestra solo 1 de cada N labels para no sobrecargar
    const tickInterval = range === 30 ? 4 : 12

    return (
        <section>
            <div className="flex items-center justify-between mb-3">
                <h2
                    className="text-xs uppercase tracking-widest font-medium"
                    style={{ color: "var(--color-text-muted)" }}
                >
                    Tendencia de Asistencia
                </h2>
                {/* Selector de rango */}
                <div
                    className="flex rounded-sm overflow-hidden"
                    style={{ border: "1px solid var(--color-border)" }}
                >
                    {([30, 90] as RangeDays[]).map((r) => (
                        <button
                            key={r}
                            onClick={() => setRange(r)}
                            className="px-3 py-1 text-xs font-medium transition-colors"
                            style={{
                                background:
                                    range === r
                                        ? "var(--color-primary)"
                                        : "var(--color-surface)",
                                color:
                                    range === r
                                        ? "#fff"
                                        : "var(--color-text-muted)",
                                border: "none",
                                cursor: "pointer",
                            }}
                        >
                            {r} días
                        </button>
                    ))}
                </div>
            </div>

            <div
                className="flex flex-col gap-6 p-4 rounded-sm"
                style={{
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                }}
            >
                {/* Línea de tendencia */}
                <div>
                    <p
                        className="text-[10px] uppercase tracking-widest mb-3 font-medium"
                        style={{ color: "var(--color-text-muted)" }}
                    >
                        Asistencias diarias — últimos {range} días
                    </p>

                    {isPending ? (
                        <div className="flex items-center justify-center h-48">
                            <Loader2
                                size={20}
                                className="animate-spin"
                                style={{ color: "var(--color-text-muted)" }}
                            />
                        </div>
                    ) : trend.length === 0 ? (
                        <div
                            className="flex flex-col items-center justify-center gap-2 py-10"
                            style={{ color: "var(--color-text-muted)" }}
                        >
                            <TrendingUp size={28} strokeWidth={1} />
                            <p className="text-xs">
                                Sin registros en los últimos {range} días
                            </p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart
                                data={trend}
                                margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="var(--color-border)"
                                    vertical={false}
                                />
                                <XAxis
                                    dataKey="day"
                                    tickFormatter={formatDay}
                                    interval={tickInterval}
                                    tick={{ fontSize: 10, fill: "var(--color-text-muted)" }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fontSize: 10, fill: "var(--color-text-muted)" }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: "var(--color-surface)",
                                        border: "1px solid var(--color-border)",
                                        borderRadius: "4px",
                                        fontSize: "12px",
                                        color: "var(--color-text)",
                                    }}
                                    labelFormatter={(v) => formatDay(v as string)}
                                    formatter={(val: number) => [
                                        `${val} asistentes`,
                                        "Total",
                                    ]}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="total"
                                    stroke="var(--color-primary)"
                                    strokeWidth={2}
                                    dot={false}
                                    activeDot={{ r: 4, fill: "var(--color-primary)" }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Histograma por hora */}
                <div>
                    <p
                        className="text-[10px] uppercase tracking-widest mb-3 font-medium"
                        style={{ color: "var(--color-text-muted)" }}
                    >
                        Picos de check-in por hora del día
                    </p>
                    {hours.length === 0 ? (
                        <p
                            className="text-xs text-center py-4"
                            style={{ color: "var(--color-text-muted)" }}
                        >
                            Sin datos de horas registrados
                        </p>
                    ) : (
                        <ResponsiveContainer width="100%" height={160}>
                            <BarChart
                                data={hours}
                                margin={{ top: 4, right: 0, left: -20, bottom: 0 }}
                                barSize={10}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="var(--color-border)"
                                    vertical={false}
                                />
                                <XAxis
                                    dataKey="label"
                                    tick={{ fontSize: 9, fill: "var(--color-text-muted)" }}
                                    axisLine={false}
                                    tickLine={false}
                                    interval={2}
                                />
                                <YAxis
                                    tick={{ fontSize: 10, fill: "var(--color-text-muted)" }}
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
                                    formatter={(val: number) => [`${val} check-ins`, "Total"]}
                                />
                                <Bar
                                    dataKey="total"
                                    fill="var(--color-accent)"
                                    radius={[2, 2, 0, 0]}
                                    fillOpacity={0.85}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
        </section>
    )
}
