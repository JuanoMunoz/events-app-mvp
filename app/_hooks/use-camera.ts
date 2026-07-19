"use client"

import { useEffect, useState, useRef } from "react"

export interface UseCameraOptions {
  onFrame?: (video: HTMLVideoElement) => void
}

/**
 * Hook custom para controlar la cámara trasera (environment).
 * Llama al navigator.mediaDevices.getUserMedia con video=true, audio=false,
 * y facingMode='environment'.
 */
export function useCamera({ onFrame }: UseCameraOptions = {}) {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const frameRequestRef = useRef<number | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)

    navigator.mediaDevices
      .getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      })
      .then((mediaStream) => {
        setStream(mediaStream)
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
        }
        setLoading(false)
      })
      .catch((err) => {
        setError(err)
        setLoading(false)
      })

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
      if (frameRequestRef.current) {
        cancelAnimationFrame(frameRequestRef.current)
      }
    }
  }, [])


  useEffect(() => {
    if (!stream || !onFrame) return

    function tick() {
      if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA && onFrame) {
        onFrame(videoRef.current)
      }
      frameRequestRef.current = requestAnimationFrame(tick)
    }

    frameRequestRef.current = requestAnimationFrame(tick)
    return () => {
      if (frameRequestRef.current) {
        cancelAnimationFrame(frameRequestRef.current)
      }
    }
  }, [stream, onFrame])

  return {
    stream,
    error,
    loading,
    videoRef,
  }
}
