import type { ReactNode } from "react"

import PortalShell from "@/components/portal/portal-shell"
import { requirePortalAccess } from "@/lib/supabase/portal-authorization"

export default async function ParentLayout({
  children,
}: {
  children: ReactNode
}) {
  await requirePortalAccess("parent")

  return <PortalShell role="parent">{children}</PortalShell>
}
