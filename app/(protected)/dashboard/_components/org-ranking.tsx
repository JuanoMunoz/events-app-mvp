"use client"

import { useTransition } from "react"
import { Download, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { exportTableToExcelAction } from "../analytics-actions"

interface OrgData {
    id: string
    name: string
    totalEvents: number
    totalAttendees: number
    occupancyRate: number | null
}

interface Props {
    orgs: OrgData[]
}

function downloadBase64(base64: string, filename: string) {
    const link = document.createElement("a")
    link.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${base64}`
    link.download = filename
    link.click()
}

export default function OrgRanking({ orgs }: Props) {
    const [isExporting, startExportTransition] = useTransition()
    const maxAttendees = Math.max(...orgs.map((o) => o.totalAttendees), 1)

    function handleExport() {
        startExportTransition(async () => {
            const res = await exportTableToExcelAction("org-ranking")
            if ("error" in res) {
                toast.error(res.error)
            } else {
                downloadBase64(res.base64, res.filename)
                toast.success("Archivo descargado")
            }
        })
    }

    return (
        <section>
            <div className="flex items-center justify-between mb-3">
                <h2
                    className="text-xs uppercase tracking-widest font-medium"
                    style={{ color: "var(--color-text-muted)" }}
                >
                    Ranking de Organizaciones
                </h2>
                <button
                    onClick={handleExport}
                    disabled={isExporting || orgs.length === 0}
                    className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-sm transition-colors"
                    style={{
                        color: "var(--color-primary)",
                        border: "1px solid var(--color-border)",
                        background: "var(--color-surface)",
                        opacity: orgs.length === 0 ? 0.5 : 1,
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
                className="flex flex-col gap-1 p-4 rounded-sm"
                style={{
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                }}
            >
                {orgs.length === 0 ? (
                    <p
                        className="text-xs text-center py-6"
                        style={{ color: "var(--color-text-muted)" }}
                    >
                        Sin datos de organizaciones disponibles
                    </p>
                ) : (
                    <>
                        {/* Cabecera de tabla */}
                        <div
                            className="grid text-[10px] uppercase tracking-wider font-medium py-1.5 gap-3"
                            style={{
                                color: "var(--color-text-muted)",
                                gridTemplateColumns: "1fr 70px 90px 80px 120px",
                                borderBottom: "1px solid var(--color-border)",
                            }}
                        >
                            <span>Organización</span>
                            <span className="text-right">Eventos</span>
                            <span className="text-right">Asistentes</span>
                            <span className="text-right">Ocupación</span>
                            <span>Barra</span>
                        </div>

                        {/* Filas */}
                        {orgs.map((o, i) => {
                            const barWidth = Math.round(
                                (o.totalAttendees / maxAttendees) * 100
                            )
                            return (
                                <div
                                    key={o.id}
                                    className="grid items-center gap-3 py-2.5"
                                    style={{
                                        gridTemplateColumns: "1fr 70px 90px 80px 120px",
                                        borderBottom:
                                            i < orgs.length - 1
                                                ? "1px solid var(--color-border)"
                                                : "none",
                                    }}
                                >
                                    <span
                                        className="text-sm font-medium truncate"
                                        style={{ color: "var(--color-text)" }}
                                    >
                                        {o.name}
                                    </span>
                                    <span
                                        className="text-sm text-right"
                                        style={{ color: "var(--color-text)" }}
                                    >
                                        {o.totalEvents}
                                    </span>
                                    <span
                                        className="text-sm text-right font-semibold"
                                        style={{ color: "var(--color-primary)" }}
                                    >
                                        {o.totalAttendees.toLocaleString("es-CO")}
                                    </span>
                                    <span
                                        className="text-sm text-right"
                                        style={{
                                            color:
                                                o.occupancyRate === null
                                                    ? "var(--color-text-muted)"
                                                    : o.occupancyRate >= 80
                                                    ? "var(--color-primary)"
                                                    : o.occupancyRate >= 50
                                                    ? "var(--color-accent)"
                                                    : "var(--color-danger)",
                                            fontWeight: 600,
                                        }}
                                    >
                                        {o.occupancyRate !== null
                                            ? `${o.occupancyRate}%`
                                            : "—"}
                                    </span>
                                    {/* Mini barra */}
                                    <div
                                        className="h-1.5 rounded-full overflow-hidden"
                                        style={{ background: "var(--color-background)" }}
                                    >
                                        <div
                                            className="h-full rounded-full transition-all"
                                            style={{
                                                width: `${barWidth}%`,
                                                background: "var(--color-primary)",
                                                opacity: 0.75,
                                            }}
                                        />
                                    </div>
                                </div>
                            )
                        })}
                    </>
                )}
            </div>
        </section>
    )
}
