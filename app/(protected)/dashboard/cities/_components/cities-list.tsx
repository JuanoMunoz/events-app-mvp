"use client"

import { useState, useTransition } from "react"
import { Pencil, Save, X, Trash2, Loader2, Plus, Building2 } from "lucide-react"
import { toast } from "sonner"
import {
  createCityAction,
  updateCityAction,
  deleteCityAction,
} from "../actions"

interface City {
  id: number
  name: string
  createdAt: string
}

interface CitiesListProps {
  initialCities: City[]
  isSuperAdmin: boolean
}

export default function CitiesList({ initialCities, isSuperAdmin }: CitiesListProps) {
  const [cities, setCities] = useState<City[]>(initialCities)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState("")
  const [newName, setNewName] = useState("")
  const [showAdd, setShowAdd] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
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

  function handleEditStart(city: City) {
    setEditingId(city.id)
    setEditName(city.name)
  }

  function handleEditCancel() {
    setEditingId(null)
    setEditName("")
  }

  async function handleEditSave(city: City) {
    if (!editName.trim() || editName.trim() === city.name) {
      handleEditCancel()
      return
    }
    const fd = new FormData()
    fd.append("id", String(city.id))
    fd.append("name", editName.trim())

    startTransition(async () => {
      const res = await updateCityAction(fd)
      if (res?.error) {
        toast.error(res.error)
      } else {
        setCities((prev) =>
          prev.map((c) => (c.id === city.id ? { ...c, name: editName.trim() } : c))
        )
        toast.success("Ciudad actualizada")
        setEditingId(null)
        setEditName("")
      }
    })
  }

  async function handleDelete(id: number) {
    setDeletingId(id)
    const fd = new FormData()
    fd.append("id", String(id))

    startTransition(async () => {
      const res = await deleteCityAction(fd)
      if (res?.error) {
        toast.error(res.error)
      } else {
        setCities((prev) => prev.filter((c) => c.id !== id))
        toast.success("Ciudad eliminada")
      }
      setDeletingId(null)
    })
  }

  async function handleCreate() {
    if (!newName.trim()) return
    const fd = new FormData()
    fd.append("name", newName.trim())

    startTransition(async () => {
      const res = await createCityAction(fd)
      if ("error" in res) {
        toast.error(res.error)
      } else if ("city" in res && res.city) {
        setCities((prev) => [
          { ...res.city, createdAt: new Date(res.city.createdAt).toISOString() },
          ...prev,
        ])
        toast.success("Ciudad creada")
        setNewName("")
        setShowAdd(false)
      }
    })
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <span
          className="text-xs uppercase tracking-widest"
          style={{ color: "var(--color-text-muted)" }}
        >
          {cities.length} ciudad{cities.length !== 1 ? "es" : ""}
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
            {showAdd ? "Cancelar" : "Nueva ciudad"}
          </button>
        )}
      </div>

      {/* Add form */}
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
            placeholder="Nombre de la ciudad…"
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

      {/* Table */}
      <div
        className="overflow-x-auto rounded-sm"
        style={{ border: "1px solid var(--color-border)", background: "var(--color-surface)" }}
      >
        <table className="w-full text-left border-collapse">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
              <th className="p-4 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
                Ciudad
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
            {cities.length === 0 && (
              <tr>
                <td colSpan={3} className="p-8 text-sm text-center" style={{ color: "var(--color-text-muted)" }}>
                  No hay ciudades registradas todavía.
                </td>
              </tr>
            )}
            {cities.map((city) => {
              const isEditing = editingId === city.id
              const isDeleting = deletingId === city.id

              return (
                <tr
                  key={city.id}
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
                          if (e.key === "Enter") handleEditSave(city)
                          if (e.key === "Escape") handleEditCancel()
                        }}
                        style={{ ...inputStyle, width: "auto", minWidth: "160px" }}
                      />
                    ) : (
                      <span className="flex items-center gap-2">
                        <Building2 size={13} style={{ color: "var(--color-text-muted)" }} />
                        {city.name}
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-sm" style={{ color: "var(--color-text-muted)" }}>
                    {new Date(city.createdAt).toLocaleDateString("es-CO", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </td>
                  {isSuperAdmin && (
                    <td className="p-4 text-sm text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditSave(city)}
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
                            onClick={() => handleEditStart(city)}
                            title="Editar"
                            className="p-1 rounded-sm transition-colors"
                            style={{ color: "var(--color-text-muted)" }}
                          >
                            <Pencil size={15} strokeWidth={1.5} />
                          </button>
                          <button
                            onClick={() => handleDelete(city.id)}
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
