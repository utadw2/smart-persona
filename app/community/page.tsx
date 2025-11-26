import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { CommunityPersonas } from "@/components/community/community-personas"
import { CommunityPosts } from "@/components/community/community-posts"
import { CommunityChatSidebar } from "@/components/community/community-chat-sidebar"
import { AdSpace } from "@/components/ads/ad-space"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function CommunityPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const { data: personasData } = await supabase
    .from("personas")
    .select("*")
    .eq("visibility", "published")
    .order("views_count", { ascending: false })

  const publicPersonas = await Promise.all(
    (personasData || []).map(async (persona) => {
      const { data: userProfile } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, bio")
        .eq("id", persona.user_id)
        .maybeSingle()

      return {
        ...persona,
        profiles: userProfile,
      }
    }),
  )

  const { data: postsData } = await supabase
    .from("community_posts")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(50)

  const posts = await Promise.all(
    (postsData || []).map(async (post) => {
      const { data: userProfile } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .eq("id", post.user_id)
        .maybeSingle()

      let personaData = null
      if (post.persona_id) {
        const { data } = await supabase.from("personas").select("id, name").eq("id", post.persona_id).maybeSingle()
        personaData = data
      }

      return {
        ...post,
        profiles: userProfile,
        personas: personaData,
      }
    }),
  )

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader user={user} profile={profile} />
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Community</h1>
            <p className="text-muted-foreground">Discover personas and connect with professionals</p>
          </div>

          <AdSpace placement="banner" />

          <Tabs defaultValue="personas" className="w-full">
            <TabsList>
              <TabsTrigger value="personas">Personas</TabsTrigger>
              <TabsTrigger value="posts">Posts</TabsTrigger>
            </TabsList>
            <TabsContent value="personas" className="mt-6">
              <CommunityPersonas personas={publicPersonas} currentUserId={user.id} />
            </TabsContent>
            <TabsContent value="posts" className="mt-6">
              <CommunityPosts posts={posts} currentUserId={user.id} />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <CommunityChatSidebar currentUserId={user.id} />
    </div>
  )
}
