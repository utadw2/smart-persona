import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { following_id } = await request.json()

    if (!following_id) {
      return NextResponse.json({ error: "Missing following_id" }, { status: 400 })
    }

    const { data: existing } = await supabase
      .from("follows")
      .select("id")
      .eq("follower_id", user.id)
      .eq("following_id", following_id)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: "Already following" }, { status: 400 })
    }

    // Create follow
    const { error } = await supabase.from("follows").insert({ follower_id: user.id, following_id })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Follow error:", error)
    return NextResponse.json({ error: "Failed to follow user" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { following_id } = await request.json()

    if (!following_id) {
      return NextResponse.json({ error: "Missing following_id" }, { status: 400 })
    }

    const { error } = await supabase
      .from("follows")
      .delete()
      .eq("follower_id", user.id)
      .eq("following_id", following_id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Unfollow error:", error)
    return NextResponse.json({ error: "Failed to unfollow user" }, { status: 500 })
  }
}
