import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { postId, content, parentId } = await request.json()

    const { data, error } = await supabase
      .from("post_comments")
      .insert({
        post_id: postId,
        user_id: user.id,
        content,
        parent_id: parentId || null,
      })
      .select()

    if (error) throw error

    // The increment_post_comments() trigger handles this automatically

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error posting comment:", error)
    return NextResponse.json({ error: "Failed to post comment" }, { status: 500 })
  }
}
