import { redirect } from "next/navigation"
import { getAllEventsAction } from "./actions"
import getAllCitiesAction from "@/app/(protected)/dashboard/cities/actions"
import { getAllOrganizationsAction } from "@/app/(protected)/dashboard/organization/actions"
import EventsList from "./_components/events-list"
import { checkIsSuperAdmin } from "@/lib/utils/auth"

export default async function EventsPage() {
  const [eventsResult, citiesResult, orgsResult, isSuperAdmin] = await Promise.all([
    getAllEventsAction(),
    getAllCitiesAction(),
    getAllOrganizationsAction(),
    checkIsSuperAdmin(),
  ])

  // if ("error" in eventsResult) redirect("/dashboard/unauthorized")
  if ("error" in citiesResult) redirect("/dashboard/unauthorized")
  if ("error" in orgsResult) redirect("/dashboard/unauthorized")

  // Serializar fechas para el cliente
  const events = (eventsResult as any).events.map((e: any) => ({
    ...e,
    startDate: e.startDate.toISOString(),
    endDate: e.endDate.toISOString(),
    createdAt: e.createdAt.toISOString(),
    days: e.days.map((d: any) => ({ ...d, date: d.date.toISOString() })),
  }))

  const cities = (citiesResult as any).cities.map((c: any) => ({
    id: c.id,
    name: c.name,
  }))

  const organizations = (orgsResult as any).organizations.map((o: any) => ({
    id: o.id,
    name: o.name,
  }))

  return (
    <div className="flex flex-col gap-8 px-5 py-7 lg:px-8 lg:py-8 max-w-4xl">
      {/* Header */}
      <header>
        <p
          className="text-xs uppercase tracking-widest mb-0.5"
          style={{ color: "var(--color-text-muted)" }}
        >
          Administración
        </p>
        <h1 className="text-2xl font-semibold" style={{ color: "var(--color-text)" }}>
          Eventos
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--color-text-muted)" }}>
          Crea y gestiona todos los eventos del sistema.
        </p>
      </header>

      <EventsList
        initialEvents={events}
        cities={cities}
        organizations={organizations}
        isSuperAdmin={isSuperAdmin}
      />
    </div>
  )
}
