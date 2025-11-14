import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { generateObject } from "ai"
import { z } from "zod"

const fineTuneSchema = z.object({
  description: z.string().describe("An improved, more detailed description"),
  tone: z.enum(["professional", "friendly", "casual", "formal", "enthusiastic"]),
  response_style: z.enum(["concise", "detailed", "conversational", "technical"]),
  suggestions: z.array(z.string()).describe("3-5 suggestions for improving the persona"),
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { currentPersona } = await request.json()

    const { object } = await generateObject({
      model: "openai/gpt-4o-mini",
      schema: fineTuneSchema,
      prompt: `Analyze and improve this AI persona:

Name: ${currentPersona.name}
Description: ${currentPersona.description}
Current Tone: ${currentPersona.tone}
Current Style: ${currentPersona.response_style}
Job Title: ${currentPersona.career?.title || "Not specified"}

Provide:
1. An enhanced, more detailed description that better captures the persona's communication style
2. The most appropriate tone for this persona
3. The best response style for this persona
4. 3-5 specific suggestions for improving this persona's effectiveness

Focus on making the persona more authentic, professional, and effective for business communication.`,
    })

    return NextResponse.json(object)
  } catch (error) {
    console.error("[v0] Fine-tune error:", error)
    return NextResponse.json({ error: "Failed to fine-tune persona" }, { status: 500 })
  }
}
