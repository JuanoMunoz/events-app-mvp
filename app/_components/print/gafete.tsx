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
    return new Date(iso).toLocaleDateString("es-CO", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    })
}

/**
 * Gafete / badge para imprimir.
 * Dimensiones pensadas para 3.5" × 5.5" (89 × 140 mm).
 * El div raíz tiene el ID "gafete-print-area" para react-to-print.
 */
export default function Gafete({ data }: GafeteProps) {
    const barcodeValue = `ATT-${data.attendanceId}`

    return (
        <div
            id="gafete-print-area"
            style={{
                width: "89mm",
                minHeight: "140mm",
                padding: "6mm",
                background: "#ffffff",
                display: "flex",
                flexDirection: "column",
                gap: "4mm",
                fontFamily: "system-ui, -apple-system, sans-serif",
                boxSizing: "border-box",
                border: "1px solid rgba(39,38,53,0.18)",
                borderRadius: "4px",
            }}
        >
            {/* Encabezado con nombre del evento */}
            <div
                style={{
                    background: "#125AF5",
                    margin: "-6mm -6mm 0",
                    padding: "4mm 6mm",
                    borderRadius: "4px 4px 0 0",
                }}
            >
                <p
                    style={{
                        fontSize: "7pt",
                        color: "rgba(255,255,255,0.7)",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        margin: 0,
                    }}
                >
                    {data.organizationName ?? "Evento"}
                </p>
                <h1
                    style={{
                        fontSize: "12pt",
                        fontWeight: 700,
                        color: "#ffffff",
                        margin: "1mm 0 0",
                        lineHeight: 1.2,
                    }}
                >
                    {data.eventName}
                </h1>
                {data.location && (
                    <p
                        style={{
                            fontSize: "8pt",
                            color: "rgba(255,255,255,0.75)",
                            margin: "1mm 0 0",
                        }}
                    >
                        📍 {data.location}
                    </p>
                )}
            </div>

            {/* Fecha */}
            <p
                style={{
                    fontSize: "8pt",
                    color: "#7c7c7c",
                    textTransform: "capitalize",
                    margin: 0,
                }}
            >
                {formatDateLong(data.eventDate)}
            </p>

            {/* Nombre del asistente */}
            <div
                style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    gap: "2mm",
                    padding: "4mm 0",
                    borderTop: "1px solid rgba(39,38,53,0.12)",
                    borderBottom: "1px solid rgba(39,38,53,0.12)",
                }}
            >
                <p
                    style={{
                        fontSize: "7pt",
                        color: "#7c7c7c",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        margin: 0,
                    }}
                >
                    Participante
                </p>
                <h2
                    style={{
                        fontSize: "18pt",
                        fontWeight: 700,
                        color: "#272635",
                        margin: 0,
                        lineHeight: 1.15,
                    }}
                >
                    {data.assistantName}
                </h2>
                <p
                    style={{
                        fontSize: "9pt",
                        color: "#7c7c7c",
                        margin: 0,
                    }}
                >
                    C.C. {data.identification}
                </p>
            </div>

            {/* Código de barras */}
            <div style={{ marginTop: "2mm" }}>
                <Barcode
                    value={barcodeValue}
                    height={50}
                    fontSize={10}
                    displayValue
                />
            </div>
        </div>
    )
}
