import { z } from "zod"

const publicConfigSchema = z.object({
  url: z.string().url(),

  publishableKey: z.string().min(1),
})

export type SupabasePublicConfig = z.infer<typeof publicConfigSchema>

export function getSupabasePublicConfig(): SupabasePublicConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL

  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!url && !publishableKey) return null

  const result = publicConfigSchema.safeParse({ url, publishableKey })

  if (!result.success) {
    throw new Error(
      `Configuration Supabase incomplète ou invalide: ${
        z.flattenError(result.error).fieldErrors.url
          ? "NEXT_PUBLIC_SUPABASE_URL"
          : "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
      }.`,
    )
  }

  return result.data
}

export function requireSupabasePublicConfig(): SupabasePublicConfig {
  const config = getSupabasePublicConfig()

  if (!config) {
    throw new Error(
      "Supabase n'est pas configuré. Ajoutez NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY dans .env.local.",
    )
  }

  return config
}
