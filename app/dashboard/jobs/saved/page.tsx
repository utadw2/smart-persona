import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, DollarSign, Briefcase, ExternalLink, Bookmark } from "lucide-react"
import Link from "next/link"

export default async function SavedJobsPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Fetch saved jobs
  const { data: savedJobs } = await supabase
    .from("job_matches")
    .select(`
      *,
      jobs (*),
      personas (*)
    `)
    .eq("user_id", user.id)
    .eq("status", "saved")
    .order("created_at", { ascending: false })

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader user={user} profile={profile} />
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Saved Jobs</h1>
            <p className="text-muted-foreground">Your bookmarked job opportunities</p>
          </div>

          {savedJobs && savedJobs.length > 0 ? (
            <div className="space-y-4">
              {savedJobs.map((match) => {
                const job = match.jobs
                if (!job) return null

                return (
                  <Card key={match.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <CardTitle>{job.title}</CardTitle>
                            {match.match_score && match.match_score > 0 && (
                              <Badge
                                variant={
                                  match.match_score >= 70
                                    ? "default"
                                    : match.match_score >= 50
                                      ? "secondary"
                                      : "outline"
                                }
                              >
                                {match.match_score}% Match
                              </Badge>
                            )}
                            {job.remote && <Badge variant="outline">Remote</Badge>}
                            <Badge variant="secondary">
                              <Bookmark className="mr-1 h-3 w-3" />
                              Saved
                            </Badge>
                          </div>
                          <CardDescription className="mt-2">
                            {job.company} • {job.industry}
                          </CardDescription>
                          {match.personas && (
                            <p className="mt-1 text-sm text-muted-foreground">Matched with: {match.personas.name}</p>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-4 text-sm text-muted-foreground">{job.description}</p>

                      <div className="flex flex-wrap gap-4 text-sm mb-4">
                        {job.location && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            {job.location}
                          </div>
                        )}
                        {job.salary_min && job.salary_max && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <DollarSign className="h-4 w-4" />${job.salary_min.toLocaleString()} - $
                            {job.salary_max.toLocaleString()}
                          </div>
                        )}
                        {job.job_type && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Briefcase className="h-4 w-4" />
                            <span className="capitalize">{job.job_type}</span>
                          </div>
                        )}
                      </div>

                      {job.skills && job.skills.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {job.skills.map((skill, i) => (
                            <Badge key={i} variant="secondary">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {match.notes && (
                        <div className="mb-4 p-3 bg-muted rounded-md">
                          <p className="text-sm">
                            <strong>Your notes:</strong> {match.notes}
                          </p>
                        </div>
                      )}

                      <div className="flex gap-2">
                        {job.application_url && (
                          <Button asChild variant="default" className="flex-1">
                            <a href={job.application_url} target="_blank" rel="noopener noreferrer">
                              Apply Now
                              <ExternalLink className="ml-2 h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        <Button asChild variant="outline">
                          <Link href="/dashboard/jobs">Back to Jobs</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Bookmark className="mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-semibold">No saved jobs yet</h3>
                <p className="text-center text-sm text-muted-foreground mb-4">
                  Start exploring jobs and save the ones you're interested in
                </p>
                <Button asChild>
                  <Link href="/dashboard/jobs">Browse Jobs</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
