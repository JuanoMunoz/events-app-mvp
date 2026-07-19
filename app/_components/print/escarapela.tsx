import Barcode from "./barcode"
import type { GafeteData } from "./gafete"

interface EscarapelaProps {
    data: GafeteData
}

/**
 * Escarapela / wristband para imprimir.
 * Diseño angosto tipo manilla: ~25mm × 250mm de ancho.
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
                padding: "2mm 4mm",
                background: "#ffffff",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: "5mm",
                fontFamily: "system-ui, -apple-system, sans-serif",
                boxSizing: "border-box",
                border: "1px solid rgba(39,38,53,0.18)",
                borderRadius: "4px",
            }}
        >
            {/* Franja de color con nombre del evento */}
            <div
                style={{
                    background: "#125AF5",
                    borderRadius: "2px",
                    padding: "1mm 3mm",
                    flexShrink: 0,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    minWidth: "40mm",
                }}
            >
                <p
                    style={{
                        fontSize: "6pt",
                        color: "rgba(255,255,255,0.7)",
                        margin: 0,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                    }}
                >
                    {data.eventName}
                </p>
                <p
                    style={{
                        fontSize: "9pt",
                        fontWeight: 700,
                        color: "#ffffff",
                        margin: "0.5mm 0 0",
                        lineHeight: 1.1,
                    }}
                >
                    {data.assistantName}
                </p>
            </div>

            {/* Barcode — ocupa el resto del ancho */}
            <div style={{ flex: 1 }}>
                <Barcode
                    value={barcodeValue}
                    height={36}
                    fontSize={9}
                    displayValue
                />
            </div>
        </div>
    )
}
