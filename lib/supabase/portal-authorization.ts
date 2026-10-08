import { cookies } from "next/headers"

import { redirect } from "next/navigation"

import { getSupabasePublicConfig } from "@/lib/supabase/config"

import {
  UnauthenticatedPrismaAccessError,
  withAuthenticatedPrisma,
} from "@/lib/prisma/server"

import { adminSchoolRoles, type PortalRole } from "@/lib/supabase/roles"

export async function requirePortalAccess(portal: PortalRole): Promise<void> {
  const cookieStore = await cookies()

  const demoRole = cookieStore.get("horizon-demo-role")?.value

  if (process.env.NODE_ENV !== "production" && demoRole === portal) {
    return
  }

  if (!getSupabasePublicConfig()) redirect("/login")

  let hasAccess: boolean

  try {
    hasAccess = await withAuthenticatedPrisma(async (transaction, userId) => {
      if (portal === "admin") {
        const membership = await transaction.school_memberships.findFirst({
          where: {
            user_id: userId,
            status: "active",
            role: { in: [...adminSchoolRoles] },
          },
          select: { school_id: true },
        })

        return membership !== null
      }

      const guardian = await transaction.guardians.findFirst({
        where: {
          user_id: userId,
          guardian_student_links: { some: { status: "verified" } },
        },
        select: { id: true },
      })

      return guardian !== null
    })
  } catch (authorizationError) {
    if (authorizationError instanceof UnauthenticatedPrismaAccessError) {
      redirect("/login")
    }

    throw new Error("Impossible de vérifier les autorisations du portail.", {
      cause: authorizationError,
    })
  }

  if (!hasAccess) {
    redirect("/login?reason=role")
  }
}
