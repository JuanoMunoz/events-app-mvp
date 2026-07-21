'use server'

import { prisma } from "@/lib/prisma"
import { checkIsSuperAdmin, checkSession, runWithAuditContext } from "@/lib/utils/auth"

/** Obtiene todos los eventos con ciudad y días */
export async function getAllEventsAction() {
    const session = await checkSession()
    if (!session) return { error: "Debes iniciar sesión" }

    try {
        const events = await prisma.event.findMany({
            orderBy: { startDate: "desc" },
            select: {
                id: true,
                name: true,
                description: true,
                location: true,
                capacity: true,
                startDate: true,
                endDate: true,
                createdAt: true,
                organization: { select: { id: true, name: true } },
                city: { select: { id: true, name: true } },
                days: { select: { id: true, date: true, title: true } },
            },
        })

        const now = Date.now()
        events.sort((a, b) => {
            const diffA = Math.abs(now - new Date(a.startDate).getTime())
            const diffB = Math.abs(now - new Date(b.startDate).getTime())
            return diffA - diffB
        })

        return { events }
    } catch {
        return { error: "Error al obtener los eventos" }
    }
}


export async function createEventAction(formdata: FormData) {
    const isSuperAdmin = await checkIsSuperAdmin()
    if (!isSuperAdmin) return { error: "No tienes permiso para crear eventos" }

    const name = (formdata.get("name") as string)?.trim()
    const description = (formdata.get("description") as string)?.trim()
    const location = (formdata.get("location") as string)?.trim() || null
    const cityInput = (formdata.get("cityInput") as string)?.trim()
    const organizationInput = (formdata.get("organizationInput") as string)?.trim()
    const capacity = formdata.get("capacity") ? Number(formdata.get("capacity")) : null
    const startDate = formdata.get("startDate") as string
    const endDate = formdata.get("endDate") as string
    const daysRaw = formdata.get("days") as string
    let parsedDays: { id?: string, date: string, title: string }[] = []
    try { if (daysRaw) parsedDays = JSON.parse(daysRaw) } catch { }

    if (!name || !description || !cityInput || !organizationInput || !startDate || !endDate) {
        return { error: "Faltan campos obligatorios (nombre, descripción, ciudad, organización, fechas)" }
    }

    if (parsedDays.length === 0) {
        return { error: "Debes definir al menos un día para el evento" }
    }

    return runWithAuditContext(async () => {
        try {
            // Resolve City
            let city = await prisma.city.findFirst({ where: { name: { equals: cityInput, mode: "insensitive" } } })
            if (!city) {
                city = await prisma.city.create({ data: { name: cityInput } })
            }

            // Resolve Organization
            let org = await prisma.organization.findFirst({ where: { name: { equals: organizationInput, mode: "insensitive" } } })
            if (!org) {
                org = await prisma.organization.create({ data: { name: organizationInput } })
            }

            const event = await prisma.event.create({
                data: {
                    name,
                    description,
                    location,
                    cityId: city.id,
                    organizationId: org.id,
                    capacity,
                    startDate: new Date(`${startDate}T12:00:00`),
                    endDate: new Date(`${endDate}T12:00:00`),
                    days: {
                        create: parsedDays.map((d) => ({
                            date: new Date(`${d.date}T12:00:00`),
                            title: d.title || null,
                        }))
                    }
                },
                select: {
                    id: true,
                    name: true,
                    description: true,
                    location: true,
                    capacity: true,
                    startDate: true,
                    endDate: true,
                    createdAt: true,
                    organization: { select: { id: true, name: true } },
                    city: { select: { id: true, name: true } },
                    days: { select: { id: true, date: true, title: true } },
                },
            })
            return { event }
        } catch (exception) {
            console.log(exception)
            return { error: "Error al crear el evento" }
        }
    })
}

/** Actualiza un evento existente */
export async function updateEventAction(formdata: FormData) {
    const isSuperAdmin = await checkIsSuperAdmin()
    if (!isSuperAdmin) return { error: "No tienes permiso para editar eventos" }

    const id = (formdata.get("id") as string)?.trim()
    const name = (formdata.get("name") as string)?.trim()
    const description = (formdata.get("description") as string)?.trim()
    const location = (formdata.get("location") as string)?.trim() || null
    const cityInput = (formdata.get("cityInput") as string)?.trim()
    const organizationInput = (formdata.get("organizationInput") as string)?.trim()
    const capacity = formdata.get("capacity") ? Number(formdata.get("capacity")) : null
    const startDate = formdata.get("startDate") as string
    const endDate = formdata.get("endDate") as string
    const daysRaw = formdata.get("days") as string
    let parsedDays: { id?: string, date: string, title: string }[] = []
    try { if (daysRaw) parsedDays = JSON.parse(daysRaw) } catch { }

    if (!id || !name || !description || !cityInput || !organizationInput || !startDate || !endDate) {
        return { error: "Datos faltantes o inválidos" }
    }

    if (parsedDays.length === 0) {
        return { error: "Debes definir al menos un día para el evento" }
    }

    return runWithAuditContext(async () => {
        try {
            // Resolve City
            let city = await prisma.city.findFirst({ where: { name: { equals: cityInput, mode: "insensitive" } } })
            if (!city) {
                city = await prisma.city.create({ data: { name: cityInput } })
            }

            // Resolve Organization
            let org = await prisma.organization.findFirst({ where: { name: { equals: organizationInput, mode: "insensitive" } } })
            if (!org) {
                org = await prisma.organization.create({ data: { name: organizationInput } })
            }

            const event = await prisma.event.update({
                where: { id },
                data: {
                    name,
                    description,
                    location,
                    cityId: city.id,
                    organizationId: org.id,
                    capacity,
                    startDate: new Date(`${startDate}T12:00:00`),
                    endDate: new Date(`${endDate}T12:00:00`),
                    days: {
                        deleteMany: {
                            id: { notIn: parsedDays.filter(d => d.id).map(d => d.id as string) }
                        },
                        create: parsedDays.filter(d => !d.id).map((d) => ({
                            date: new Date(`${d.date}T12:00:00`),
                            title: d.title || null,
                        })),
                        update: parsedDays.filter(d => d.id).map((d) => ({
                            where: { id: d.id },
                            data: {
                                date: new Date(`${d.date}T12:00:00`),
                                title: d.title || null,
                            }
                        }))
                    }
                },
                select: {
                    id: true,
                    name: true,
                    description: true,
                    location: true,
                    capacity: true,
                    startDate: true,
                    endDate: true,
                    createdAt: true,
                    organization: { select: { id: true, name: true } },
                    city: { select: { id: true, name: true } },
                    days: { select: { id: true, date: true, title: true } },
                },
            })
            return { event }
        } catch {
            return { error: "Error al actualizar el evento" }
        }
    })
}

/** Elimina un evento */
export async function deleteEventAction(formdata: FormData) {
    const isSuperAdmin = await checkIsSuperAdmin()
    if (!isSuperAdmin) return { error: "No tienes permiso para eliminar eventos" }

    const id = (formdata.get("id") as string)?.trim()
    if (!id) return { error: "ID inválido" }

    return runWithAuditContext(async () => {
        try {
            await prisma.event.delete({ where: { id } })
            return { success: true }
        } catch {
            return { error: "Error al eliminar el evento" }
        }
    })
}

/** Añade un día a un evento */
export async function createEventDayAction(formdata: FormData) {
    const isSuperAdmin = await checkIsSuperAdmin()
    if (!isSuperAdmin) return { error: "No tienes permiso" }

    const eventId = (formdata.get("eventId") as string)?.trim()
    const date = formdata.get("date") as string
    const title = (formdata.get("title") as string)?.trim() || null

    if (!eventId || !date) return { error: "Evento y fecha son obligatorios" }

    return runWithAuditContext(async () => {
        try {
            const day = await prisma.eventDay.create({
                data: { eventId, date: new Date(`${date}T12:00:00`), title },
            })
            return { day }
        } catch {
            return { error: "Error al añadir el día" }
        }
    })
}
