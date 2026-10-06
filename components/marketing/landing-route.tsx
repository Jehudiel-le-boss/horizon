"use client"

import { useRouter } from "next/navigation"

import { Landing } from "./landing-page"

export default function LandingRoute() {
  const router = useRouter()

  return (
    <Landing
      onLogin={() => router.push("/login")}
      onExplore={() => router.push("/parent")}
    />
  )
}
