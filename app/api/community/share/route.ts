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

    const { postId } = await request.json()

    const { data, error } = await supabase.from("post_shares").insert({
      post_id: postId,
      user_id: user.id,
    })

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error sharing post:", error)
    return NextResponse.json({ error: "Failed to share post" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { postId } = await request.json()

    const { error } = await supabase.from("post_shares").delete().eq("post_id", postId).eq("user_id", user.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error unsharing post:", error)
    return NextResponse.json({ error: "Failed to unshare post" }, { status: 500 })
  }
}
