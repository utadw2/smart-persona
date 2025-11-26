import { createClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/lib/auth/admin"
import { AdminHeader } from "@/components/admin/admin-header"
import { AdminStatsCards } from "@/components/admin/admin-stats-cards"
import { UsersTable } from "@/components/admin/users-table"
import { SystemHealth } from "@/components/admin/system-health"
import { AdminAnalyticsCharts } from "@/components/admin/admin-analytics-charts"

export default async function AdminPage() {
  const { user, profile } = await requireAdmin()
  const supabase = await createClient()

  // Fetch admin stats
  const { data: allUsers } = await supabase.from("profiles").select("*")

  const { data: allPersonas } = await supabase.from("personas").select("*")

  const { data: allMessages } = await supabase.from("chat_messages").select("*")

  const { data: analytics } = await supabase.from("analytics").select("*").order("date", { ascending: false }).limit(30)

  const { data: allPosts } = await supabase.from("community_posts").select("*")
  const { data: allAds } = await supabase.from("ads").select("*")

  return (
    <div className="flex min-h-screen flex-col">
      <AdminHeader user={user} profile={profile} />
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">System overview and user management</p>
          </div>

          <AdminStatsCards
            usersCount={allUsers?.length || 0}
            personasCount={allPersonas?.length || 0}
            messagesCount={allMessages?.length || 0}
            postsCount={allPosts?.length || 0}
            adsCount={allAds?.length || 0}
            analytics={analytics || []}
          />

          <AdminAnalyticsCharts
            data={analytics || []}
            users={allUsers || []}
            personas={allPersonas || []}
            messages={allMessages || []}
          />

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <UsersTable users={allUsers || []} />
            </div>
            <div>
              <SystemHealth />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
