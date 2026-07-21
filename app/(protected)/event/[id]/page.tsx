import AttendanceForm from "./_components/attendance-form"
import { prisma } from "@/lib/prisma"

interface EventPageProps {
  params: Promise<{ id: string }>
}

export default async function EventPage({ params }: EventPageProps) {
  const { id } = await params

  // 1. Obtener eventos de la base de datos (incluyendo días y organización)
  const dbEvents = await prisma.event.findMany({
    orderBy: { startDate: "desc" },
    include: {
      city: true,
      organization: true,
      days: {
        orderBy: { date: "asc" }
      }
    }
  })

  // Ordenar por cercanía a hoy
  const nowTime = Date.now()
  dbEvents.sort((a, b) => {
    const diffA = Math.abs(nowTime - new Date(a.startDate).getTime())
    const diffB = Math.abs(nowTime - new Date(b.startDate).getTime())
    return diffA - diffB
  })

  // 2. Transformar eventos
  const events = dbEvents.map((e) => {
    const now = new Date()
    const start = new Date(e.startDate)
    const end = new Date(e.endDate)
    let status: "active" | "upcoming" | "past" = "past"
    if (now >= start && now <= end) {
      status = "active"
    } else if (now < start) {
      status = "upcoming"
    }

    return {
      id: e.id,
      title: e.name,
      city: e.city.name,
      date: e.startDate.toISOString(),
      location: e.location,
      organizationName: e.organization.name,
      status,
      days: e.days.map((d) => ({
        id: d.id,
        date: d.date.toISOString(),
        label: d.date.toLocaleDateString("es-CO", {
          weekday: "short",
          day: "numeric",
          month: "short",
        })
      }))
    }
  })


  // 3. Extraer ciudades únicas
  const cities = Array.from(new Set(dbEvents.map((e) => e.city.name))).sort()

  const currentEvent = events.find((e) => e.id === id)

  return (
    <div className="flex flex-col gap-6 px-5 py-7 lg:px-8 lg:py-8 max-w-2xl">
      <header>
        <p
          className="text-xs uppercase tracking-widest mb-0.5"
          style={{ color: "var(--color-text-muted)" }}
        >
          Registro de asistencia
        </p>
        <h1
          className="text-2xl font-semibold"
          style={{ color: "var(--color-text)" }}
        >
          {currentEvent ? currentEvent.title : "Registrar asistencia"}
        </h1>
      </header>

      {/* AttendanceForm es client — maneja selects, estado de form y loop de escáner */}
      <AttendanceForm
        cities={cities}
        events={events}
        preselectedEventId={currentEvent?.id}
      />
    </div>
  )
}