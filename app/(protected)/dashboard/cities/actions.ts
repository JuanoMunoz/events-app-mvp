'use server'

import { prisma } from "@/lib/prisma"
import { checkIsSuperAdmin, checkSession, runWithAuditContext } from "@/lib/utils/auth"

export default async function getAllCitiesAction() {
    const session = await checkSession()
    if (!session) return { error: "No tienes permitido ver esto!" }
    try {
        const cities = await prisma.city.findMany({
            select: { id: true, name: true, createdAt: true },
            orderBy: { name: "asc" },
        })
        return { cities }
    } catch {
        return { error: "Hubo un error al obtener las ciudades" }
    }
}

export async function createCityAction(formdata: FormData) {
    const isSuperAdmin = await checkIsSuperAdmin()
    if (!isSuperAdmin) return { error: "No tienes permitido hacer esto!" }

    const name = (formdata.get("name") as string)?.trim()
    if (!name) return { error: "El nombre es requerido" }

    return runWithAuditContext(async () => {
        try {
            const city = await prisma.city.create({ data: { name } })
            return { city }
        } catch {
            return { error: "Hubo un error al crear la ciudad" }
        }
    })
}

export async function updateCityAction(formdata: FormData) {
    const isSuperAdmin = await checkIsSuperAdmin()
    if (!isSuperAdmin) return { error: "No tienes permitido hacer esto!" }

    const id = Number(formdata.get("id"))
    const name = (formdata.get("name") as string)?.trim()

    if (!id || !name) return { error: "Datos faltantes" }

    return runWithAuditContext(async () => {
        try {
            const city = await prisma.city.update({ where: { id }, data: { name } })
            return { city }
        } catch {
            return { error: "Hubo un error al actualizar la ciudad" }
        }
    })
}

export async function deleteCityAction(formdata: FormData) {
    const isSuperAdmin = await checkIsSuperAdmin()
    if (!isSuperAdmin) return { error: "No tienes permitido hacer esto!" }

    const id = Number(formdata.get("id"))
    if (!id) return { error: "ID inválido" }

    return runWithAuditContext(async () => {
        try {
            await prisma.city.delete({ where: { id } })
            return { success: true }
        } catch {
            return { error: "Hubo un error al eliminar la ciudad" }
        }
    })
}