import CalendarView from "./_components/calendar-view"
import { prisma } from "@/lib/prisma"

export default async function CalendarPage() {

    const dbEventDays = await prisma.eventDay.findMany({
        include: {
            event: {
                include: {
                    city: true,
                }
            },
            _count: {
                select: { attendances: true }
            }
        },
        orderBy: { date: "asc" }
    })

    const events = dbEventDays.map((day) => {
        const now = new Date()
        now.setHours(0, 0, 0, 0)
        const dayDate = new Date(day.date)
        dayDate.setHours(0, 0, 0, 0)

        let status: "active" | "upcoming" | "past" = "past"
        if (dayDate.getTime() === now.getTime()) {
            status = "active"
        } else if (dayDate.getTime() > now.getTime()) {
            status = "upcoming"
        }

        return {
            id: day.id,
            title: day.event.name + (day.title ? ` - ${day.title}` : ""),
            city: day.event.city.name,
            date: day.date.toISOString().split("T")[0],
            time: day.date.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }),
            attendees: day._count.attendances,
            capacity: day.event.capacity ?? 0,
            status
        }
    })

    return (
        <div className="flex flex-col gap-6 px-5 py-7 lg:px-8 lg:py-8 max-w-3xl">
            <header>
                <p
                    className="text-xs uppercase tracking-widest mb-0.5"
                    style={{ color: "var(--color-text-muted)" }}
                >
                    Agenda
                </p>
                <h1
                    className="text-2xl font-semibold"
                    style={{ color: "var(--color-text)" }}
                >
                    Calendario de eventos
                </h1>
            </header>

            {/* CalendarView es client — necesita interacción para seleccionar día */}
            <CalendarView events={events} />
        </div>
    )
}