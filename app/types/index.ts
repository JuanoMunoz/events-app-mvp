export interface Organization {
  id: string
  name: string
  createdAt: Date
}

export interface City {
  id: number
  name: string
  createdAt: Date
}

export interface EventDay {
  id: string
  eventId: string
  date: Date
  title: string | null
}

export interface Event {
  id: string
  name: string
  description: string
  cityId: number
  startDate: Date
  endDate: Date
  location: string | null
  organizationId: string
  capacity: number | null
  createdAt: Date
  updatedAt: Date
}

export type Role = "SUPER_ADMIN" | "ORGANIZER" | "STAFF";

export interface NavItem {
    href: string,
    icon: any,
    label: string,
    roles: Role[]
}

export interface User {
    id: string
    name: string
    email: string
    role: Role
    createdAt: Date
}
