import { NextResponse, type NextRequest } from "next/server"

import { createSupabaseServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code")

  const requestedPath = request.nextUrl.searchParams.get("next")

  const next =
    requestedPath?.startsWith("/") && !requestedPath.startsWith("//")
      ? requestedPath
      : "/"

  const redirectUrl = new URL(next, request.url)

  if (redirectUrl.origin !== request.nextUrl.origin) {
    redirectUrl.pathname = "/"

    redirectUrl.search = ""
  }

  if (!code) {
    return NextResponse.redirect(new URL("/login?recovery=error", request.url))
  }

  const supabase = await createSupabaseServerClient()

  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error(
      "Échec de validation du lien d’authentification Supabase.",
      error,
    )

    return NextResponse.redirect(new URL("/login?recovery=error", request.url))
  }

  return NextResponse.redirect(redirectUrl)
}
