"use client"

import { useState } from "react"
import Calendar from "react-calendar"
import { MapPin, Clock, Users } from "lucide-react"
import { formatDate } from "@/lib/utils"

type ValuePiece = Date | null
type Value = ValuePiece | [ValuePiece, ValuePiece]

interface CalendarEvent {
  id: string
  title: string
  city: string
  date: string
  time: string
  attendees: number
  capacity: number
  status: "active" | "upcoming" | "past"
}

interface CalendarViewProps {
  events: CalendarEvent[]
}

function toDateStr(d: Date): string {
  return d.toISOString().split("T")[0]
}

/** Client Component — react-calendar requiere interacción del usuario */
export default function CalendarView({ events }: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  // Fechas que tienen eventos (para marcar puntos naranjas)
  const eventDates = new Set(events.map((e) => e.date))

  // Eventos del día seleccionado
  const dayEvents = events.filter(
    (e) => e.date === toDateStr(selectedDate)
  )

  function tileClassName({ date }: { date: Date }) {
    if (eventDates.has(toDateStr(date))) return "react-calendar__tile--hasEvent"
    return null
  }

  const statusLabel: Record<string, string> = {
    active: "En curso",
    upcoming: "Próximo",
    past: "Finalizado",
  }

  const statusColor: Record<string, string> = {
    active: "var(--color-primary)",
    upcoming: "var(--color-accent)",
    past: "var(--color-text-muted)",
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Calendario */}
      <Calendar
        onChange={(val: Value) => {
          if (val instanceof Date) setSelectedDate(val)
        }}
        value={selectedDate}
        tileClassName={tileClassName}
        locale="es-CO"
      />

      {/* Eventos del día seleccionado */}
      <div>
        <p
          className="text-xs uppercase tracking-widest mb-3"
          style={{ color: "var(--color-text-muted)" }}
        >
          {formatDate(toDateStr(selectedDate))}
        </p>

        {dayEvents.length === 0 ? (
          <p
            className="text-sm py-6 text-center"
            style={{ color: "var(--color-text-muted)" }}
          >
            No hay eventos para este día.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {dayEvents.map((event) => (
              <div
                key={event.id}
                className="flex flex-col gap-2 p-4 rounded-sm"
                style={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <p
                    className="text-sm font-medium"
                    style={{ color: "var(--color-text)" }}
                  >
                    {event.title}
                  </p>
                  <span
                    className="text-[10px] font-medium shrink-0"
                    style={{ color: statusColor[event.status] }}
                  >
                    {statusLabel[event.status]}
                  </span>
                </div>

                <div
                  className="flex flex-wrap gap-x-4 gap-y-1 text-xs"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  <span className="flex items-center gap-1">
                    <Clock size={11} strokeWidth={1.5} />
                    {event.time}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin size={11} strokeWidth={1.5} />
                    {event.city}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={11} strokeWidth={1.5} />
                    {event.attendees} / {event.capacity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
