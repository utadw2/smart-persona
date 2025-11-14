import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { generateResume } from "@/lib/ai/generate-resume"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { personaId, targetJob, style } = body

    const { data: persona, error: personaError } = await supabase
      .from("personas")
      .select("*")
      .eq("id", personaId)
      .eq("user_id", user.id)
      .single()

    if (personaError || !persona) {
      return NextResponse.json({ error: "Persona not found" }, { status: 404 })
    }

    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

    const resume = await generateResume({
      persona,
      userProfile: profile || undefined,
      targetJob,
      style: style || "professional",
    })

    return NextResponse.json({ resume })
  } catch (error) {
    console.error("[v0] Resume generation API error:", error)
    return NextResponse.json({ error: "Failed to generate resume" }, { status: 500 })
  }
}
