"use client"

import { useRouter } from "next/navigation"

import { Auth } from "./login-page"

export default function LoginRoute() {
  const router = useRouter()

  return (
    <Auth
      onBack={() => router.push("/")}
      onLogin={(role) => router.push(`/${role}`)}
    />
  )
}
