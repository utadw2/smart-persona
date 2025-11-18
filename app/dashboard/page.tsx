import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ActivePersonas } from "@/components/dashboard/active-personas"

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

  const { data: chatMessages } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("sender_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10)

  const { data: posts } = await supabase
    .from("community_posts")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

    return (
      <div className="flex min-h-screen flex-col">
        <DashboardHeader user={user} profile={profile} />
        <main className="flex flex-1 items-center justify-center p-6">
          <div className="w-full max-w-4xl mx-auto">
            <div className="flex justify-center">
              <div className="w-full max-w-2xl">
                <ActivePersonas personas={personas || []} />
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }
