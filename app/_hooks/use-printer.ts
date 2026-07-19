"use client"

import { useRef } from "react"
import { useReactToPrint } from "react-to-print"

/**
 * Hook that provides print functions for gafete and escarapela.
 *
 * Usage:
 * ```tsx
 * const { gafeteRef, escarapelaRef, printGafete, printEscarapela } = usePrinter()
 * return (
 *   <>
 *     <div ref={gafeteRef}><Gafete data={...} /></div>
 *     <div ref={escarapelaRef}><Escarapela data={...} /></div>
 *     <button onClick={printGafete}>Imprimir gafete</button>
 *     <button onClick={printEscarapela}>Imprimir escarapela</button>
 *   </>
 * )
 * ```
 */
export function usePrinter() {
    const gafeteRef = useRef<HTMLDivElement>(null)
    const escarapelaRef = useRef<HTMLDivElement>(null)

    const printGafete = useReactToPrint({
        contentRef: gafeteRef,
        documentTitle: "Gafete de Asistencia",
        pageStyle: `
      @page {
        size: 89mm 140mm;
        margin: 0;
      }
      @media print {
        body { margin: 0; padding: 0; }
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      }
    `,
    })

    const printEscarapela = useReactToPrint({
        contentRef: escarapelaRef,
        documentTitle: "Escarapela de Asistencia",
        pageStyle: `
      @page {
        size: 250mm 25mm landscape;
        margin: 0;
      }
      @media print {
        body { margin: 0; padding: 0; }
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      }
    `,
    })

    return { gafeteRef, escarapelaRef, printGafete, printEscarapela }
}
