import { Calendar, LayoutDashboard, Shield, UserPlus, Building2, MapPin, CalendarDays, MonitorSmartphone } from "lucide-react";
import { NavItem } from "../types/User";

export const navItems: NavItem[] = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", roles: ["SUPER_ADMIN", "ORGANIZER"] },
    { href: "/dashboard/calendar", icon: Calendar, label: "Calendario", roles: ["SUPER_ADMIN", "ORGANIZER", "STAFF"] },
    { href: "/dashboard/events", icon: CalendarDays, label: "Eventos", roles: ["SUPER_ADMIN", "ORGANIZER"] },
    { href: "/dashboard/organization", icon: Building2, label: "Organizaciones", roles: ["SUPER_ADMIN", "ORGANIZER"] },
    { href: "/dashboard/cities", icon: MapPin, label: "Ciudades", roles: ["SUPER_ADMIN", "ORGANIZER"] },
    { href: "/dashboard/add-user", icon: UserPlus, label: "Agregar Staff", roles: ["SUPER_ADMIN", "ORGANIZER"] },
    { href: "/dashboard/set-role", icon: Shield, label: "Asignar Roles", roles: ["SUPER_ADMIN"] },
    { href: "/event/escarapela", icon: MonitorSmartphone, label: "Modo Kiosko", roles: ["SUPER_ADMIN", "ORGANIZER", "STAFF"] },
]
