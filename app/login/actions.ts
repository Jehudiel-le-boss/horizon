"use server"

import { cookies } from "next/headers"

import type { PortalRole } from "@/lib/supabase/roles"

export async function enterDemoAccess(portal: PortalRole): Promise<void> {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Le mode démo est uniquement disponible en développement.")
  }

  if (portal !== "parent" && portal !== "admin") {
    throw new Error("Espace de démonstration invalide.")
  }

  const cookieStore = await cookies()

  cookieStore.set("horizon-demo-role", portal, {
    httpOnly: true,

    sameSite: "lax",

    secure: false,

    path: "/",
  })
}

export async function clearDemoAccess(): Promise<void> {
  const cookieStore = await cookies()

  cookieStore.delete("horizon-demo-role")
}
