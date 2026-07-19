import { authClient } from "@/lib/auth/client";
import { useState } from "react";
import { useRedirect } from "./use-navigation";
interface User {
    Email: string
    Password: string
}


export function useAuth() {
    const { signIn, signOut, useSession } = authClient;
    const [loginStatus, setLoginStatus] = useState("")
    const { redirect } = useRedirect()
    const login = async (user: User) => {
        setLoginStatus("pending")
        await signIn.email({
            email: user.Email,
            password: user.Password
        })
    }
    const logout = async () => {
        await signOut({
            fetchOptions: {
                onSuccess: () => {
                    redirect("/login")
                }
            }
        })
    }
    return { login, logout, }
}