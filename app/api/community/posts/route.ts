import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { userId, title, content, postType, personaId, tags, imageUrl } = await request.json()

  if (userId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { data, error } = await supabase
    .from("community_posts")
    .insert({
      user_id: userId,
      title,
      content,
      post_type: postType,
      persona_id: personaId,
      tags: tags || [],
      metadata: imageUrl ? { image_url: imageUrl } : null,
      is_published: false,
      moderation_status: "pending",
      likes_count: 0,
      comments_count: 0,
      views_count: 0,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating post:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
