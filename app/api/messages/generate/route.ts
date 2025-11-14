import { createClient } from "@/lib/supabase/server"
import { generateAIResponse } from "@/lib/ai/generate-response"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { message, personaId, channelId } = body

    if (!message || !personaId) {
      return NextResponse.json({ error: "Message and personaId are required" }, { status: 400 })
    }

    // Fetch persona
    const { data: persona, error: personaError } = await supabase
      .from("personas")
      .select("*")
      .eq("id", personaId)
      .eq("user_id", user.id)
      .single()

    if (personaError || !persona) {
      return NextResponse.json({ error: "Persona not found" }, { status: 404 })
    }

    // Fetch AI settings (user-specific or global)
    let { data: aiSettings } = await supabase.from("ai_settings").select("*").eq("user_id", user.id).single()

    if (!aiSettings) {
      const { data: globalSettings } = await supabase.from("ai_settings").select("*").eq("is_global", true).single()
      aiSettings = globalSettings
    }

    if (!aiSettings) {
      return NextResponse.json({ error: "AI settings not configured" }, { status: 500 })
    }

    // Generate AI response
    const aiResponse = await generateAIResponse({
      message,
      persona,
      aiSettings,
    })

    // Save the generated message
    const { data: savedMessage, error: saveError } = await supabase
      .from("messages")
      .insert([
        {
          user_id: user.id,
          persona_id: personaId,
          channel_id: channelId,
          content: aiResponse,
          direction: "outbound",
          ai_generated: true,
          status: "pending",
          sender: persona.name,
          recipient: "User",
        },
      ])
      .select()
      .single()

    if (saveError) {
      console.error("[v0] Error saving message:", saveError)
      return NextResponse.json({ error: "Failed to save message" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: savedMessage,
      response: aiResponse,
    })
  } catch (error) {
    console.error("[v0] API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
