"use client"

import { useTransition } from "react"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Download, Loader2, QrCode, MousePointer } from "lucide-react"
import { toast } from "sonner"
import { exportTableToExcelAction } from "../analytics-actions"

interface StaffMember {
    userId: string
    name: string
    email: string
    role: string
    totalCheckIns: number
}

interface Props {
    staff: StaffMember[]
    qrCount: number
    manualCount: number
    totalCount: number
}

function downloadBase64(base64: string, filename: string) {
    const link = document.createElement("a")
    link.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${base64}`
    link.download = filename
    link.click()
}

const ROLE_LABELS: Record<string, string> = {
    SUPER_ADMIN: "Admin",
    ORGANIZER: "Organizador",
    STAFF: "Staff",
}

export default function StaffActivity({
    staff,
    qrCount,
    manualCount,
    totalCount,
}: Props) {
    const [isExporting, startExportTransition] = useTransition()

    function handleExport() {
        startExportTransition(async () => {
            const res = await exportTableToExcelAction("staff-activity")
            if ("error" in res) {
                toast.error(res.error)
            } else {
                downloadBase64(res.base64, res.filename)
                toast.success("Archivo descargado")
            }
        })
    }

    const pieData = [
        { name: "QR", value: qrCount, color: "var(--color-primary)" },
        { name: "Manual", value: manualCount, color: "var(--color-accent)" },
    ]

    const maxCheckIns = Math.max(...staff.map((s) => s.totalCheckIns), 1)

    return (
        <section>
            <div className="flex items-center justify-between mb-3">
                <h2
                    className="text-xs uppercase tracking-widest font-medium"
                    style={{ color: "var(--color-text-muted)" }}
                >
                    Actividad de Staff
                </h2>
                <button
                    onClick={handleExport}
                    disabled={isExporting || staff.length === 0}
                    className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-sm transition-colors"
                    style={{
                        color: "var(--color-primary)",
                        border: "1px solid var(--color-border)",
                        background: "var(--color-surface)",
                        opacity: staff.length === 0 ? 0.5 : 1,
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
                className="grid grid-cols-1 lg:grid-cols-3 gap-4"
            >
                {/* Tabla de staff — 2/3 del ancho */}
                <div
                    className="lg:col-span-2 flex flex-col gap-0 rounded-sm overflow-hidden"
                    style={{
                        background: "var(--color-surface)",
                        border: "1px solid var(--color-border)",
                    }}
                >
                    <div
                        className="grid text-[10px] uppercase tracking-wider font-medium py-2.5 px-4 gap-3"
                        style={{
                            color: "var(--color-text-muted)",
                            gridTemplateColumns: "1fr 80px 90px 100px",
                            background: "var(--color-background)",
                            borderBottom: "1px solid var(--color-border)",
                        }}
                    >
                        <span>Usuario</span>
                        <span>Rol</span>
                        <span className="text-right">Check-ins</span>
                        <span>Barra</span>
                    </div>

                    {staff.length === 0 ? (
                        <p
                            className="text-xs text-center py-6"
                            style={{ color: "var(--color-text-muted)" }}
                        >
                            Sin actividad de staff registrada
                        </p>
                    ) : (
                        staff.map((s, i) => {
                            const barWidth = Math.round(
                                (s.totalCheckIns / maxCheckIns) * 100
                            )
                            return (
                                <div
                                    key={s.userId}
                                    className="grid items-center gap-3 px-4 py-2.5"
                                    style={{
                                        gridTemplateColumns: "1fr 80px 90px 100px",
                                        borderBottom:
                                            i < staff.length - 1
                                                ? "1px solid var(--color-border)"
                                                : "none",
                                    }}
                                >
                                    <div className="flex flex-col gap-0.5 min-w-0">
                                        <span
                                            className="text-xs font-medium truncate"
                                            style={{ color: "var(--color-text)" }}
                                        >
                                            {s.name}
                                        </span>
                                        <span
                                            className="text-[10px] truncate"
                                            style={{ color: "var(--color-text-muted)" }}
                                        >
                                            {s.email}
                                        </span>
                                    </div>
                                    <span
                                        className="text-[10px] px-1.5 py-0.5 rounded-sm font-medium"
                                        style={{
                                            color: "var(--color-text-muted)",
                                            background: "var(--color-background)",
                                        }}
                                    >
                                        {ROLE_LABELS[s.role] ?? s.role}
                                    </span>
                                    <span
                                        className="text-sm font-semibold text-right"
                                        style={{ color: "var(--color-primary)" }}
                                    >
                                        {s.totalCheckIns.toLocaleString("es-CO")}
                                    </span>
                                    <div
                                        className="h-1.5 rounded-full overflow-hidden"
                                        style={{ background: "var(--color-background)" }}
                                    >
                                        <div
                                            className="h-full rounded-full transition-all"
                                            style={{
                                                width: `${barWidth}%`,
                                                background: "var(--color-primary)",
                                                opacity: 0.7,
                                            }}
                                        />
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>

                {/* Dona QR vs Manual — 1/3 del ancho */}
                <div
                    className="flex flex-col gap-3 p-4 rounded-sm"
                    style={{
                        background: "var(--color-surface)",
                        border: "1px solid var(--color-border)",
                    }}
                >
                    <p
                        className="text-[10px] uppercase tracking-widest font-medium"
                        style={{ color: "var(--color-text-muted)" }}
                    >
                        QR vs Manual
                    </p>

                    {totalCount === 0 ? (
                        <p
                            className="text-xs text-center py-4"
                            style={{ color: "var(--color-text-muted)" }}
                        >
                            Sin registros
                        </p>
                    ) : (
                        <>
                            <ResponsiveContainer width="100%" height={150}>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={65}
                                        dataKey="value"
                                        strokeWidth={2}
                                        stroke="var(--color-surface)"
                                    >
                                        {pieData.map((entry, idx) => (
                                            <Cell
                                                key={idx}
                                                fill={entry.color}
                                                fillOpacity={0.85}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            background: "var(--color-surface)",
                                            border: "1px solid var(--color-border)",
                                            borderRadius: "4px",
                                            fontSize: "12px",
                                        }}
                                        formatter={(val: any, name: any) => [
                                            `${(val ?? 0).toLocaleString("es-CO")} (${Math.round(((val ?? 0) / totalCount) * 100)}%)`,
                                            name,
                                        ]}
                                    />
                                </PieChart>
                            </ResponsiveContainer>

                            {/* Leyenda manual */}
                            <div className="flex flex-col gap-2">
                                {[
                                    {
                                        label: "QR",
                                        icon: QrCode,
                                        count: qrCount,
                                        color: "var(--color-primary)",
                                    },
                                    {
                                        label: "Manual",
                                        icon: MousePointer,
                                        count: manualCount,
                                        color: "var(--color-accent)",
                                    },
                                ].map(({ label, icon: Icon, count, color }) => (
                                    <div
                                        key={label}
                                        className="flex items-center gap-2"
                                    >
                                        <Icon size={13} style={{ color }} />
                                        <span
                                            className="text-xs flex-1"
                                            style={{ color: "var(--color-text)" }}
                                        >
                                            {label}
                                        </span>
                                        <span
                                            className="text-xs font-semibold"
                                            style={{ color }}
                                        >
                                            {count.toLocaleString("es-CO")}
                                        </span>
                                        <span
                                            className="text-[10px]"
                                            style={{ color: "var(--color-text-muted)" }}
                                        >
                                            ({totalCount > 0 ? Math.round((count / totalCount) * 100) : 0}%)
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </section>
    )
}
