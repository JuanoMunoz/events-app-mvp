import { prismaAdapter } from "@better-auth/prisma-adapter";

import { betterAuth } from "better-auth";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { nextCookies } from "better-auth/next-js";
import { role } from "better-auth/client";
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter })
export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql"
    }),
    user: {
        additionalFields: {
            role: {
                type: ["SUPER_ADMIN", "ORGANIZER", "STAFF"],
                required: true,
                defaultValue: "STAFF",
                input: false
            }
        }
    },
    experimental: { joins: true },
    emailAndPassword: { enabled: true, autoSignIn: false },
    plugins: [
        nextCookies()
    ]
})