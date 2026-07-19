"use client"

import { useState, useTransition } from "react"
import { Pencil, Save, X, Trash2, Loader2, Plus, Building2 } from "lucide-react"
import { toast } from "sonner"
import {
  createOrganizationAction,
  updateOrganizationAction,
  deleteOrganizationAction,
} from "../actions"

interface Organization {
  id: string
  name: string
  createdAt: string
}

interface OrganizationsListProps {
  initialOrganizations: Organization[]
  isSuperAdmin: boolean
}

export default function OrganizationsList({ initialOrganizations, isSuperAdmin }: OrganizationsListProps) {
  const [organizations, setOrganizations] = useState<Organization[]>(initialOrganizations)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [newName, setNewName] = useState("")
  const [showAdd, setShowAdd] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const inputStyle: React.CSSProperties = {
    padding: "0.375rem 0.5rem",
    fontSize: "0.8125rem",
    background: "var(--color-surface)",
    color: "var(--color-text)",
    border: "1px solid var(--color-border)",
    borderRadius: "4px",
    outline: "none",
    fontFamily: "inherit",
    width: "100%",
  }

  function handleEditStart(organization: Organization) {
    setEditingId(organization.id)
    setEditName(organization.name)
  }

  function handleEditCancel() {
    setEditingId(null)
    setEditName("")
  }

  async function handleEditSave(organization: Organization) {
    if (!editName.trim() || editName.trim() === organization.name) {
      handleEditCancel()
      return
    }
    const fd = new FormData()
    fd.append("id", organization.id)
    fd.append("name", editName.trim())

    startTransition(async () => {
      const res = await updateOrganizationAction(fd)
      if (res?.error) {
        toast.error(res.error)
      } else {
        setOrganizations((prev) =>
          prev.map((c) => (c.id === organization.id ? { ...c, name: editName.trim() } : c))
        )
        toast.success("Organización actualizada")
        setEditingId(null)
        setEditName("")
      }
    })
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    const fd = new FormData()
    fd.append("id", id)

    startTransition(async () => {
      const res = await deleteOrganizationAction(fd)
      if (res?.error) {
        toast.error(res.error)
      } else {
        setOrganizations((prev) => prev.filter((c) => c.id !== id))
        toast.success("Organización eliminada")
      }
      setDeletingId(null)
    })
  }

  async function handleCreate() {
    if (!newName.trim()) return
    const fd = new FormData()
    fd.append("name", newName.trim())

    startTransition(async () => {
      const res = await createOrganizationAction(fd)
      if ("error" in res) {
        toast.error(res.error)
      } else if ("organization" in res && res.organization) {
        setOrganizations((prev) => [
          { ...res.organization, createdAt: new Date(res.organization.createdAt).toISOString() },
          ...prev,
        ])
        toast.success("Organización creada")
        setNewName("")
        setShowAdd(false)
      }
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span
          className="text-xs uppercase tracking-widest"
          style={{ color: "var(--color-text-muted)" }}
        >
          {organizations.length} organizaci{organizations.length !== 1 ? "ones" : "ón"}
        </span>

        {isSuperAdmin && (
          <button
            onClick={() => setShowAdd((v) => !v)}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-sm transition-colors"
            style={{
              background: showAdd ? "var(--color-background)" : "var(--color-primary)",
              color: showAdd ? "var(--color-text)" : "#fff",
              border: "1px solid var(--color-border)",
            }}
          >
            {showAdd ? <X size={13} /> : <Plus size={13} />}
            {showAdd ? "Cancelar" : "Nueva organización"}
          </button>
        )}
      </div>

      {showAdd && (
        <div
          className="flex items-center gap-2 p-3 rounded-sm"
          style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
        >
          <Building2 size={15} style={{ color: "var(--color-text-muted)", flexShrink: 0 }} />
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleCreate() }}
            placeholder="Nombre de la organización…"
            style={inputStyle}
          />
          <button
            onClick={handleCreate}
            disabled={isPending || !newName.trim()}
            className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-sm shrink-0 transition-colors disabled:opacity-40"
            style={{ background: "var(--color-primary)", color: "#fff" }}
          >
            {isPending ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
            Guardar
          </button>
        </div>
      )}

      <div
        className="overflow-x-auto rounded-sm"
        style={{ border: "1px solid var(--color-border)", background: "var(--color-surface)" }}
      >
        <table className="w-full text-left border-collapse">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
              <th className="p-4 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
                Organización
              </th>
              <th className="p-4 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
                Creada
              </th>
              {isSuperAdmin && (
                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-right" style={{ color: "var(--color-text-muted)" }}>
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {organizations.length === 0 && (
              <tr>
                <td colSpan={3} className="p-8 text-sm text-center" style={{ color: "var(--color-text-muted)" }}>
                  No hay organizaciones registradas todavía.
                </td>
              </tr>
            )}
            {organizations.map((org) => {
              const isEditing = editingId === org.id
              const isDeleting = deletingId === org.id

              return (
                <tr
                  key={org.id}
                  className="transition-colors"
                  style={{ borderBottom: "1px solid var(--color-border)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-background)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                >
                  <td className="p-4 text-sm font-medium" style={{ color: "var(--color-text)" }}>
                    {isEditing ? (
                      <input
                        autoFocus
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleEditSave(org)
                          if (e.key === "Escape") handleEditCancel()
                        }}
                        style={{ ...inputStyle, width: "auto", minWidth: "160px" }}
                      />
                    ) : (
                      <span className="flex items-center gap-2">
                        <Building2 size={13} style={{ color: "var(--color-text-muted)" }} />
                        {org.name}
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-sm" style={{ color: "var(--color-text-muted)" }}>
                    {new Date(org.createdAt).toLocaleDateString("es-CO", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </td>
                  {isSuperAdmin && (
                    <td className="p-4 text-sm text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditSave(org)}
                            disabled={isPending}
                            title="Guardar"
                            className="p-1 rounded-sm transition-colors disabled:opacity-40"
                            style={{ color: "var(--color-primary)" }}
                          >
                            {isPending ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} strokeWidth={2} />}
                          </button>
                          <button
                            onClick={handleEditCancel}
                            title="Cancelar"
                            className="p-1 rounded-sm transition-colors"
                            style={{ color: "var(--color-text-muted)" }}
                          >
                            <X size={15} strokeWidth={2} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditStart(org)}
                            title="Editar"
                            className="p-1 rounded-sm transition-colors"
                            style={{ color: "var(--color-text-muted)" }}
                          >
                            <Pencil size={15} strokeWidth={1.5} />
                          </button>
                          <button
                            onClick={() => handleDelete(org.id)}
                            disabled={isDeleting || isPending}
                            title="Eliminar"
                            className="p-1 rounded-sm transition-colors disabled:opacity-40"
                            style={{ color: "var(--color-danger)" }}
                          >
                            {isDeleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} strokeWidth={1.5} />}
                          </button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
