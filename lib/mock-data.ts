// TODO: reemplazar con queries reales a la BD cuando esté conectada

export const mockUser = {
  name: "Juan Muñoz",
  email: "juan@eventos.com",
  role: "Administrador",
  initials: "JM",
}

export type EventStatus = "active" | "upcoming" | "past"

export interface MockEvent {
  id: string
  title: string
  city: string
  date: string
  time: string
  attendees: number
  capacity: number
  status: EventStatus
}

export const mockEvents: MockEvent[] = [
  // Activos
  {
    id: "1",
    title: "Feria Tecnológica 2026",
    city: "Bogotá",
    date: "2026-07-19",
    time: "09:00",
    attendees: 143,
    capacity: 300,
    status: "active",
  },
  {
    id: "2",
    title: "Cumbre de Innovación",
    city: "Medellín",
    date: "2026-07-19",
    time: "14:00",
    attendees: 89,
    capacity: 150,
    status: "active",
  },
  // Próximos
  {
    id: "3",
    title: "Hackathon Regional",
    city: "Cali",
    date: "2026-07-22",
    time: "08:00",
    attendees: 0,
    capacity: 200,
    status: "upcoming",
  },
  {
    id: "4",
    title: "Workshop UX",
    city: "Bogotá",
    date: "2026-07-25",
    time: "10:00",
    attendees: 0,
    capacity: 50,
    status: "upcoming",
  },
  {
    id: "5",
    title: "Demo Day Startups",
    city: "Barranquilla",
    date: "2026-07-28",
    time: "15:00",
    attendees: 0,
    capacity: 120,
    status: "upcoming",
  },
  // Pasados
  {
    id: "6",
    title: "Congreso Nacional Tech",
    city: "Bogotá",
    date: "2026-07-10",
    time: "09:00",
    attendees: 287,
    capacity: 300,
    status: "past",
  },
  {
    id: "7",
    title: "Meetup Developers",
    city: "Medellín",
    date: "2026-07-05",
    time: "18:00",
    attendees: 64,
    capacity: 80,
    status: "past",
  },
  {
    id: "8",
    title: "Expo Digital 2026",
    city: "Cali",
    date: "2026-06-28",
    time: "10:00",
    attendees: 412,
    capacity: 500,
    status: "past",
  },
]

export const mockStats = [
  {
    label: "Eventos activos",
    value: "2",
    sub: "en este momento",
    accent: "primary" as const,
  },
  {
    label: "Asistentes hoy",
    value: "232",
    sub: "+12% vs ayer",
    accent: "accent" as const,
  },
  {
    label: "Total eventos",
    value: "24",
    sub: "este año",
    accent: "primary" as const,
  },
  {
    label: "Próximo evento",
    value: "3 días",
    sub: "Hackathon Regional",
    accent: "accent" as const,
  },
]

export const mockCities = [
  "Bogotá",
  "Medellín",
  "Cali",
  "Barranquilla",
  "Cartagena",
  "Bucaramanga",
]
