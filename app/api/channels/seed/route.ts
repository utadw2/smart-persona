import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Seed channels
    const channels = [
      { name: "Twitter", type: "twitter", icon: "twitter", is_enabled: true },
      { name: "Facebook", type: "facebook", icon: "facebook", is_enabled: true },
      { name: "Instagram", type: "instagram", icon: "instagram", is_enabled: true },
      { name: "LinkedIn", type: "linkedin", icon: "linkedin", is_enabled: true },
      { name: "WhatsApp", type: "whatsapp", icon: "message-circle", is_enabled: true },
      { name: "Telegram", type: "telegram", icon: "send", is_enabled: true },
    ]

    const { error } = await supabase.from("channels").upsert(channels, {
      onConflict: "name",
      ignoreDuplicates: true,
    })

    if (error) throw error

    return NextResponse.json({ success: true, message: "Channels seeded successfully" })
  } catch (error) {
    console.error("[v0] Seed error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
