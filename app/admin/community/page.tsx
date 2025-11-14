import { createClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/lib/auth/admin"
import { AdminHeader } from "@/components/admin/admin-header"
import { AdminCommunityPosts } from "@/components/admin/admin-community-posts"

export default async function AdminCommunityPage() {
  const { user, profile } = await requireAdmin()
  const supabase = await createClient()

  // Fetch all posts with author info
  const { data: posts } = await supabase.from("community_posts").select("*").order("created_at", { ascending: false })

  // Fetch profiles separately for each post
  const postsWithProfiles = await Promise.all(
    (posts || []).map(async (post) => {
      const { data: authorProfile } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .eq("id", post.user_id)
        .maybeSingle()

      return {
        ...post,
        profiles: authorProfile,
      }
    }),
  )

  return (
    <div className="flex min-h-screen flex-col">
      <AdminHeader user={user} profile={profile} />
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Community Management</h1>
            <p className="text-muted-foreground">View and manage all community posts</p>
          </div>

          <AdminCommunityPosts posts={postsWithProfiles} currentUserId={user.id} />
        </div>
      </main>
    </div>
  )
}
