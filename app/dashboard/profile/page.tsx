import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ProfileView } from "@/components/profile/profile-view"
import { ProfileStats } from "@/components/profile/profile-stats"
import { ProfileActivity } from "@/components/profile/profile-activity"

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const { data: personas } = await supabase.from("personas").select("*").eq("user_id", user.id)

  const { data: chatMessages } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("sender_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5)

  const { data: posts } = await supabase
    .from("community_posts")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader user={user} profile={profile} />
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-5xl space-y-6">
          <ProfileView profile={profile} userId={user.id} />
          <ProfileStats
            personasCount={personas?.length || 0}
            chatMessagesCount={chatMessages?.length || 0}
            postsCount={posts?.length || 0}
          />
          <ProfileActivity messages={chatMessages || []} personas={personas || []} />
        </div>
      </main>
    </div>
  )
}
