import type { Metadata } from "next"

import "./globals.css"

export const metadata: Metadata = {
  title: "Horizon — Suivi scolaire",

  description:
    "Suivez en toute transparence les contributions scolaires, les paiements et les échéances.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  )
}
