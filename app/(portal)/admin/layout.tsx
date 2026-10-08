import type { ReactNode } from "react"

import PortalShell from "@/components/portal/portal-shell"
import { requirePortalAccess } from "@/lib/supabase/portal-authorization"

export default async function AdminLayout({
  children,
}: {
  children: ReactNode
}) {
  await requirePortalAccess("admin")

  return <PortalShell role="admin">{children}</PortalShell>
}
