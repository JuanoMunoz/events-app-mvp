"use client"

import { useRef } from "react"
import { ChevronLeft, ChevronRight, Users, Clock } from "lucide-react"
import { formatDate, relativeDate } from "@/lib/utils"
import type { MockEvent } from "@/lib/mock-data"

const variantConfig = {
  active: {
    borderColor: "var(--color-primary)",
    badge: "En curso",
    badgeBg: "rgba(18,90,245,0.08)",
    badgeColor: "var(--color-primary)",
  },
  upcoming: {
    borderColor: "var(--color-accent)",
    badge: "Próximo",
    badgeBg: "rgba(225,131,53,0.08)",
    badgeColor: "var(--color-accent)",
  },
  past: {
    borderColor: "var(--color-border)",
    badge: "Finalizado",
    badgeBg: "transparent",
    badgeColor: "var(--color-text-muted)",
  },
}

interface EventCarouselProps {
  title: string
  events: MockEvent[]
  variant: "active" | "upcoming" | "past"
}

/** Client Component — permite scroll horizontal con botones */
export default function EventCarousel({
  title,
  events,
  variant,
}: EventCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const cfg = variantConfig[variant]

  function scroll(dir: "left" | "right") {
    if (!scrollRef.current) return
    scrollRef.current.scrollBy({
      left: dir === "right" ? 260 : -260,
      behavior: "smooth",
    })
  }

  if (events.length === 0) return null

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2
          className="text-xs uppercase tracking-widest font-medium"
          style={{ color: "var(--color-text-muted)" }}
        >
          {title}
        </h2>
        <div className="flex gap-1">
          <button
            onClick={() => scroll("left")}
            className="p-1 rounded-sm transition-colors"
            style={{ color: "var(--color-text-muted)" }}
            aria-label="Anterior"
          >
            <ChevronLeft size={15} strokeWidth={1.5} />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-1 rounded-sm transition-colors"
            style={{ color: "var(--color-text-muted)" }}
            aria-label="Siguiente"
          >
            <ChevronRight size={15} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2"
        style={{ scrollSnapType: "x mandatory", scrollbarWidth: "none" }}
      >
        {events.map((event) => {
          const fillPct =
            event.capacity > 0
              ? Math.round((event.attendees / event.capacity) * 100)
              : 0

          return (
            <article
              key={event.id}
              className="shrink-0 flex flex-col gap-3 p-4 rounded-sm"
              style={{
                width: "240px",
                scrollSnapAlign: "start",
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
              }}
            >
              {/* Badge + ciudad */}
              <div className="flex items-center justify-between gap-2">
                <span
                  className="text-[10px] font-medium px-1.5 py-0.5 rounded-sm"
                  style={{
                    background: cfg.badgeBg,
                    color: cfg.badgeColor,
                  }}
                >
                  {cfg.badge}
                </span>
                <span
                  className="text-[10px]"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {event.city}
                </span>
              </div>

              {/* Título */}
              <p
                className="text-sm font-medium leading-snug"
                style={{ color: "var(--color-text)" }}
              >
                {event.title}
              </p>

              {/* Fecha + hora */}
              <div
                className="flex items-center gap-1.5 text-xs"
                style={{ color: "var(--color-text-muted)" }}
              >
                <Clock size={11} strokeWidth={1.5} />
                <span>
                  {formatDate(event.date)} · {event.time}
                </span>
              </div>

              {/* Asistentes + barra */}
              {variant !== "upcoming" && (
                <div className="flex flex-col gap-1.5">
                  <div
                    className="flex items-center gap-1.5 text-xs"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    <Users size={11} strokeWidth={1.5} />
                    <span>
                      {event.attendees} / {event.capacity}
                    </span>
                    <span className="ml-auto">{fillPct}%</span>
                  </div>
                  <div
                    className="h-0.5 rounded-full overflow-hidden"
                    style={{ background: "var(--color-border)" }}
                  >
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${fillPct}%`,
                        background: cfg.borderColor,
                      }}
                    />
                  </div>
                </div>
              )}

              {variant === "upcoming" && (
                <p
                  className="text-xs"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {relativeDate(event.date)} · {event.capacity} cupos
                </p>
              )}
            </article>
          )
        })}
      </div>
    </section>
  )
}
