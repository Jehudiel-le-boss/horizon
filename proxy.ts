import { createServerClient } from "@supabase/ssr"

import { NextResponse, type NextRequest } from "next/server"

import { getSupabasePublicConfig } from "@/lib/supabase/config"

export async function proxy(request: NextRequest) {
  const config = getSupabasePublicConfig()

  if (!config) return NextResponse.next({ request })

  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    config.url,

    config.publishableKey,

    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },

        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })

          response = NextResponse.next({ request })

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })

          for (const name of ["cache-control", "expires", "pragma"]) {
            const value = headers?.[name]

            if (value) response.headers.set(name, value)
          }
        },
      },
    },
  )

  const { error } = await supabase.auth.getClaims()

  if (error && error.name !== "AuthSessionMissingError") throw error

  return response
}

export const config = {
  matcher: ["/parent/:path*", "/admin/:path*", "/login"],
}
