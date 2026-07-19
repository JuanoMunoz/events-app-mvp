import { redirect } from "next/navigation"
import getAllCitiesAction from "./actions"
import CitiesList from "./_components/cities-list"
import { checkIsSuperAdmin } from "@/lib/utils/auth"

export default async function CitiesPage() {
  const [result, isSuperAdmin] = await Promise.all([
    getAllCitiesAction(),
    checkIsSuperAdmin(),
  ])

  if ("error" in result) redirect("/dashboard/unauthorized")

  // Serializar fechas para el cliente
  const cities = result.cities.map((c) => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
  }))

  return (
    <div className="flex flex-col gap-8 px-5 py-7 lg:px-8 lg:py-8 max-w-3xl">
      {/* Header */}
      <header>
        <p
          className="text-xs uppercase tracking-widest mb-0.5"
          style={{ color: "var(--color-text-muted)" }}
        >
          Administración
        </p>
        <h1 className="text-2xl font-semibold" style={{ color: "var(--color-text)" }}>
          Ciudades
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--color-text-muted)" }}>
          Gestiona las ciudades disponibles para crear eventos.
        </p>
      </header>

      <CitiesList initialCities={cities} isSuperAdmin={isSuperAdmin} />
    </div>
  )
}