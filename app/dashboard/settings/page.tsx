import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { UserAISettings } from "@/components/settings/user-ai-settings"
import { ProfileSettings } from "@/components/settings/profile-settings"
import { UserPreferencesComponent } from "@/components/settings/user-preferences"

export default async function SettingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const { data: aiSettings } = await supabase.from("ai_settings").select("*").eq("user_id", user.id).single()

  const { data: userPreferences } = await supabase.from("user_preferences").select("*").eq("user_id", user.id).single()

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader user={user} profile={profile} />
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Manage your account and preferences</p>
          </div>
          <ProfileSettings profile={profile} userId={user.id} />
          <UserPreferencesComponent preferences={userPreferences} userId={user.id} />
          <UserAISettings settings={aiSettings} userId={user.id} />
        </div>
      </main>
    </div>
  )
}
