'use server'

import { prisma } from "@/lib/prisma"
import { checkSession, runWithAuditContext } from "@/lib/utils/auth"

export async function registerAttendanceAction(formdata: FormData) {
    const session = await checkSession()
    if (!session || !session.user) {
        console.warn(`[Registro Asistencia] ERROR -> Intento sin sesión iniciada.`)
        return { error: "Debes iniciar sesión para registrar asistencia" }
    }

    const eventId = formdata.get("eventId") as string
    const passedEventDayId = formdata.get("eventDayId") as string
    const cedula = (formdata.get("cedula") as string)?.trim()
    const nombre = (formdata.get("nombre") as string)?.trim()
    const apellido = (formdata.get("apellido") as string)?.trim()
    const telefono = (formdata.get("telefono") as string)?.trim() || ""
    const correo = (formdata.get("correo") as string)?.trim() || ""

    if (!eventId || !cedula || !nombre || !apellido) {
        console.warn(`[Registro Asistencia] ERROR -> Faltan campos. (Cédula: ${cedula}, Nombre: ${nombre}, Apellido: ${apellido})`)
        return { error: "Faltan campos obligatorios (Evento, Cédula, Nombre, Apellido)" }
    }

    return runWithAuditContext(async () => {
        try {
            // 1. Obtener los días del evento
            const eventDays = await prisma.eventDay.findMany({
                where: { eventId },
                orderBy: { date: "asc" },
                include: { event: { include: { organization: true } } }
            })

            if (eventDays.length === 0) {
                console.warn(`[Registro Asistencia] ERROR -> El evento (ID: ${eventId}) no tiene días configurados. (Cédula: ${cedula})`)
                return { error: "El evento no tiene días configurados" }
            }

            // Determinar el día de hoy
            const today = new Date()
            today.setHours(0, 0, 0, 0)

            // Buscar si algún día coincide con hoy
            let targetDay = passedEventDayId 
                ? eventDays.find(d => d.id === passedEventDayId)
                : eventDays.find(day => {
                    const dayDate = new Date(day.date)
                    dayDate.setHours(0, 0, 0, 0)
                    return dayDate.getTime() === today.getTime()
                })

            // Si no coincide con hoy ni se pasó uno explícito, por defecto usar el primer día
            if (!targetDay) {
                targetDay = eventDays[0]
            }

            // 2. Resolver asistente (buscar por cédula o correo único)
            const searchEmail = correo || `${cedula}@temporal.com`
            let assistant = await prisma.assistant.findFirst({
                where: {
                    OR: [
                        { identification: cedula },
                        { email: searchEmail }
                    ]
                }
            })

            const fullName = `${nombre} ${apellido}`.trim()

            if (assistant) {
                // Actualizar datos del asistente
                assistant = await prisma.assistant.update({
                    where: { id: assistant.id },
                    data: {
                        name: fullName,
                        email: searchEmail,
                        phoneNumber: telefono || assistant.phoneNumber
                    }
                })
            } else {
                // Crear nuevo asistente
                assistant = await prisma.assistant.create({
                    data: {
                        identification: cedula,
                        name: fullName,
                        email: searchEmail,
                        phoneNumber: telefono
                    }
                })
            }

            // 3. Crear o actualizar la asistencia
            const attendance = await prisma.attendance.upsert({
                where: {
                    assistantId_eventDayId: {
                        assistantId: assistant.id,
                        eventDayId: targetDay.id
                    }
                },
                create: {
                    assistantId: assistant.id,
                    eventDayId: targetDay.id,
                    userId: session.user.id,
                    checkedIn: true
                },
                update: {
                    checkedIn: true
                }
            })

            const event = targetDay.event

            console.log(`[Registro Asistencia] OK -> Cédula: ${cedula} | Nombre: ${fullName} | Evento: "${event.name}" | Staff: ${session.user.name}`)

            return { 
                success: true, 
                assistantName: fullName,
                gafeteData: {
                    attendanceId: attendance.id,
                    eventName: event.name,
                    eventDate: targetDay.date.toISOString(),
                    assistantName: fullName,
                    identification: cedula,
                    location: event.location,
                    organizationName: event.organization.name
                }
            }
        } catch (e: any) {
            console.error("Error al registrar asistencia:", e)
            return { error: "Error interno al registrar la asistencia" }
        }
    })
}

export async function findAssistantByIdentificationAction(identification: string, eventDayId?: string) {
    const session = await checkSession()
    if (!session) return { error: "No autorizado" }

    try {
        const assistant = await prisma.assistant.findFirst({
            where: { identification }
        })

        if (!assistant) return { found: false }

        let alreadyCheckedIn = false
        if (eventDayId) {
            const existingAttendance = await prisma.attendance.findUnique({
                where: {
                    assistantId_eventDayId: {
                        assistantId: assistant.id,
                        eventDayId
                    }
                }
            })
            if (existingAttendance) {
                alreadyCheckedIn = true
            }
        }

        const parts = assistant.name.split(" ")
        const nombre = parts[0] || ""
        const apellido = parts.slice(1).join(" ") || ""
        
        return {
            found: true,
            alreadyCheckedIn,
            assistant: {
                nombre,
                apellido,
                telefono: assistant.phoneNumber,
                correo: assistant.email.endsWith("@temporal.com") ? "" : assistant.email
            }
        }
    } catch {
        return { error: "Error de servidor" }
    }
}
