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

    const { participantId } = await request.json()

    // Check if conversation already exists
    const { data: existing } = await supabase
      .from("chat_conversations")
      .select("id")
      .or(
        `and(participant1_id.eq.${user.id},participant2_id.eq.${participantId}),and(participant1_id.eq.${participantId},participant2_id.eq.${user.id})`,
      )
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ conversationId: existing.id })
    }

    // Create new conversation
    const { data, error } = await supabase
      .from("chat_conversations")
      .insert({
        participant1_id: user.id,
        participant2_id: participantId,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ conversationId: data.id })
  } catch (error) {
    console.error("Error starting chat:", error)
    return NextResponse.json({ error: "Failed to start chat" }, { status: 500 })
  }
}
