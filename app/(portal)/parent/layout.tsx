import type { ReactNode } from "react"

import PortalShell from "@/components/portal/portal-shell"

export default function ParentLayout({ children }: { children: ReactNode }) {
  return <PortalShell role="parent">{children}</PortalShell>
}
