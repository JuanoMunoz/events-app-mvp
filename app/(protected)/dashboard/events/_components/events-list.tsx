"use client"

import { useState, useTransition, useEffect } from "react"
import {
  Pencil, Save, X, Trash2, Loader2, Plus,
  CalendarDays, MapPin, Users, ChevronDown, ChevronUp, Building2,
} from "lucide-react"
import { toast } from "sonner"
import { createEventAction, updateEventAction, deleteEventAction } from "../actions"

/* ─── tipos ─────────────────────────────────────────────────────────── */
interface City { id: number; name: string }
interface Organization { id: string; name: string }
interface EventDay { id: string; date: string; title: string | null }
interface EventItem {
  id: string
  name: string
  description: string
  location: string | null
  capacity: number | null
  startDate: string
  endDate: string
  createdAt: string
  organization: Organization
  city: City
  days: EventDay[]
}

interface EventsListProps {
  initialEvents: EventItem[]
  cities: City[]
  organizations: Organization[]
  isSuperAdmin: boolean
}

/* ─── helpers ───────────────────────────────────────────────────────── */
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

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-CO", {
    day: "numeric", month: "short", year: "numeric",
  })
}

function toInputDate(iso: string) {
  const d = new Date(iso)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

/* ─── Combobox Personalizado ──────────────────────────────────────────── */
function Combobox({
  items,
  name,
  defaultValue = "",
  placeholder,
}: {
  items: { id: string | number; name: string }[]
  name: string
  defaultValue?: string
  placeholder?: string
}) {
  const [value, setValue] = useState(defaultValue)
  const [open, setOpen] = useState(false)

  const filtered = items.filter((i) =>
    i.name.toLowerCase().includes(value.toLowerCase())
  )

  return (
    <div className="relative w-full">
      <div className="relative">
        <input
          name={name}
          required
          autoComplete="off"
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          placeholder={placeholder}
          style={inputStyle}
        />
        <ChevronDown
          size={14}
          className="absolute right-2 top-1/2 -translate-y-1/2 opacity-50 pointer-events-none"
        />
      </div>
      {open && filtered.length > 0 && (
        <ul
          className="absolute left-0 right-0 mt-1 max-h-40 overflow-y-auto rounded-sm shadow-md z-50 py-1"
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
          }}
        >
          {filtered.map((item) => (
            <li
              key={item.id}
              className="px-3 py-1.5 text-xs cursor-pointer hover:bg-[var(--color-background)]"
              style={{ color: "var(--color-text)" }}
              onClick={() => {
                setValue(item.name)
                setOpen(false)
              }}
            >
              {item.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/* ─── formulario de nuevo/edición ───────────────────────────────────── */
interface EventFormProps {
  cities: City[]
  organizations: Organization[]
  initial?: EventItem
  onSave: (event: EventItem) => void
  onCancel: () => void
}

function EventForm({ cities, organizations, initial, onSave, onCancel }: EventFormProps) {
  const [isPending, startTransition] = useTransition()
  const [eventName, setEventName] = useState(initial?.name || "")
  const [startDate, setStartDate] = useState(initial ? toInputDate(initial.startDate) : "")
  const [endDate, setEndDate] = useState(initial ? toInputDate(initial.endDate) : "")
  const [onlyFirstAndLastDay, setOnlyFirstAndLastDay] = useState(false)
  const [days, setDays] = useState<{ id?: string, date: string, title: string }[]>(
    initial?.days?.map(d => ({ id: d.id, date: toInputDate(d.date), title: d.title || "" })) || []
  )

  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(`${startDate}T00:00:00`)
      const end = new Date(`${endDate}T00:00:00`)
      
      if (start <= end) {
        setDays((prev) => {
          const newDays: { id?: string, date: string, title: string }[] = []
          let current = new Date(start)
          let count = 1
          
          while (current <= end) {
            const isFirst = current.getTime() === start.getTime()
            const isLast = current.getTime() === end.getTime()
            
            if (!onlyFirstAndLastDay || isFirst || isLast) {
              const yyyy = current.getFullYear()
              const mm = String(current.getMonth() + 1).padStart(2, '0')
              const dd = String(current.getDate()).padStart(2, '0')
              const dateStr = `${yyyy}-${mm}-${dd}`
              
              const existing = prev.filter(p => p.date === dateStr)
              if (existing.length > 0) {
                newDays.push(...existing)
              } else {
                newDays.push({
                  date: dateStr,
                  title: `Día de ${eventName || "evento"} #${count}`
                })
              }
            }
            
            current.setDate(current.getDate() + 1)
            count++
          }
          
          return newDays
        })
      }
    }
  }, [startDate, endDate, eventName, onlyFirstAndLastDay])

  function handleAddDay() {
    setDays((prev) => [
      ...prev,
      {
        date: startDate || "",
        title: `Día de ${eventName || "evento"} #${prev.length + 1}`,
      },
    ])
  }

  function handleRemoveDay(index: number) {
    setDays((prev) => prev.filter((_, i) => i !== index))
  }

  function handleUpdateDay(index: number, field: "date" | "title", value: string) {
    setDays((prev) => {
      const copy = [...prev]
      copy[index] = { ...copy[index], [field]: value }
      return copy
    })
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (days.length === 0) {
      toast.error("Debes definir al menos un día para el evento")
      return
    }
    const fd = new FormData(e.currentTarget)
    if (initial) fd.append("id", initial.id)
    fd.append("days", JSON.stringify(days))

    startTransition(async () => {
      const res = initial ? await updateEventAction(fd) : await createEventAction(fd)
      if (res?.error) {
        toast.error(res.error)
      } else if (res && "event" in res && res.event) {
        toast.success(initial ? "Evento actualizado" : "Evento creado")
        // reconstruct with correct shape
        onSave({
          id: res.event.id,
          name: res.event.name,
          description: (res.event as any).description ?? initial?.description ?? "",
          location: res.event.location ?? null,
          capacity: res.event.capacity ?? null,
          startDate: new Date(res.event.startDate).toISOString(),
          endDate: new Date(res.event.endDate).toISOString(),
          createdAt: new Date(res.event.createdAt ?? initial?.createdAt ?? Date.now()).toISOString(),
          organization: res.event.organization,
          city: res.event.city,
          days: res.event.days.map((d: any) => ({
            id: d.id,
            date: new Date(d.date).toISOString(),
            title: d.title || null
          })),
        })
      }
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 p-4 rounded-sm"
      style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>Nombre *</label>
          <input name="name" required value={eventName} onChange={(e) => setEventName(e.target.value)} placeholder="Nombre del evento" style={inputStyle} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>Ciudad *</label>
          <Combobox
            name="cityInput"
            items={cities}
            defaultValue={initial?.city?.name}
            placeholder="Selecciona o escribe una ciudad"
          />
        </div>
        <div className="flex flex-col gap-1 sm:col-span-2">
          <label className="text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>Organización *</label>
          <Combobox
            name="organizationInput"
            items={organizations}
            defaultValue={initial?.organization?.name}
            placeholder="Selecciona o escribe una organización"
          />
        </div>
        <div className="flex flex-col gap-1 sm:col-span-2">
          <label className="text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>Descripción *</label>
          <textarea name="description" required rows={2} defaultValue={initial?.description} placeholder="Descripción del evento" style={{ ...inputStyle, resize: "vertical" }} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>Ubicación</label>
          <input name="location" defaultValue={initial?.location ?? ""} placeholder="Ej: Centro de convenciones" style={inputStyle} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>Capacidad</label>
          <input name="capacity" type="number" min={1} defaultValue={initial?.capacity ?? ""} placeholder="Número de cupos" style={inputStyle} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>Fecha inicio *</label>
          <input name="startDate" type="date" required value={startDate} onChange={e => setStartDate(e.target.value)} style={inputStyle} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>Fecha fin *</label>
          <input name="endDate" type="date" required value={endDate} onChange={e => setEndDate(e.target.value)} style={inputStyle} />
        </div>
        <div className="flex items-center gap-2 sm:col-span-2 mt-1">
          <input
            type="checkbox"
            id="onlyFirstAndLastDay"
            checked={onlyFirstAndLastDay}
            onChange={(e) => setOnlyFirstAndLastDay(e.target.checked)}
            className="rounded border-gray-300"
            style={{ accentColor: "var(--color-primary)" }}
          />
          <label htmlFor="onlyFirstAndLastDay" className="text-xs cursor-pointer select-none" style={{ color: "var(--color-text-muted)" }}>
            Solo generar el primer y último día automáticamente
          </label>
        </div>
      </div>

      {/* Días del evento */}
      <div className="flex flex-col gap-2 pt-2 border-t mt-1" style={{ borderColor: "var(--color-border)" }}>
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>Días ({days.length})</label>
          <button type="button" onClick={handleAddDay} className="flex items-center gap-1 text-[10px] uppercase font-semibold tracking-wider px-2 py-1 rounded-sm transition-colors hover:bg-[var(--color-background)]" style={{ color: "var(--color-primary)" }}>
            <Plus size={12} /> Agregar día
          </button>
        </div>
        {days.length > 0 && (
          <div className="flex flex-col gap-2">
            {days.map((day, i) => (
              <div key={day.id || i} className="flex items-center gap-2">
                <input
                  type="date"
                  required
                  min={startDate}
                  max={endDate}
                  value={day.date}
                  onChange={(e) => handleUpdateDay(i, "date", e.target.value)}
                  style={{ ...inputStyle, width: "130px" }}
                />
                <input
                  type="text"
                  required
                  placeholder="Título del día"
                  value={day.title}
                  onChange={(e) => handleUpdateDay(i, "title", e.target.value)}
                  style={inputStyle}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveDay(i)}
                  className="p-1.5 rounded-sm transition-colors hover:bg-[var(--color-background)]"
                  style={{ color: "var(--color-danger)" }}
                  title="Remover día"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-2 pt-2 mt-1">
        <button type="button" onClick={onCancel} className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-sm" style={{ color: "var(--color-text-muted)", border: "1px solid var(--color-border)" }}>
          <X size={13} /> Cancelar
        </button>
        <button type="submit" disabled={isPending} className="flex items-center gap-1 text-xs font-semibold px-4 py-1.5 rounded-sm disabled:opacity-40" style={{ background: "var(--color-primary)", color: "#fff" }}>
          {isPending ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
          {initial ? "Actualizar" : "Crear evento"}
        </button>
      </div>
    </form>
  )
}

/* ─── tarjeta de evento ─────────────────────────────────────────────── */
function EventCard({
  event,
  cities,
  organizations,
  isSuperAdmin,
  onUpdate,
  onDelete,
}: {
  event: EventItem
  cities: City[]
  organizations: Organization[]
  isSuperAdmin: boolean
  onUpdate: (e: EventItem) => void
  onDelete: (id: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    setDeleting(true)
    const fd = new FormData()
    fd.append("id", event.id)
    startTransition(async () => {
      const res = await deleteEventAction(fd)
      if (res?.error) { toast.error(res.error); setDeleting(false) }
      else { toast.success("Evento eliminado"); onDelete(event.id) }
    })
  }

  if (editing)
    return (
      <EventForm
        cities={cities}
        organizations={organizations}
        initial={event}
        onSave={(updated) => { onUpdate(updated); setEditing(false) }}
        onCancel={() => setEditing(false)}
      />
    )

  const now = new Date()
  const start = new Date(event.startDate)
  const end = new Date(event.endDate)
  const status: "active" | "upcoming" | "past" =
    now >= start && now <= end ? "active" : now < start ? "upcoming" : "past"

  const statusBadge: Record<string, { bg: string; color: string; label: string }> = {
    active:   { bg: "rgba(18,90,245,0.08)",   color: "var(--color-primary)", label: "Activo" },
    upcoming: { bg: "rgba(225,131,53,0.10)",  color: "var(--color-accent)",  label: "Próximo" },
    past:     { bg: "rgba(39,38,53,0.06)",    color: "var(--color-text-muted)", label: "Finalizado" },
  }
  const badge = statusBadge[status]

  return (
    <article
      className="rounded-sm overflow-hidden"
      style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 p-4">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold truncate" style={{ color: "var(--color-text)" }}>
              {event.name}
            </h3>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-sm shrink-0" style={{ background: badge.bg, color: badge.color }}>
              {badge.label}
            </span>
          </div>
          <div className="flex flex-wrap gap-3 text-xs" style={{ color: "var(--color-text-muted)" }}>
            <span className="flex items-center gap-1">
              <CalendarDays size={11} />
              {fmtDate(event.startDate)} – {fmtDate(event.endDate)}
            </span>
            {event.location && (
              <span className="flex items-center gap-1">
                <MapPin size={11} />
                {event.location}
              </span>
            )}
            {event.capacity && (
              <span className="flex items-center gap-1">
                <Users size={11} />
                {event.capacity} cupos
              </span>
            )}
            <span className="flex items-center gap-1">
              <MapPin size={11} />
              {event.city.name}
            </span>
            <span className="flex items-center gap-1">
              <Building2 size={11} />
              {event.organization?.name}
            </span>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="p-1 rounded-sm transition-colors"
            style={{ color: "var(--color-text-muted)" }}
            title={expanded ? "Colapsar" : "Ver días"}
          >
            {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
          {isSuperAdmin && (
            <>
              <button onClick={() => setEditing(true)} className="p-1 rounded-sm transition-colors" style={{ color: "var(--color-text-muted)" }} title="Editar">
                <Pencil size={15} strokeWidth={1.5} />
              </button>
              <button onClick={handleDelete} disabled={deleting || isPending} className="p-1 rounded-sm transition-colors disabled:opacity-40" style={{ color: "var(--color-danger)" }} title="Eliminar">
                {deleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} strokeWidth={1.5} />}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Descripción + días */}
      {expanded && (
        <div
          className="px-4 pb-4 flex flex-col gap-3"
          style={{ borderTop: "1px solid var(--color-border)" }}
        >
          <p className="text-xs pt-3 leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
            {event.description}
          </p>
          {event.days.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--color-text-muted)" }}>
                Días ({event.days.length})
              </p>
              <ul className="flex flex-col gap-1">
                {event.days.map((day) => (
                  <li key={day.id} className="flex items-center gap-2 text-xs" style={{ color: "var(--color-text)" }}>
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "var(--color-accent)" }} />
                    <span>{fmtDate(day.date)}</span>
                    {day.title && <span style={{ color: "var(--color-text-muted)" }}>— {day.title}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </article>
  )
}

/* ─── componente principal ──────────────────────────────────────────── */
export default function EventsList({ initialEvents, cities, organizations, isSuperAdmin }: EventsListProps) {
  const [events, setEvents] = useState<EventItem[]>(initialEvents)
  const [showForm, setShowForm] = useState(false)

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-widest" style={{ color: "var(--color-text-muted)" }}>
          {events.length} evento{events.length !== 1 ? "s" : ""}
        </span>
        {isSuperAdmin && (
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-sm transition-colors"
            style={{
              background: showForm ? "var(--color-background)" : "var(--color-primary)",
              color: showForm ? "var(--color-text)" : "#fff",
              border: "1px solid var(--color-border)",
            }}
          >
            {showForm ? <X size={13} /> : <Plus size={13} />}
            {showForm ? "Cancelar" : "Nuevo evento"}
          </button>
        )}
      </div>

      {/* Formulario nuevo evento */}
      {showForm && (
        <EventForm
          cities={cities}
          organizations={organizations}
          onSave={(event) => { setEvents((prev) => [event, ...prev]); setShowForm(false) }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Lista */}
      {events.length === 0 && !showForm ? (
        <div
          className="flex flex-col items-center justify-center py-16 text-center rounded-sm"
          style={{ border: "1px dashed var(--color-border)", color: "var(--color-text-muted)" }}
        >
          <CalendarDays size={32} strokeWidth={1} className="mb-3 opacity-40" />
          <p className="text-sm">No hay eventos registrados.</p>
          {isSuperAdmin && (
            <p className="text-xs mt-1">Crea el primero con el botón "Nuevo evento".</p>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              cities={cities}
              organizations={organizations}
              isSuperAdmin={isSuperAdmin}
              onUpdate={(updated) =>
                setEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)))
              }
              onDelete={(id) => setEvents((prev) => prev.filter((e) => e.id !== id))}
            />
          ))}
        </div>
      )}
    </div>
  )
}
