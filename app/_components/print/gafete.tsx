import Barcode from "./barcode"

export interface GafeteData {
    attendanceId: string
    eventName: string
    eventDate: string   // ISO string
    assistantName: string
    identification: string
    location?: string | null
    organizationName?: string
}

interface GafeteProps {
    data: GafeteData
}

function formatDateLong(iso: string) {
    try {
        return new Date(iso).toLocaleDateString("es-CO", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
        })
    } catch {
        return iso
    }
}

/**
 * Gafete / badge para imprimir.
 * Dimensiones pensadas para 89mm × 140mm (3.5" × 5.5").
 * El div raíz tiene el ID "gafete-print-area" para react-to-print.
 */
export default function Gafete({ data }: GafeteProps) {
    const barcodeValue = `ATT-${data.attendanceId}`

    return (
        <div
            id="gafete-print-area"
            style={{
                width: "89mm",
                height: "140mm",
                padding: "0",
                background: "#ffffff",
                display: "flex",
                flexDirection: "column",
                fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                boxSizing: "border-box",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                overflow: "hidden",
                position: "relative",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            }}
        >
            {/* ── Ranura superior para cinta / lanyard ── */}
            <div style={{ display: "flex", justifyContent: "center", paddingTop: "3mm", background: "#0f172a" }}>

                <div
                    style={{
                        width: "14mm",
                        height: "3.5mm",
                        borderRadius: "2mm",
                        background: "#ffffff",
                        opacity: 0.3,
                    }}
                />
            </div>

            {/* ── Banner Superior ── */}
            <div
                style={{
                    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #125af5 100%)",
                    padding: "4mm 6mm 6mm",
                    color: "#ffffff",
                    position: "relative",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5mm" }}>
                    <span
                        style={{
                            fontSize: "6.5pt",
                            fontWeight: 700,
                            letterSpacing: "0.12em",
                            textTransform: "uppercase",
                            color: "#93c5fd",
                        }}
                    >
                        {data.organizationName || "EVENTOS OFICIAL"}
                    </span>
                    <span
                        style={{
                            fontSize: "6pt",
                            fontWeight: 600,
                            background: "rgba(255,255,255,0.15)",
                            padding: "1px 6px",
                            borderRadius: "10px",
                            color: "#ffffff",
                        }}
                    >
                        ACREDITACIÓN
                    </span>
                </div>

                <h1
                    style={{
                        fontSize: "13pt",
                        fontWeight: 800,
                        margin: 0,
                        lineHeight: 1.2,
                        letterSpacing: "-0.01em",
                        color: "#ffffff",
                        textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                    }}
                >
                    {data.eventName}
                </h1>

                {data.location && (
                    <p
                        style={{
                            fontSize: "7.5pt",
                            color: "#cbd5e1",
                            margin: "1.5mm 0 0",
                            display: "flex",
                            alignItems: "center",
                            gap: "1mm",
                        }}
                    >
                        <span>📍</span> {data.location}
                    </p>
                )}
            </div>

            {/* ── Franja de fecha ── */}
            <div
                style={{
                    background: "#f8fafc",
                    borderBottom: "1px solid #e2e8f0",
                    padding: "2mm 6mm",
                    fontSize: "7.5pt",
                    color: "#64748b",
                    fontWeight: 600,
                    textTransform: "capitalize",
                }}
            >
                🗓️ {formatDateLong(data.eventDate)}
            </div>

            {/* ── Cuerpo: Datos del Asistente ── */}
            <div
                style={{
                    flex: 1,
                    padding: "5mm 6mm",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    textAlign: "center",
                    background: "#ffffff",
                    gap: "2.5mm",
                }}
            >
                {/* Categoría / Tag */}
                <span
                    style={{
                        fontSize: "7pt",
                        fontWeight: 700,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: "#125af5",
                        background: "rgba(18, 90, 245, 0.08)",
                        padding: "1.5mm 4mm",
                        borderRadius: "20px",
                        border: "1px solid rgba(18, 90, 245, 0.2)",
                    }}
                >
                    PARTICIPANTE
                </span>

                {/* Nombre Completo */}
                <h2
                    style={{
                        fontSize: "17pt",
                        fontWeight: 800,
                        color: "#0f172a",
                        margin: "1mm 0 0",
                        lineHeight: 1.15,
                        letterSpacing: "-0.02em",
                        wordBreak: "break-word",
                    }}
                >
                    {data.assistantName}
                </h2>

                {/* Cédula */}
                <div
                    style={{
                        fontSize: "8.5pt",
                        color: "#475569",
                        fontWeight: 600,
                        background: "#f1f5f9",
                        padding: "1mm 3mm",
                        borderRadius: "4px",
                        marginTop: "1mm",
                    }}
                >
                    C.C. {data.identification}
                </div>
            </div>

            {/* ── Código de barras inferior ── */}
            <div
                style={{
                    background: "#ffffff",
                    borderTop: "1px dashed #cbd5e1",
                    padding: "3mm 4mm 4mm",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Barcode
                    value={barcodeValue}
                    height={38}
                    fontSize={8.5}
                    displayValue
                />
            </div>
        </div>
    )
}
