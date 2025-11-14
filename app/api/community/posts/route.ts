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

  const { userId, title, content, postType, personaId, tags } = await request.json()

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
      is_published: true,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating post:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
