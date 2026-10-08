"use client"

import { useRouter } from "next/navigation"

import { enterDemoAccess } from "@/app/login/actions"

import { Auth } from "./login-page"

export default function LoginRoute({
  supabaseConfigured,
  demoEnabled,
}: {
  supabaseConfigured: boolean
  demoEnabled: boolean
}) {
  const router = useRouter()

  return (
    <Auth
      onBack={() => router.push("/")}
      onLogin={(role) => router.push(`/${role}`)}
      onDemo={async (role) => {
        await enterDemoAccess(role)
        router.push(`/${role}`)
      }}
      supabaseConfigured={supabaseConfigured}
      demoEnabled={demoEnabled}
    />
  )
}
