import { redirect, notFound } from 'next/navigation'
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { PostDetail } from "@/components/community/post-detail"

export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  // UUID format: 8-4-4-4-12 hexadecimal characters
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(id)) {
    notFound()
  }

  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()

  const { data: postData, error: postError } = await supabase
    .from("community_posts")
    .select("*")
    .eq("id", id)
    .maybeSingle()

  if (postError) {
    console.error(" Error fetching post:", postError)
    notFound()
  }

  if (!postData) {
    notFound()
  }

  const { data: userProfile } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url")
    .eq("id", postData.user_id)
    .maybeSingle()

  let personaData = null
  if (postData.persona_id) {
    const { data } = await supabase.from("personas").select("id, name").eq("id", postData.persona_id).maybeSingle()
    personaData = data
  }

  const post = {
    ...postData,
    profiles: userProfile,
    personas: personaData,
  }

  // Increment view count
  if (post.user_id !== user.id) {
    await supabase
      .from("community_posts")
      .update({ views_count: (post.views_count || 0) + 1 })
      .eq("id", id)
  }

  const { data: commentsData } = await supabase
    .from("post_comments")
    .select("*")
    .eq("post_id", id)
    .order("created_at", { ascending: true })

  const comments = await Promise.all(
    (commentsData || []).map(async (comment) => {
      const { data: commentUserProfile } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .eq("id", comment.user_id)
        .maybeSingle()

      return {
        ...comment,
        profiles: commentUserProfile,
      }
    }),
  )

  const { data: likeData } = await supabase
    .from("post_likes")
    .select("id")
    .eq("post_id", id)
    .eq("user_id", user.id)
    .maybeSingle()

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader user={user} profile={profile} />
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-4xl">
          <PostDetail post={post} comments={comments} currentUserId={user.id} isLiked={!!likeData} />
        </div>
      </main>
    </div>
  )
}
