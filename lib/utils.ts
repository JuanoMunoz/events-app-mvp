import { Role } from "@/app/types/User"

/** Joins class names filtering out falsy values */
export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ")
}

/** Formats a date string (YYYY-MM-DD) to a readable Spanish date */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00")
  return date.toLocaleDateString("es-CO", {
    weekday: "short",
    day: "numeric",
    month: "short",
  })
}


/** Returns time relative to now in Spanish */
export function relativeDate(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr + "T00:00:00")
  const diffMs = date.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "Hoy"
  if (diffDays === 1) return "Mañana"
  if (diffDays === -1) return "Ayer"
  if (diffDays > 0) return `En ${diffDays} días`
  return `Hace ${Math.abs(diffDays)} días`
}

/** Generates a random password */
export function generatePassword(length = 12): string {
  const chars =
    "abcdefghijkmnopqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789!@#$"
  let result = ""
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}


export function parseRoleAsName(role: Role) {
  if (role == "SUPER_ADMIN") return "Administrador"
  else if (role == "ORGANIZER") return "Organizador"
  else if (role == "STAFF") return "Staff"
}

/** Derives email from first + last name */
export function deriveEmail(
  firstName: string,
  lastName: string,
  domain = "eventos.com"
): string {
  const clean = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, ".")
  return `${clean(firstName)}.${clean(lastName)}@${domain}`
}
