"use client"

import { useState, useEffect, useRef } from "react"
import { findAssistantByIdentificationAction } from "@/app/(protected)/event/actions"

export type DocumentStatus = "idle" | "checking" | "not_found" | "found" | "already_checked_in"

export interface AssistantData {
    nombre: string
    apellido: string
    telefono: string
    correo: string
}

export function useDocumentLookup(identification: string, eventDayId?: string) {
    const [status, setStatus] = useState<DocumentStatus>("idle")
    const [assistant, setAssistant] = useState<AssistantData | null>(null)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        // Reset status if length is less than 6 (assuming min ID length is around 6)
        if (!identification || identification.length < 5) {
            setStatus("idle")
            setAssistant(null)
            if (timeoutRef.current) clearTimeout(timeoutRef.current)
            return
        }

        // Debounce search
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        
        setStatus("checking")
        timeoutRef.current = setTimeout(async () => {
            try {
                const res = await findAssistantByIdentificationAction(identification, eventDayId)
                if (res?.error) {
                    setStatus("not_found")
                    setAssistant(null)
                } else if (res?.found) {
                    setAssistant(res.assistant || null)
                    if (res.alreadyCheckedIn) {
                        setStatus("already_checked_in")
                    } else {
                        setStatus("found")
                    }
                } else {
                    setStatus("not_found")
                    setAssistant(null)
                }
            } catch (error) {
                setStatus("idle")
            }
        }, 400) // 400ms debounce

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current)
        }
    }, [identification, eventDayId])

    return { status, assistant }
}
