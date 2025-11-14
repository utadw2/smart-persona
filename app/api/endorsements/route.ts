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

    const { persona_id, skill } = await request.json()

    if (!persona_id || !skill) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if already endorsed
    const { data: existing } = await supabase
      .from("skill_endorsements")
      .select("id")
      .eq("persona_id", persona_id)
      .eq("skill", skill)
      .eq("endorser_id", user.id)
      .single()

    if (existing) {
      return NextResponse.json({ error: "Already endorsed this skill" }, { status: 400 })
    }

    // Create endorsement
    const { error } = await supabase.from("skill_endorsements").insert({ persona_id, skill, endorser_id: user.id })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Endorsement error:", error)
    return NextResponse.json({ error: "Failed to endorse skill" }, { status: 500 })
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

    const { persona_id, skill } = await request.json()

    if (!persona_id || !skill) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { error } = await supabase
      .from("skill_endorsements")
      .delete()
      .eq("persona_id", persona_id)
      .eq("skill", skill)
      .eq("endorser_id", user.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Remove endorsement error:", error)
    return NextResponse.json({ error: "Failed to remove endorsement" }, { status: 500 })
  }
}
