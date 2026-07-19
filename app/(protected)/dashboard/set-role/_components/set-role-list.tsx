"use client"

import { useState } from "react"
import { Pencil, Save, X, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { updateRoleAction } from "@/app/(protected)/dashboard/actions"

type Role = "SUPER_ADMIN" | "ORGANIZER" | "STAFF"

interface SerializedUser {
  id: string
  name: string
  email: string
  role: Role
  createdAt: string
}

interface SetRoleListProps {
  initialUsers: SerializedUser[]
}

const ROLES: Role[] = ["SUPER_ADMIN", "ORGANIZER", "STAFF"]

const roleLabel: Record<Role, string> = {
  SUPER_ADMIN: "Super Admin",
  ORGANIZER: "Organizador",
  STAFF: "Staff",
}

export default function SetRoleList({ initialUsers }: SetRoleListProps) {
  const [users, setUsers] = useState<SerializedUser[]>(initialUsers)
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [saving, setSaving] = useState(false)

  const selectStyle: React.CSSProperties = {
    padding: "0.375rem 0.5rem",
    fontSize: "0.8125rem",
    background: "var(--color-surface)",
    color: "var(--color-text)",
    border: "1px solid var(--color-border)",
    borderRadius: "4px",
    outline: "none",
    cursor: "pointer",
    fontFamily: "inherit",
  }

  async function handleSave(email: string) {
    if (!selectedRole) return

    setSaving(true)
    const formData = new FormData()
    formData.append("email", email)
    formData.append("role", selectedRole)

    try {
      const res = await updateRoleAction(formData)
      if (res?.error) {
        toast.error(res.error)
      } else {
        toast.success("Rol actualizado con éxito")
        setUsers((prev) =>
          prev.map((u) =>
            u.email === email ? { ...u, role: selectedRole } : u
          )
        )
        setEditingUserId(null)
        setSelectedRole(null)
      }
    } catch (err) {
      toast.error("Ocurrió un error al guardar")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="overflow-x-auto rounded-sm border"
      style={{
        borderColor: "var(--color-border)",
        background: "var(--color-surface)",
      }}
    >
      <table className="w-full text-left border-collapse">
        <thead>
          <tr
            className="border-b"
            style={{
              borderColor: "var(--color-border)",
            }}
          >
            <th className="p-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              Usuario
            </th>
            <th className="p-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              Correo
            </th>
            <th className="p-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              Rol
            </th>
            <th className="p-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] text-right">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-border)]">
          {users.map((user) => {
            const isEditing = editingUserId === user.id

            return (
              <tr key={user.id} className="hover:bg-[var(--color-background)] transition-colors">
                <td className="p-4 text-sm font-medium text-[var(--color-text)]">
                  {user.name}
                </td>
                <td className="p-4 text-sm text-[var(--color-text-muted)]">
                  {user.email}
                </td>
                <td className="p-4 text-sm">
                  {isEditing ? (
                    <select
                      value={selectedRole || user.role}
                      onChange={(e) => setSelectedRole(e.target.value as Role)}
                      style={selectStyle}
                    >
                      {ROLES.map((roleOpt) => (
                        <option key={roleOpt} value={roleOpt}>
                          {roleLabel[roleOpt]}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded-sm"
                      style={{
                        background:
                          user.role === "SUPER_ADMIN"
                            ? "rgba(18, 90, 245, 0.08)"
                            : user.role === "ORGANIZER"
                            ? "rgba(225, 131, 53, 0.08)"
                            : "rgba(39, 38, 53, 0.06)",
                        color:
                          user.role === "SUPER_ADMIN"
                            ? "var(--color-primary)"
                            : user.role === "ORGANIZER"
                            ? "var(--color-accent)"
                            : "var(--color-text-muted)",
                      }}
                    >
                      {roleLabel[user.role]}
                    </span>
                  )}
                </td>
                <td className="p-4 text-sm text-right">
                  {isEditing ? (
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleSave(user.email)}
                        disabled={saving}
                        className="p-1 rounded-sm text-[var(--color-primary)] hover:bg-[var(--color-background)] transition-colors disabled:opacity-50"
                        title="Guardar"
                      >
                        {saving ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : (
                          <Save size={15} strokeWidth={2} />
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setEditingUserId(null)
                          setSelectedRole(null)
                        }}
                        disabled={saving}
                        className="p-1 rounded-sm text-[var(--color-text-muted)] hover:bg-[var(--color-background)] transition-colors disabled:opacity-50"
                        title="Cancelar"
                      >
                        <X size={15} strokeWidth={2} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingUserId(user.id)
                        setSelectedRole(user.role)
                      }}
                      className="p-1 rounded-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-background)] transition-colors"
                      title="Editar Rol"
                    >
                      <Pencil size={15} strokeWidth={1.5} />
                    </button>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
