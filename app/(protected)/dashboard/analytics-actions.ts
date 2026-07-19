'use server'

import { prisma } from "@/lib/prisma"
import { unstable_cache } from "next/cache"
import ExcelJS from "exceljs"

/* ═══════════════════════════════════════════════════════════════════
   SECCIÓN 4 — Asistencia por Evento
═══════════════════════════════════════════════════════════════════ */

/** Devuelve los días de un evento con su conteo de asistencias. */
export async function getAttendanceByEventDayAction(eventId: string) {
    try {
        const days = await prisma.eventDay.findMany({
            where: { eventId },
            orderBy: { date: "asc" },
            include: {
                _count: { select: { attendances: true } },
            },
        })

        return {
            days: days.map((d, i) => ({
                id: d.id,
                label: d.title ?? `Día ${i + 1}`,
                date: d.date.toISOString(),
                attendees: d._count.attendances,
            })),
        }
    } catch {
        return { error: "Error al obtener asistencia por día" }
    }
}

/** Devuelve todos los eventos con nombre para el selector del dropdown. */
export async function getEventsForSelectorAction() {
    try {
        const events = await prisma.event.findMany({
            orderBy: { startDate: "desc" },
            select: { id: true, name: true, startDate: true },
        })
        return { events }
    } catch {
        return { error: "Error al obtener eventos" }
    }
}

/* ═══════════════════════════════════════════════════════════════════
   SECCIÓN 5 — Tendencia de Asistencia
═══════════════════════════════════════════════════════════════════ */

type TrendRow = { day: Date; total: bigint }
type HourRow = { hour: number; total: bigint }

/** Asistencias agrupadas por día (últimos 30 o 90 días). Cached 15 min. */
export const getAttendanceTrendAction = unstable_cache(
    async (rangeDays: 30 | 90) => {
        try {
            const rows = await prisma.$queryRaw<TrendRow[]>`
        SELECT
          DATE_TRUNC('day', "attendedAt" AT TIME ZONE 'America/Bogota') AS day,
          COUNT(*)::bigint AS total
        FROM "Attendance"
        WHERE "attendedAt" >= NOW() - INTERVAL '${rangeDays} days'
        GROUP BY 1
        ORDER BY 1
      `
            return {
                trend: rows.map((r) => ({
                    day: new Date(r.day).toISOString(),
                    total: Number(r.total),
                })),
            }
        } catch {
            return { error: "Error al obtener tendencia" }
        }
    },
    ["attendance-trend"],
    { revalidate: 900 }
)

/** Histograma: conteo de asistencias por hora del día. Cached 15 min. */
export const getAttendanceByHourAction = unstable_cache(
    async () => {
        try {
            const rows = await prisma.$queryRaw<HourRow[]>`
        SELECT
          EXTRACT(HOUR FROM "attendedAt" AT TIME ZONE 'America/Bogota')::int AS hour,
          COUNT(*)::bigint AS total
        FROM "Attendance"
        GROUP BY 1
        ORDER BY 1
      `
            return {
                hours: rows.map((r) => ({
                    hour: r.hour,
                    label: `${String(r.hour).padStart(2, "0")}:00`,
                    total: Number(r.total),
                })),
            }
        } catch {
            return { error: "Error al obtener histograma por hora" }
        }
    },
    ["attendance-by-hour"],
    { revalidate: 900 }
)

/* ═══════════════════════════════════════════════════════════════════
   SECCIÓN 6 — Ranking de Ciudades
═══════════════════════════════════════════════════════════════════ */

export async function getCityRankingAction() {
    try {
        const cities = await prisma.city.findMany({
            select: {
                id: true,
                name: true,
                _count: { select: { events: true } },
                events: {
                    select: {
                        capacity: true,
                        days: {
                            select: {
                                _count: { select: { attendances: true } },
                            },
                        },
                    },
                },
            },
        })

        const ranked = cities
            .map((c) => {
                const totalAttendees = c.events.reduce(
                    (acc, ev) =>
                        acc +
                        ev.days.reduce((a, d) => a + d._count.attendances, 0),
                    0
                )
                const totalEvents = c._count.events
                return {
                    id: c.id,
                    name: c.name,
                    totalEvents,
                    totalAttendees,
                    avgAttendeesPerEvent:
                        totalEvents > 0
                            ? Math.round(totalAttendees / totalEvents)
                            : 0,
                }
            })
            .filter((c) => c.totalEvents > 0)
            .sort((a, b) => b.totalAttendees - a.totalAttendees)

        return { cities: ranked }
    } catch {
        return { error: "Error al obtener ranking de ciudades" }
    }
}

/* ═══════════════════════════════════════════════════════════════════
   SECCIÓN 7 — Ranking de Organizaciones
═══════════════════════════════════════════════════════════════════ */

export async function getOrganizationRankingAction() {
    try {
        const orgs = await prisma.organization.findMany({
            select: {
                id: true,
                name: true,
                _count: { select: { events: true } },
                events: {
                    select: {
                        capacity: true,
                        days: {
                            select: {
                                _count: { select: { attendances: true } },
                            },
                        },
                    },
                },
            },
        })

        const ranked = orgs
            .map((o) => {
                const totalAttendees = o.events.reduce(
                    (acc, ev) =>
                        acc +
                        ev.days.reduce((a, d) => a + d._count.attendances, 0),
                    0
                )
                const totalCapacity = o.events.reduce(
                    (acc, ev) => acc + (ev.capacity ?? 0),
                    0
                )
                const totalEvents = o._count.events
                const occupancyRate =
                    totalCapacity > 0
                        ? Math.round((totalAttendees / totalCapacity) * 100)
                        : null

                return {
                    id: o.id,
                    name: o.name,
                    totalEvents,
                    totalAttendees,
                    occupancyRate,
                }
            })
            .filter((o) => o.totalEvents > 0)
            .sort((a, b) => b.totalAttendees - a.totalAttendees)

        return { orgs: ranked }
    } catch {
        return { error: "Error al obtener ranking de organizaciones" }
    }
}

/* ═══════════════════════════════════════════════════════════════════
   SECCIÓN 8 — Ocupación por Evento
═══════════════════════════════════════════════════════════════════ */

export async function getOccupancyByEventAction() {
    try {
        const events = await prisma.event.findMany({
            where: { capacity: { not: null } },
            orderBy: { startDate: "desc" },
            select: {
                id: true,
                name: true,
                capacity: true,
                startDate: true,
                city: { select: { name: true } },
                days: {
                    select: {
                        _count: { select: { attendances: true } },
                    },
                },
            },
        })

        const rows = events.map((ev) => {
            const totalAttendees = ev.days.reduce(
                (acc, d) => acc + d._count.attendances,
                0
            )
            const capacity = ev.capacity ?? 0
            const occupancyPct =
                capacity > 0 ? Math.round((totalAttendees / capacity) * 100) : null

            return {
                id: ev.id,
                name: ev.name,
                city: ev.city.name,
                date: ev.startDate.toISOString(),
                capacity,
                totalAttendees,
                occupancyPct,
            }
        })

        // Ordenar de menor a mayor ocupación (para detectar baja conversión)
        rows.sort(
            (a, b) => (a.occupancyPct ?? 999) - (b.occupancyPct ?? 999)
        )

        return { events: rows }
    } catch {
        return { error: "Error al obtener ocupación" }
    }
}

/* ═══════════════════════════════════════════════════════════════════
   SECCIÓN 9 — Actividad de Staff
═══════════════════════════════════════════════════════════════════ */

export async function getStaffActivityAction() {
    try {
        const grouped = await prisma.attendance.groupBy({
            by: ["userId"],
            _count: { id: true },
            orderBy: { _count: { id: "desc" } },
        })

        const userIds = grouped.map((g) => g.userId)
        const users = await prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, name: true, email: true, role: true },
        })

        const userMap = new Map(users.map((u) => [u.id, u]))

        const staff = grouped.map((g) => ({
            userId: g.userId,
            name: userMap.get(g.userId)?.name ?? "Desconocido",
            email: userMap.get(g.userId)?.email ?? "",
            role: userMap.get(g.userId)?.role ?? "STAFF",
            totalCheckIns: g._count.id,
        }))

        // QR vs Manual
        const qrCount = await prisma.attendance.count({
            where: { qrCode: { not: null } },
        })
        const totalCount = await prisma.attendance.count()
        const manualCount = totalCount - qrCount

        return { staff, qrCount, manualCount, totalCount }
    } catch {
        return { error: "Error al obtener actividad de staff" }
    }
}

/* ═══════════════════════════════════════════════════════════════════
   SECCIÓN 10 — Resumen real del dashboard
═══════════════════════════════════════════════════════════════════ */

export async function getDashboardSummaryAction() {
    try {
        const now = new Date()
        const startOfToday = new Date(now)
        startOfToday.setHours(0, 0, 0, 0)
        const endOfToday = new Date(now)
        endOfToday.setHours(23, 59, 59, 999)

        // Eventos activos (startDate <= now <= endDate)
        const activeEvents = await prisma.event.count({
            where: { startDate: { lte: now }, endDate: { gte: now } },
        })

        // Asistentes hoy
        const attendeesToday = await prisma.attendance.count({
            where: {
                attendedAt: { gte: startOfToday, lte: endOfToday },
            },
        })

        // Total eventos
        const totalEvents = await prisma.event.count()

        // Próximo evento
        const nextEvent = await prisma.event.findFirst({
            where: { startDate: { gt: now } },
            orderBy: { startDate: "asc" },
            select: { name: true, startDate: true },
        })

        // Variación: asistentes ayer
        const startOfYesterday = new Date(startOfToday)
        startOfYesterday.setDate(startOfYesterday.getDate() - 1)
        const endOfYesterday = new Date(endOfToday)
        endOfYesterday.setDate(endOfYesterday.getDate() - 1)
        const attendeesYesterday = await prisma.attendance.count({
            where: {
                attendedAt: { gte: startOfYesterday, lte: endOfYesterday },
            },
        })

        const attendeeVariation =
            attendeesYesterday > 0
                ? Math.round(
                      ((attendeesToday - attendeesYesterday) /
                          attendeesYesterday) *
                          100
                  )
                : null

        // Variación total eventos vs mes anterior
        const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const startOfLastMonth = new Date(
            now.getFullYear(),
            now.getMonth() - 1,
            1
        )
        const eventsThisMonth = await prisma.event.count({
            where: { createdAt: { gte: startOfThisMonth } },
        })
        const eventsLastMonth = await prisma.event.count({
            where: {
                createdAt: { gte: startOfLastMonth, lt: startOfThisMonth },
            },
        })

        return {
            activeEvents,
            attendeesToday,
            attendeeVariation,
            totalEvents,
            eventsThisMonth,
            eventsLastMonth,
            nextEvent: nextEvent
                ? {
                      name: nextEvent.name,
                      daysUntil: Math.ceil(
                          (new Date(nextEvent.startDate).getTime() -
                              now.getTime()) /
                              (1000 * 60 * 60 * 24)
                      ),
                  }
                : null,
        }
    } catch {
        return { error: "Error al obtener resumen del dashboard" }
    }
}

/* ═══════════════════════════════════════════════════════════════════
   EXPORTACIÓN A EXCEL
═══════════════════════════════════════════════════════════════════ */

type ExportTable =
    | "attendance-by-event"
    | "city-ranking"
    | "org-ranking"
    | "occupancy"
    | "staff-activity"

export async function exportTableToExcelAction(
    table: ExportTable,
    eventId?: string
): Promise<{ base64: string; filename: string } | { error: string }> {
    const wb = new ExcelJS.Workbook()
    wb.creator = "Eventos Platform"

    const headerStyle: Partial<ExcelJS.Style> = {
        font: { bold: true, color: { argb: "FFFFFFFF" } },
        fill: {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF125AF5" },
        },
        alignment: { horizontal: "center" },
    }

    try {
        if (table === "attendance-by-event" && eventId) {
            const res = await getAttendanceByEventDayAction(eventId)
            if ("error" in res) return { error: res.error! }

            const ws = wb.addWorksheet("Asistencia por Evento")
            ws.columns = [
                { header: "Día", key: "label", width: 20 },
                { header: "Fecha", key: "date", width: 18 },
                { header: "Asistentes", key: "attendees", width: 14 },
            ]
            ws.getRow(1).eachCell((cell) => Object.assign(cell, headerStyle))
            res.days.forEach((d) =>
                ws.addRow({
                    label: d.label,
                    date: new Date(d.date).toLocaleDateString("es-CO"),
                    attendees: d.attendees,
                })
            )
        }

        if (table === "city-ranking") {
            const res = await getCityRankingAction()
            if ("error" in res) return { error: res.error! }

            const ws = wb.addWorksheet("Ranking Ciudades")
            ws.columns = [
                { header: "Ciudad", key: "name", width: 20 },
                { header: "Total Eventos", key: "totalEvents", width: 15 },
                { header: "Total Asistentes", key: "totalAttendees", width: 18 },
                { header: "Promedio Asistentes/Evento", key: "avg", width: 28 },
            ]
            ws.getRow(1).eachCell((cell) => Object.assign(cell, headerStyle))
            res.cities.forEach((c) =>
                ws.addRow({
                    name: c.name,
                    totalEvents: c.totalEvents,
                    totalAttendees: c.totalAttendees,
                    avg: c.avgAttendeesPerEvent,
                })
            )
        }

        if (table === "org-ranking") {
            const res = await getOrganizationRankingAction()
            if ("error" in res) return { error: res.error! }

            const ws = wb.addWorksheet("Ranking Organizaciones")
            ws.columns = [
                { header: "Organización", key: "name", width: 28 },
                { header: "Total Eventos", key: "totalEvents", width: 15 },
                { header: "Total Asistentes", key: "totalAttendees", width: 18 },
                { header: "Tasa Ocupación %", key: "occupancyRate", width: 18 },
            ]
            ws.getRow(1).eachCell((cell) => Object.assign(cell, headerStyle))
            res.orgs.forEach((o) =>
                ws.addRow({
                    name: o.name,
                    totalEvents: o.totalEvents,
                    totalAttendees: o.totalAttendees,
                    occupancyRate:
                        o.occupancyRate !== null ? `${o.occupancyRate}%` : "N/A",
                })
            )
        }

        if (table === "occupancy") {
            const res = await getOccupancyByEventAction()
            if ("error" in res) return { error: res.error! }

            const ws = wb.addWorksheet("Ocupación por Evento")
            ws.columns = [
                { header: "Evento", key: "name", width: 30 },
                { header: "Ciudad", key: "city", width: 16 },
                { header: "Capacidad", key: "capacity", width: 12 },
                { header: "Asistentes", key: "totalAttendees", width: 14 },
                { header: "% Ocupación", key: "occupancyPct", width: 14 },
            ]
            ws.getRow(1).eachCell((cell) => Object.assign(cell, headerStyle))
            res.events.forEach((ev) =>
                ws.addRow({
                    name: ev.name,
                    city: ev.city,
                    capacity: ev.capacity,
                    totalAttendees: ev.totalAttendees,
                    occupancyPct:
                        ev.occupancyPct !== null
                            ? `${ev.occupancyPct}%`
                            : "Sin capacidad",
                })
            )
        }

        if (table === "staff-activity") {
            const res = await getStaffActivityAction()
            if ("error" in res) return { error: res.error! }

            const ws = wb.addWorksheet("Actividad de Staff")
            ws.columns = [
                { header: "Nombre", key: "name", width: 24 },
                { header: "Email", key: "email", width: 28 },
                { header: "Rol", key: "role", width: 14 },
                { header: "Check-ins", key: "totalCheckIns", width: 14 },
            ]
            ws.getRow(1).eachCell((cell) => Object.assign(cell, headerStyle))
            res.staff.forEach((s) =>
                ws.addRow({
                    name: s.name,
                    email: s.email,
                    role: s.role,
                    totalCheckIns: s.totalCheckIns,
                })
            )
        }

        const buffer = await wb.xlsx.writeBuffer()
        const base64 = Buffer.from(buffer).toString("base64")
        const filename = `${table}-${new Date().toISOString().slice(0, 10)}.xlsx`

        return { base64, filename }
    } catch {
        return { error: "Error al generar el archivo Excel" }
    }
}
