import { Suspense } from "react"
import { prisma } from "@/lib/prisma"
import { requireSession } from "@/lib/utils/auth"
import AttendanceForm from "../[id]/_components/attendance-form"

// Modo Kiosko / Auto-registro de Escarapelas
export default async function KioskoEscarapelaPage() {
    await requireSession()

    const now = new Date()

    const dbEvents = await prisma.event.findMany({
        where: { startDate: { lte: now }, endDate: { gte: now } }, // Solo eventos activos por defecto para el kiosko
        include: {
            city:         true,
            organization: true,
            days: { orderBy: { date: "asc" } },
        },
        orderBy: { startDate: "asc" },
    })

    // Ordenar por cercanía a hoy (aunque ya están filtrados por activos, ayuda a mantener el orden si hay varios)
    const nowTime = Date.now()
    dbEvents.sort((a, b) => {
        const diffA = Math.abs(nowTime - new Date(a.startDate).getTime())
        const diffB = Math.abs(nowTime - new Date(b.startDate).getTime())
        return diffA - diffB
    })

    const events = dbEvents.map((e) => ({
        id:               e.id,
        title:            e.name,
        city:             e.city.name,
        date:             e.startDate.toISOString(),
        location:         e.location,
        organizationName: e.organization.name,
        status:           "active" as const,
        days: e.days.map((d) => ({
            id:    d.id,
            date:  d.date.toISOString(),
            label: d.date.toLocaleDateString("es-CO", {
                weekday: "short",
                day:     "numeric",
                month:   "short",
            })
        }))
    }))


    const cities = Array.from(new Set(events.map((e) => e.city))).sort()

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            {/* Header minimalista para Kiosko */}
            <div className="flex items-center justify-center p-6 bg-white border-b border-gray-200 shadow-sm">
                <h1
                    className="text-2xl font-semibold"
                    style={{ fontFamily: "var(--font-galindo)", color: "var(--color-primary)" }}
                >
                    Auto-Registro y Gafetes
                </h1>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-6">
                <div className="w-full max-w-lg">
                    <Suspense fallback={<div className="animate-pulse h-64 bg-gray-200 rounded-md w-full" />}>
                        <AttendanceForm
                            cities={cities}
                            events={events}
                            preselectedEventId={events.length === 1 ? events[0].id : undefined}
                        />
                    </Suspense>
                </div>
            </div>
        </div>
    )
}
