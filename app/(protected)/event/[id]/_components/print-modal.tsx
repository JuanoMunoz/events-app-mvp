"use client"

import { useState } from "react"
import { Printer, X } from "lucide-react"
import { usePrinter } from "@/app/_hooks/use-printer"
import Gafete from "@/app/_components/print/gafete"
import Escarapela from "@/app/_components/print/escarapela"
import type { GafeteData } from "@/app/_components/print/gafete"

interface PrintModalProps {
    isOpen: boolean
    onClose: () => void
    data: GafeteData | null
}

export default function PrintModal({ isOpen, onClose, data }: PrintModalProps) {
    const [activeTab, setActiveTab] = useState<"gafete" | "escarapela">("gafete")
    const { gafeteRef, escarapelaRef, printGafete, printEscarapela } = usePrinter()

    if (!isOpen || !data) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div
                className="w-full max-w-3xl flex flex-col rounded-sm shadow-2xl overflow-hidden"
                style={{
                    background: "var(--color-background)",
                    maxHeight: "90vh",
                }}
            >
                {/* Header */}
                <div
                    className="flex items-center justify-between px-5 py-4"
                    style={{
                        background: "var(--color-surface)",
                        borderBottom: "1px solid var(--color-border)",
                    }}
                >
                    <h2
                        className="text-lg font-semibold"
                        style={{ color: "var(--color-text)" }}
                    >
                        Imprimir credencial
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-sm hover:bg-black/5 transition-colors"
                        style={{ color: "var(--color-text-muted)" }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div
                    className="flex px-5 pt-3 gap-6"
                    style={{
                        background: "var(--color-surface)",
                        borderBottom: "1px solid var(--color-border)",
                    }}
                >
                    {(["gafete", "escarapela"] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className="pb-3 text-sm font-medium uppercase tracking-wider transition-colors relative"
                            style={{
                                color:
                                    activeTab === tab
                                        ? "var(--color-primary)"
                                        : "var(--color-text-muted)",
                            }}
                        >
                            {tab}
                            {activeTab === tab && (
                                <div
                                    className="absolute bottom-0 left-0 right-0 h-0.5"
                                    style={{ background: "var(--color-primary)" }}
                                />
                            )}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center gap-6">
                    <p
                        className="text-sm text-center"
                        style={{ color: "var(--color-text-muted)" }}
                    >
                        Previsualización del diseño a imprimir. Asegúrate de configurar el tamaño de papel correcto en el diálogo de impresión.
                    </p>

                    {/* Previews */}
                    <div
                        className="w-full flex justify-center bg-black/5 p-6 rounded-sm overflow-x-auto"
                        style={{ border: "1px solid var(--color-border)" }}
                    >
                        <div style={{ display: activeTab === "gafete" ? "block" : "none" }}>
                            <div ref={gafeteRef}>
                                <Gafete data={data} />
                            </div>
                        </div>
                        <div style={{ display: activeTab === "escarapela" ? "block" : "none" }}>
                            <div ref={escarapelaRef}>
                                <Escarapela data={data} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div
                    className="flex items-center justify-end gap-3 px-5 py-4"
                    style={{
                        background: "var(--color-surface)",
                        borderTop: "1px solid var(--color-border)",
                    }}
                >
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium rounded-sm transition-colors"
                        style={{
                            color: "var(--color-text)",
                            background: "transparent",
                            border: "1px solid var(--color-border)",
                        }}
                    >
                        Cerrar
                    </button>
                    <button
                        onClick={activeTab === "gafete" ? () => printGafete() : () => printEscarapela()}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-sm transition-colors"
                        style={{
                            color: "#fff",
                            background: "var(--color-primary)",
                            border: "none",
                        }}
                    >
                        <Printer size={16} />
                        Imprimir {activeTab}
                    </button>
                </div>
            </div>
        </div>
    )
}
