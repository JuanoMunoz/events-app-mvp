import Barcode from "./barcode"
import type { GafeteData } from "./gafete"

interface EscarapelaProps {
    data: GafeteData
}

/**
 * Escarapela / wristband para imprimir.
 * Diseño tipo manilla de seguridad: 250mm × 25mm.
 * El div raíz tiene el ID "escarapela-print-area" para react-to-print.
 */
export default function Escarapela({ data }: EscarapelaProps) {
    const barcodeValue = `ATT-${data.attendanceId}`

    return (
        <div
            id="escarapela-print-area"
            style={{
                width: "250mm",
                height: "25mm",
                padding: "0",
                background: "#ffffff",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                boxSizing: "border-box",
                border: "1px solid #cbd5e1",
                borderRadius: "4px",
                overflow: "hidden",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
        >
            {/* ── 1. Solapa de seguridad izquierda (Tear-off / Serial) ── */}
            <div
                style={{
                    width: "18mm",
                    height: "100%",
                    background: "#0f172a",
                    color: "#94a3b8",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "5pt",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    borderRight: "1px dashed #475569",
                    userSelect: "none",
                }}
            >
                <div style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", textAlign: "center" }}>
                    SEC-OFFICIAL
                </div>
            </div>

            {/* ── 2. Bloque del Evento ── */}
            <div
                style={{
                    background: "linear-gradient(135deg, #125af5 0%, #1e293b 100%)",
                    padding: "2mm 4mm",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    minWidth: "48mm",
                    maxWidth: "55mm",
                    color: "#ffffff",
                    boxSizing: "border-box",
                }}
            >
                <span
                    style={{
                        fontSize: "5.5pt",
                        color: "#93c5fd",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                    }}
                >
                    {data.organizationName || "EVENTOS"}
                </span>
                <p
                    style={{
                        fontSize: "8.5pt",
                        fontWeight: 800,
                        color: "#ffffff",
                        margin: "0.5mm 0 0",
                        lineHeight: 1.1,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                    }}
                >
                    {data.eventName}
                </p>
            </div>

            {/* ── 3. Datos del Asistente ── */}
            <div
                style={{
                    padding: "0 4mm",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    minWidth: "65mm",
                    flex: "1 1 auto",
                }}
            >
                <span
                    style={{
                        fontSize: "5.5pt",
                        fontWeight: 700,
                        color: "#125af5",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                    }}
                >
                    PARTICIPANTE ACREDITADO
                </span>
                <h3
                    style={{
                        fontSize: "11pt",
                        fontWeight: 800,
                        color: "#0f172a",
                        margin: "0.2mm 0 0",
                        lineHeight: 1.1,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                    }}
                >
                    {data.assistantName}
                </h3>
                <span
                    style={{
                        fontSize: "7pt",
                        color: "#64748b",
                        fontWeight: 600,
                        marginTop: "0.2mm",
                    }}
                >
                    C.C. {data.identification}
                </span>
            </div>

            {/* ── 4. Código de Barras ── */}
            <div
                style={{
                    height: "100%",
                    padding: "1mm 3mm",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#ffffff",
                    borderLeft: "1px dashed #cbd5e1",
                    minWidth: "55mm",
                }}
            >
                <Barcode
                    value={barcodeValue}
                    height={26}
                    fontSize={7.5}
                    displayValue
                />
            </div>

            {/* ── 5. Cierre / Adhesivo Derecho ── */}
            <div
                style={{
                    width: "16mm",
                    height: "100%",
                    background: "#f1f5f9",
                    borderLeft: "1px solid #cbd5e1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "5pt",
                    fontWeight: 700,
                    color: "#94a3b8",
                }}
            >
                <div style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", textAlign: "center" }}>
                    ADHESIVE SEAL
                </div>
            </div>
        </div>
    )
}
