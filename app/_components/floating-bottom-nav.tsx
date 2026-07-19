"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { CalendarDays, Tag, Search } from "lucide-react"

/** Bottom nav flotante exclusivo para las vistas de eventos.
 *  Tres destinos fijos:
 *  - /event            → buscador/listado de eventos
 *  - /escarapela       → generador de escarapela
 *  - /dashboard/calendar → calendario del dashboard
 */
export default function FloatingBottomNav() {
  const pathname = usePathname()

  const navItems = [
    { href: "/event", icon: Search, label: "Eventos" },
    { href: "/event/escarapela", icon: Tag, label: "Escarapela" },
    { href: "/dashboard/calendar", icon: CalendarDays, label: "Calendario" },
  ]

  return (
    <nav
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 px-3 py-1.5 rounded-full shadow-lg"
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        backdropFilter: "blur(8px)",
      }}
    >
      {navItems.map(({ href, icon: Icon, label }) => {
        const isActive = pathname === href || pathname.startsWith(href + "/")

        return (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
            style={{
              background: isActive ? "var(--color-primary)" : "transparent",
              color: isActive ? "#ffffff" : "var(--color-text-muted)",
            }}
          >
            <Icon size={14} strokeWidth={isActive ? 2.5 : 1.5} />
            <span className={isActive ? "inline" : "hidden md:inline"}>
              {label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
