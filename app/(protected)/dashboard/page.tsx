import { Suspense } from "react"
import { prisma } from "@/lib/prisma"
import StatsGrid from "./_components/stats-grid"
import EventCarousel from "./_components/event-carousel"
import EventAttendeesReport from "./_components/event-attendees-report"
import AttendanceByEvent from "./_components/attendance-by-event"
import AttendanceTrend from "./_components/attendance-trend"

import CityRanking from "./_components/city-ranking"
import OrgRanking from "./_components/org-ranking"
import OccupancyTable from "./_components/occupancy-table"
import StaffActivity from "./_components/staff-activity"
import { requireSession } from "@/lib/utils/auth"
import {
    getDashboardSummaryAction,
    getCityRankingAction,
    getOrganizationRankingAction,
    getOccupancyByEventAction,
    getStaffActivityAction,
    getEventsForSelectorAction,
    getAttendanceTrendAction,
    getAttendanceByHourAction,
} from "./analytics-actions"

/* ─── helpers ───────────────────────────────────────────────────── */
function toInputDate(iso: string) {
    const d = new Date(iso)
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, "0")
    const dd = String(d.getDate()).padStart(2, "0")
    return `${yyyy}-${mm}-${dd}`
}

/* ─── skeleton genérico ─────────────────────────────────────────── */
function SectionSkeleton({ lines = 3 }: { lines?: number }) {
    return (
        <div
            className="flex flex-col gap-3 p-4 rounded-sm animate-pulse"
            style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
            }}
        >
            {Array.from({ length: lines }).map((_, i) => (
                <div
                    key={i}
                    className="h-4 rounded"
                    style={{
                        background: "var(--color-skeleton)",
                        width: `${80 - i * 12}%`,
                    }}
                />
            ))}
        </div>
    )
}

/* ─── Página principal ──────────────────────────────────────────── */
export default async function DashboardPage() {
    const session = await requireSession()

    // ── Datos en paralelo ─────────────────────────────────────────
    const [
        dbEvents,
        summary,
        citiesRes,
        orgsRes,
        occupancyRes,
        staffRes,
        eventsForSelector,
        trendRes,
        hoursRes,
    ] = await Promise.all([
        prisma.event.findMany({
            orderBy: { startDate: "desc" },
            include: {
                city: true,
                days: {
                    include: { _count: { select: { attendances: true } } },
                },
            },
        }),
        getDashboardSummaryAction(),
        getCityRankingAction(),
        getOrganizationRankingAction(),
        getOccupancyByEventAction(),
        getStaffActivityAction(),
        getEventsForSelectorAction(),
        getAttendanceTrendAction(30),
        getAttendanceByHourAction(),
    ])

    // ── Transformar eventos para los carouseles ───────────────────
    const now = new Date()
    const events = dbEvents.map((event) => {
        const totalAttendees = event.days.reduce(
            (acc, day) => acc + day._count.attendances,
            0
        )
        const start = new Date(event.startDate)
        const end = new Date(event.endDate)
        let status: "active" | "upcoming" | "past" = "past"
        if (now >= start && now <= end) status = "active"
        else if (now < start) status = "upcoming"

        return {
            id: event.id,
            title: event.name,
            city: event.city.name,
            date: event.startDate.toISOString(),
            time: event.startDate.toLocaleTimeString("es-CO", {
                hour: "2-digit",
                minute: "2-digit",
            }),
            attendees: totalAttendees,
            capacity: event.capacity ?? 0,
            status,
        }
    })

    const activeEvents = events.filter((e) => e.status === "active")
    const upcomingEvents = events.filter((e) => e.status === "upcoming")
    const pastEvents = events.filter((e) => e.status === "past")

    // ── Stats cards reales ────────────────────────────────────────
    const isSummaryOk = summary && !("error" in summary)
    const stats = [
        {
            label: "Eventos activos",
            value: isSummaryOk ? String(summary.activeEvents) : activeEvents.length.toString(),
            sub: "en este momento",
            accent: "primary" as const,
        },
        {
            label: "Asistentes hoy",
            value: isSummaryOk
                ? summary.attendeesToday.toLocaleString("es-CO")
                : "—",
            sub:
                isSummaryOk && summary.attendeeVariation !== null
                    ? `${summary.attendeeVariation >= 0 ? "+" : ""}${summary.attendeeVariation}% vs ayer`
                    : "Sin datos de ayer",
            accent: "accent" as const,
        },
        {
            label: "Total eventos",
            value: isSummaryOk ? String(summary.totalEvents) : String(events.length),
            sub:
                isSummaryOk
                    ? summary.eventsLastMonth > 0
                        ? `${summary.eventsThisMonth} este mes vs ${summary.eventsLastMonth} anterior`
                        : `${summary.eventsThisMonth} creados este mes`
                    : "histórico",
            accent: "primary" as const,
        },
        {
            label: "Próximo evento",
            value:
                isSummaryOk && summary.nextEvent
                    ? `${summary.nextEvent.daysUntil}d`
                    : upcomingEvents.length > 0
                    ? "pronto"
                    : "—",
            sub:
                isSummaryOk && summary.nextEvent
                    ? summary.nextEvent.name
                    : upcomingEvents[0]?.title ?? "Sin próximos eventos",
            accent: "accent" as const,
        },
    ]

    // ── Preparar datos para los componentes ──────────────────────
    const selectorEvents =
        !eventsForSelector || "error" in eventsForSelector
            ? []
            : eventsForSelector.events.map((ev) => ({
                  ...ev,
                  startDate: new Date(ev.startDate).toISOString(),
              }))

    const cities = !citiesRes || "error" in citiesRes ? [] : citiesRes.cities
    const orgs = !orgsRes || "error" in orgsRes ? [] : orgsRes.orgs
    const occupancy =
        !occupancyRes || "error" in occupancyRes ? [] : occupancyRes.events
    const staffData =
        !staffRes || "error" in staffRes
            ? { staff: [], qrCount: 0, manualCount: 0, totalCount: 0 }
            : staffRes

    const initialTrend =
        !trendRes || "error" in trendRes ? [] : trendRes.trend
    const initialHours =
        !hoursRes || "error" in hoursRes ? [] : hoursRes.hours

    return (
        <div className="flex flex-col gap-8 px-5 py-7 lg:px-8 lg:py-8 max-w-5xl">
            {/* Header */}
            <header>
                <p
                    className="text-xs uppercase tracking-widest mb-0.5"
                    style={{ color: "var(--color-text-muted)" }}
                >
                    Bienvenido
                </p>
                <h1
                    className="text-2xl font-semibold"
                    style={{ color: "var(--color-text)" }}
                >
                    {session.user.name}
                </h1>
                <p
                    className="text-sm mt-0.5"
                    style={{ color: "var(--color-text-muted)" }}
                >
                    {session.user.email} · {session.user.role}
                </p>
            </header>

            {/* ── 1. RESUMEN ─────────────────────────────────────────────── */}
            <section>
                <h2
                    className="text-xs uppercase tracking-widest mb-3"
                    style={{ color: "var(--color-text-muted)" }}
                >
                    Resumen
                </h2>
                <StatsGrid stats={stats} />
            </section>

            {/* ── 2. ACTIVOS AHORA ───────────────────────────────────────── */}
            <EventCarousel
                title="Activos ahora"
                events={activeEvents}
                variant="active"
            />

            {/* ── 3. PRÓXIMOS EVENTOS ────────────────────────────────────── */}
            <EventCarousel
                title="Próximos eventos"
                events={upcomingEvents}
                variant="upcoming"
            />

            {/* ── 4. ASISTENCIA POR EVENTO ───────────────────────────────── */}
            <AttendanceByEvent events={selectorEvents} />

            {/* ── 4.5. INFORME DETALLADO DE ASISTENTES ─────────────────────── */}
            {selectorEvents.length > 0 && (
                <EventAttendeesReport events={selectorEvents} />
            )}


            {/* ── 5. TENDENCIA DE ASISTENCIA ─────────────────────────────── */}
            <AttendanceTrend
                initialTrend={initialTrend}
                initialHours={initialHours}
            />

            {/* ── 6. RANKING DE CIUDADES ─────────────────────────────────── */}
            <CityRanking cities={cities} />

            {/* ── 7. RANKING DE ORGANIZACIONES ──────────────────────────── */}
            <OrgRanking orgs={orgs} />

            {/* ── 8. OCUPACIÓN POR EVENTO ────────────────────────────────── */}
            <OccupancyTable events={occupancy} />

            {/* ── 9. ACTIVIDAD DE STAFF ──────────────────────────────────── */}
            <StaffActivity
                staff={staffData.staff}
                qrCount={"qrCount" in staffData ? staffData.qrCount : 0}
                manualCount={"manualCount" in staffData ? staffData.manualCount : 0}
                totalCount={"totalCount" in staffData ? staffData.totalCount : 0}
            />

            {/* ── Eventos pasados (al final) ─────────────────────────────── */}
            <EventCarousel
                title="Eventos pasados"
                events={pastEvents}
                variant="past"
            />
        </div>
    )
}