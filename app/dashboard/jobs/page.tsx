import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { JobsList } from "@/components/jobs/jobs-list"
import { AdSpace } from "@/components/ads/ad-space"

export default async function JobsPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const { data: personas } = await supabase.from("personas").select("*").eq("user_id", user.id).eq("is_active", true)

  const { data: jobs } = await supabase
    .from("jobs")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  const { data: jobMatches } = await supabase.from("job_matches").select("*, jobs(*)").eq("user_id", user.id)

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader user={user} profile={profile} />
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Find Jobs</h1>
            <p className="text-muted-foreground">Discover opportunities matching your personas</p>
          </div>

          <AdSpace placement="banner" />

          <JobsList jobs={jobs || []} personas={personas || []} jobMatches={jobMatches || []} userId={user.id} />
        </div>
      </main>
    </div>
  )
}
