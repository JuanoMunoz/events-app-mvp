import { redirect } from "next/navigation"
import { getAllOrganizationsAction } from "./actions"
import OrganizationsList from "./_components/organizations-list"
import { checkIsSuperAdmin } from "@/lib/utils/auth"

export default async function OrganizationsPage() {
  const [result, isSuperAdmin] = await Promise.all([
    getAllOrganizationsAction(),
    checkIsSuperAdmin(),
  ])

  if (!isSuperAdmin) redirect("/dashboard/unauthorized")
  if ("error" in result) {
    return <div>{result.error}</div>
  }

  const organizations = result.organizations.map((o) => ({
    ...o,
    createdAt: o.createdAt.toISOString(),
  }))

  return (
    <div className="flex flex-col gap-8 px-5 py-7 lg:px-8 lg:py-8 max-w-3xl">
      <header>
        <p
          className="text-xs uppercase tracking-widest mb-0.5"
          style={{ color: "var(--color-text-muted)" }}
        >
          Administración
        </p>
        <h1 className="text-2xl font-semibold" style={{ color: "var(--color-text)" }}>
          Organizaciones
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--color-text-muted)" }}>
          Gestiona las organizaciones disponibles para vincular eventos.
        </p>
      </header>

      <OrganizationsList initialOrganizations={organizations} isSuperAdmin={isSuperAdmin} />
    </div>
  )
}
