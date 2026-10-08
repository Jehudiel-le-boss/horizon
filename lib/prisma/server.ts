import "server-only"

import { PrismaPg } from "@prisma/adapter-pg"

import { Prisma, PrismaClient } from "../../generated/prisma/client"

import { createSupabaseServerClient } from "@/lib/supabase/server"

type PrismaGlobal = typeof globalThis & {
  horizonPrisma?: PrismaClient
}

export class UnauthenticatedPrismaAccessError extends Error {
  constructor() {
    super("An authenticated Supabase user is required.")
    this.name = "UnauthenticatedPrismaAccessError"
  }
}

type AuthenticatedPrismaTransaction = Pick<PrismaClient, "guardians" | "school_memberships">

const prismaGlobal = globalThis as PrismaGlobal

function getPrismaClient() {
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    throw new Error("DATABASE_URL is required for server-side database access.")
  }

  prismaGlobal.horizonPrisma ??= new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  })

  return prismaGlobal.horizonPrisma
}

export async function withAuthenticatedPrisma<T>(
  operation: (
    transaction: AuthenticatedPrismaTransaction,
    userId: string,
  ) => Promise<T>,
): Promise<T> {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },

    error,
  } = await supabase.auth.getUser()

  if (error && error.name !== "AuthSessionMissingError") {
    throw new Error("Unable to verify the Supabase user for database access.", {
      cause: error,
    })
  }

  if (!user) {
    throw new UnauthenticatedPrismaAccessError()
  }

  return getPrismaClient().$transaction(async (transaction) => {
    // Keep the verified identity scoped to this transaction on pooled connections.
    const rlsTransaction =
      transaction as Prisma.TransactionClient & Pick<PrismaClient, "$executeRaw" | "$queryRaw">

    await rlsTransaction.$executeRaw`SET LOCAL ROLE authenticated`

    await rlsTransaction.$queryRaw`
      SELECT
        set_config('request.jwt.claim.sub', ${user.id}, true),
        set_config(
          'request.jwt.claims',
          ${JSON.stringify({ sub: user.id, role: "authenticated" })},
          true
        )
    `

    return operation(
      transaction as Prisma.TransactionClient & AuthenticatedPrismaTransaction,
      user.id,
    )
  })
}
