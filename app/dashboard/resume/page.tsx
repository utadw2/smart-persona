import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ResumeGenerator } from "@/components/resume/resume-generator"

export default async function ResumePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: personas } = await supabase
    .from("personas")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} profile={profile} />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">AI Resume Generator</h1>
          <p className="text-muted-foreground mt-2">Generate professional resumes from your personas using AI</p>
        </div>

        <ResumeGenerator personas={personas || []} profile={profile} />
      </main>
    </div>
  )
}
