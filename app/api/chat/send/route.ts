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

    const { receiverId, message, conversationId } = await request.json()

    if (!message?.trim() || !receiverId) {
      return NextResponse.json({ error: "Message and receiver required" }, { status: 400 })
    }

    // Insert the message
    const { data: messageData, error: messageError } = await supabase
      .from("chat_messages")
      .insert({
        sender_id: user.id,
        receiver_id: receiverId,
        message: message.trim(),
      })
      .select()
      .single()

    if (messageError) throw messageError

    // Update conversation last message time
    if (conversationId) {
      await supabase
        .from("chat_conversations")
        .update({ last_message_at: new Date().toISOString() })
        .eq("id", conversationId)
    }

    return NextResponse.json({ message: messageData })
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}
