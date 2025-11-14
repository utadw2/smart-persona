import { createClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/lib/auth/admin"
import { AdminHeader } from "@/components/admin/admin-header"
import { GlobalAISettings } from "@/components/admin/global-ai-settings"

export default async function AdminSettingsPage() {
  const { user, profile } = await requireAdmin()
  const supabase = await createClient()

  const { data: globalSettings } = await supabase.from("ai_settings").select("*").eq("is_global", true).single()

  return (
    <div className="flex min-h-screen flex-col">
      <AdminHeader user={user} profile={profile} />
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Global Settings</h1>
            <p className="text-muted-foreground">Configure platform-wide AI settings</p>
          </div>
          <GlobalAISettings settings={globalSettings} />
        </div>
      </main>
    </div>
  )
}
