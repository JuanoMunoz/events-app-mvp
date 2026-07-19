'use server'

import { prisma } from "@/lib/prisma"
import { checkIsSuperAdmin, checkSession, runWithAuditContext } from "@/lib/utils/auth"

export async function getAllOrganizationsAction() {
    const session = await checkSession()
    if (!session) return { error: "No tienes permitido ver esto!" }
    try {
        const organizations = await prisma.organization.findMany({
            select: { id: true, name: true, createdAt: true },
            orderBy: { name: "asc" },
        })
        return { organizations }
    } catch (error) {
        console.error(error);
        return { error: "Hubo un error al obtener las organizaciones" }
    }
}

export async function createOrganizationAction(formdata: FormData) {
    const isSuperAdmin = await checkIsSuperAdmin()
    if (!isSuperAdmin) return { error: "No tienes permitido hacer esto!" }

    const name = (formdata.get("name") as string)?.trim()
    if (!name) return { error: "El nombre es requerido" }

    return runWithAuditContext(async () => {
        try {
            const organization = await prisma.organization.create({ data: { name } })
            return { organization }
        } catch {
            return { error: "Hubo un error al crear la organización" }
        }
    })
}

export async function updateOrganizationAction(formdata: FormData) {
    const isSuperAdmin = await checkIsSuperAdmin()
    if (!isSuperAdmin) return { error: "No tienes permitido hacer esto!" }

    const id = (formdata.get("id") as string)?.trim()
    const name = (formdata.get("name") as string)?.trim()

    if (!id || !name) return { error: "Datos faltantes" }

    return runWithAuditContext(async () => {
        try {
            const organization = await prisma.organization.update({ where: { id }, data: { name } })
            return { organization }
        } catch {
            return { error: "Hubo un error al actualizar la organización" }
        }
    })
}

export async function deleteOrganizationAction(formdata: FormData) {
    const isSuperAdmin = await checkIsSuperAdmin()
    if (!isSuperAdmin) return { error: "No tienes permitido hacer esto!" }

    const id = (formdata.get("id") as string)?.trim()
    if (!id) return { error: "ID inválido" }

    return runWithAuditContext(async () => {
        try {
            await prisma.organization.delete({ where: { id } })
            return { success: true }
        } catch {
            return { error: "Hubo un error al eliminar la organización" }
        }
    })
}
