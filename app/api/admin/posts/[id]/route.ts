import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/lib/auth/admin"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin()
    const supabase = await createClient()

    const { error } = await supabase.from("community_posts").delete().eq("id", params.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting post:", error)
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 })
  }
}
