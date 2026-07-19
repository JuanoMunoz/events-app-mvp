"use client"

import { useRef, useEffect } from "react"
import { useCamera } from "@/app/_hooks/use-camera"

export default function DetectionPage() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null)


    const { videoRef, stream, error, loading } = useCamera()

    useEffect(() => {
        if (!stream) return

        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        const intervalId = setInterval(() => {
            const video = videoRef.current
            if (video && video.readyState === video.HAVE_ENOUGH_DATA) {
                if (canvas.width !== video.videoWidth) {
                    canvas.width = video.videoWidth
                    canvas.height = video.videoHeight
                }
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
            }
        }, 500)

        return () => clearInterval(intervalId)
    }, [stream, videoRef])

    return (
        <div className="flex flex-col items-center gap-4 p-6">
            <header className="w-full max-w-md text-left">
                <h1 className="text-lg font-semibold" style={{ color: "var(--color-text)" }}>
                    Escaneo y Detección
                </h1>
                <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                    Alinea la escarapela en el visor para verificar el acceso instantáneamente.
                </p>
            </header>

            {/* Elemento de video oculto */}
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{ display: "none" }}
            />

            {/* Canvas donde se renderiza el video cada 500ms */}
            <div
                className="w-full max-w-md overflow-hidden rounded-sm border"
                style={{
                    borderColor: "var(--color-border)",
                    background: "var(--color-surface)",
                }}
            >
                {loading && (
                    <div className="flex items-center justify-center aspect-video text-xs text-[var(--color-text-muted)]">
                        Iniciando cámara...
                    </div>
                )}
                {error && (
                    <div className="flex items-center justify-center aspect-video text-xs text-[var(--color-danger)] p-4 text-center">
                        Error al acceder a la cámara: {error.message}
                    </div>
                )}
                {!loading && !error && (
                    <canvas
                        ref={canvasRef}
                        className="w-full h-auto aspect-video object-cover"
                    />
                )}
            </div>
        </div>
    )
}
