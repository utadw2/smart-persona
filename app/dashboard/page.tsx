import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { ActivePersonas } from "@/components/dashboard/active-personas"
import { AdSpace } from "@/components/ads/ad-space"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  // Fetch user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Fetch user stats
  const { data: personas } = await supabase.from("personas").select("*").eq("user_id", user.id)

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background to-muted/20">
      <DashboardHeader user={user} profile={profile} />
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-6xl space-y-8">
          <AdSpace placement="banner" />

          <div className="space-y-6">
            <StatsCards personasCount={personas?.length || 0} />

            <ActivePersonas personas={personas || []} />
          </div>
        </div>
      </main>
    </div>
  )
}
