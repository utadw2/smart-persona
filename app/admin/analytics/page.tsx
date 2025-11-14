import { createClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/lib/auth/admin"
import { AdminHeader } from "@/components/admin/admin-header"
import { AdminAnalyticsCharts } from "@/components/admin/admin-analytics-charts"

export default async function AdminAnalyticsPage() {
  const { user, profile } = await requireAdmin()
  const supabase = await createClient()

  const { data: analytics } = await supabase.from("analytics").select("*").order("date", { ascending: true }).limit(30)
  const { data: allUsers } = await supabase.from("profiles").select("*")
  const { data: allPersonas } = await supabase.from("personas").select("*")
  const { data: allMessages } = await supabase.from("messages").select("*")

  return (
    <div className="flex min-h-screen flex-col">
      <AdminHeader user={user} profile={profile} />
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-muted-foreground">Platform usage and performance metrics</p>
          </div>
          <AdminAnalyticsCharts
            data={analytics || []}
            users={allUsers || []}
            personas={allPersonas || []}
            messages={allMessages || []}
          />
        </div>
      </main>
    </div>
  )
}
