import EventSearch from "./_components/event-search"
import { prisma } from "@/lib/prisma"

export default async function GlobalEventSearchPage() {
  const dbEvents = await prisma.event.findMany({
    orderBy: { startDate: "desc" },
    include: {
      city: true,
      days: {
        include: {
          _count: {
            select: { attendances: true }
          }
        }
      }
    }
  })

  const events = dbEvents.map((event) => {
    const totalAttendees = event.days.reduce((acc, day) => acc + day._count.attendances, 0)
    const now = new Date()
    const start = new Date(event.startDate)
    const end = new Date(event.endDate)
    let status: "active" | "upcoming" | "past" = "past"
    if (now >= start && now <= end) {
      status = "active"
    } else if (now < start) {
      status = "upcoming"
    }

    return {
      id: event.id,
      title: event.name,
      city: event.city.name,
      date: event.startDate.toISOString(),
      time: event.startDate.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }),
      attendees: totalAttendees,
      capacity: event.capacity ?? 0,
      status
    }
  })

  return (
    <div className="flex flex-col gap-6 px-5 py-7 lg:px-8 lg:py-8 max-w-2xl">
      <header>
        <p
          className="text-xs uppercase tracking-widest mb-0.5"
          style={{ color: "var(--color-text-muted)" }}
        >
          Explorar
        </p>
        <h1
          className="text-2xl font-semibold"
          style={{ color: "var(--color-text)" }}
        >
          Buscador de eventos
        </h1>
      </header>

      {/* Buscador de Eventos (Client) */}
      <EventSearch events={events} />
    </div>
  )
}
