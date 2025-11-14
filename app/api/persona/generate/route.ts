import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { generateObject } from "ai"
import { z } from "zod"

const personaSchema = z.object({
  name: z.string().describe("A professional persona name based on the job title"),
  description: z.string().describe("A detailed description of the persona's personality and communication style"),
  tone: z.enum(["professional", "friendly", "casual", "formal", "enthusiastic"]),
  response_style: z.enum(["concise", "detailed", "conversational", "technical"]),
  specializations: z.array(z.string()).describe("Key skills and specializations for this role"),
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

    const { jobTitle, industry, experienceYears } = await request.json()

    const { object } = await generateObject({
      model: "openai/gpt-4o-mini",
      schema: personaSchema,
      prompt: `Generate a professional AI persona for someone with the following profile:
      
Job Title: ${jobTitle}
Industry: ${industry || "General"}
Experience: ${experienceYears || 0} years

Create a persona that:
1. Has a professional name that reflects the role
2. Has a detailed description of communication style and personality
3. Suggests an appropriate tone and response style
4. Lists 5-7 key skills and specializations relevant to this role

Make it professional, authentic, and suitable for business communication.`,
    })

    return NextResponse.json(object)
  } catch (error) {
    console.error("[v0] Persona generation error:", error)
    return NextResponse.json({ error: "Failed to generate persona" }, { status: 500 })
  }
}
