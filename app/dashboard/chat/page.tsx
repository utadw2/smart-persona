import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ChatInterface } from "@/components/chat/chat-interface"

export default async function ChatPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Get user's conversations
  const { data: conversations } = await supabase
    .from("chat_conversations")
    .select("*")
    .or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`)
    .order("last_message_at", { ascending: false })

  // Fetch participant profiles separately
  const conversationsWithProfiles = await Promise.all(
    (conversations || []).map(async (conv) => {
      const otherId = conv.participant1_id === user.id ? conv.participant2_id : conv.participant1_id
      const { data: otherProfile } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .eq("id", otherId)
        .single()

      return {
        ...conv,
        participant1: conv.participant1_id === user.id ? profile : otherProfile,
        participant2: conv.participant2_id === user.id ? profile : otherProfile,
        participant1_id: conv.participant1_id,
        participant2_id: conv.participant2_id,
      }
    }),
  )

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader user={user} profile={profile} />
      <main className="flex-1">
        <ChatInterface currentUserId={user.id} initialConversations={conversationsWithProfiles} />
      </main>
    </div>
  )
}
