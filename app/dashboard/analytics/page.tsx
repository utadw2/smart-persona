import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { UserAnalyticsDashboard } from "@/components/analytics/user-analytics-dashboard"

export default async function UserAnalyticsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Fetch user analytics
  const { data: analytics } = await supabase
    .from("analytics")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: true })
    .limit(30)

  const { data: personas } = await supabase.from("personas").select("*").eq("user_id", user.id)

  const { data: messages } = await supabase.from("messages").select("*").eq("user_id", user.id)

  const { data: jobMatches } = await supabase.from("job_matches").select("*, jobs(*)").eq("user_id", user.id)

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader user={user} profile={profile} />
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-muted-foreground">Track your persona performance and engagement</p>
          </div>

          <UserAnalyticsDashboard
            analytics={analytics || []}
            personas={personas || []}
            messages={messages || []}
            jobMatches={jobMatches || []}
          />
        </div>
      </main>
    </div>
  )
}
