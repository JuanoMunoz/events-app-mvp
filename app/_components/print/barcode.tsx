"use client"

import { useEffect, useRef } from "react"
import JsBarcode from "jsbarcode"

interface BarcodeProps {
    value: string
    height?: number
    fontSize?: number
    displayValue?: boolean
}

/** Renders a Code128 barcode using JsBarcode on an SVG element. */
export default function Barcode({
    value,
    height = 60,
    fontSize = 12,
    displayValue = true,
}: BarcodeProps) {
    const svgRef = useRef<SVGSVGElement>(null)

    useEffect(() => {
        if (!svgRef.current || !value) return
        try {
            JsBarcode(svgRef.current, value, {
                format: "CODE128",
                height,
                fontSize,
                displayValue,
                lineColor: "#272635",
                background: "transparent",
                margin: 0,
                textMargin: 4,
                fontOptions: "bold",
            })
        } catch {
            // valor inválido para el formato — no romper el render
        }
    }, [value, height, fontSize, displayValue])

    return <svg ref={svgRef} className="w-full" />
}
