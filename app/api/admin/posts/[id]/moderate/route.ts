import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (!profile || (profile.role !== "admin" && profile.role !== "super_admin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { action, reason } = await request.json()
    const { id: postId } = await params

    if (action === "approve") {
      // Approve the post
      const { error } = await supabase
        .from("community_posts")
        .update({
          moderation_status: "approved",
          is_published: true,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id,
        })
        .eq("id", postId)

      if (error) {
        console.error("Error approving post:", error)
        return NextResponse.json({ error: "Failed to approve post" }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    } else if (action === "reject") {
      if (!reason) {
        return NextResponse.json({ error: "Rejection reason required" }, { status: 400 })
      }

      // Reject the post
      const { error } = await supabase
        .from("community_posts")
        .update({
          moderation_status: "rejected",
          is_published: false,
          rejection_reason: reason,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id,
        })
        .eq("id", postId)

      if (error) {
        console.error("Error rejecting post:", error)
        return NextResponse.json({ error: "Failed to reject post" }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Error moderating post:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
