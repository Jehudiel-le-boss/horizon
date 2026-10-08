import LoginRoute from "@/components/auth/login-route"
import { getSupabasePublicConfig } from "@/lib/supabase/config"

export default function LoginPage() {
  return (
    <LoginRoute
      supabaseConfigured={Boolean(getSupabasePublicConfig())}
      demoEnabled={process.env.NODE_ENV !== "production"}
    />
  )
}
