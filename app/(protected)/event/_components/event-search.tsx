"use client"

import { useState } from "react"
import Link from "next/link"
import { Search, MapPin, Calendar, ArrowRight } from "lucide-react"
import { formatDate } from "@/lib/utils"
import type { MockEvent } from "@/lib/mock-data"

interface EventSearchProps {
  events: MockEvent[]
}

export default function EventSearch({ events }: EventSearchProps) {
  const [query, setQuery] = useState("")

  const filteredEvents = events.filter((event) => {
    const text = `${event.title} ${event.city}`.toLowerCase()
    return text.includes(query.toLowerCase())
  })

  return (
    <div className="flex flex-col gap-6">
      {/* Input de Buscador */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
          <Search size={16} strokeWidth={1.5} />
        </span>
        <input
          type="text"
          placeholder="Buscar por nombre o ciudad..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 text-sm bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)] rounded-sm outline-none transition-colors focus:border-[var(--color-primary)]"
        />
      </div>

      {/* Resultados */}
      <div className="flex flex-col gap-2">
        {filteredEvents.length === 0 ? (
          <p className="text-sm py-6 text-center text-[var(--color-text-muted)]">
            No se encontraron eventos.
          </p>
        ) : (
          filteredEvents.map((event) => (
            <Link
              key={event.id}
              href={`/event/${event.id}`}
              className="flex items-center justify-between gap-4 p-4 rounded-sm bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-all duration-150 group"
            >
              <div className="min-w-0 flex flex-col gap-1.5">
                <p className="text-sm font-medium text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors truncate">
                  {event.title}
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--color-text-muted)]">
                  <span className="flex items-center gap-1">
                    <MapPin size={11} strokeWidth={1.5} />
                    {event.city}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={11} strokeWidth={1.5} />
                    {formatDate(event.date)}
                  </span>
                </div>
              </div>
              <span className="text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] transition-colors shrink-0">
                <ArrowRight size={15} strokeWidth={1.5} />
              </span>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
