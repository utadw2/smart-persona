import { createClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/lib/auth/admin"
import { AdminHeader } from "@/components/admin/admin-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Plus, Edit, Trash2, MapPin, DollarSign, Briefcase } from "lucide-react"

export default async function AdminJobsPage() {
  const { user, profile } = await requireAdmin()
  const supabase = await createClient()

  const { data: jobs } = await supabase.from("jobs").select("*").order("created_at", { ascending: false })

  const activeJobs = jobs?.filter((j) => j.is_active).length || 0
  const totalApplications = 0 // TODO: Count from job_matches

  return (
    <div className="flex min-h-screen flex-col">
      <AdminHeader user={user} profile={profile} />
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Job Management</h1>
              <p className="text-muted-foreground">Manage job postings and applications</p>
            </div>
            <Button asChild>
              <Link href="/admin/jobs/new">
                <Plus className="mr-2 h-4 w-4" />
                Post New Job
              </Link>
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{jobs?.length || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeJobs}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Applications</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalApplications}</div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            {jobs && jobs.length > 0 ? (
              jobs.map((job) => (
                <Card key={job.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <CardTitle>{job.title}</CardTitle>
                          <Badge variant={job.is_active ? "default" : "secondary"}>
                            {job.is_active ? "Active" : "Inactive"}
                          </Badge>
                          {job.remote && <Badge variant="outline">Remote</Badge>}
                        </div>
                        <CardDescription className="mt-2">
                          {job.company} • {job.industry}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/admin/jobs/${job.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4 text-sm text-muted-foreground line-clamp-2">{job.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm">
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
                        <Badge variant="outline" className="capitalize">
                          {job.job_type}
                        </Badge>
                      )}
                    </div>
                    {job.skills && job.skills.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {job.skills.slice(0, 5).map((skill, i) => (
                          <Badge key={i} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                        {job.skills.length > 5 && <Badge variant="secondary">+{job.skills.length - 5} more</Badge>}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Briefcase className="mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 text-lg font-semibold">No jobs posted yet</h3>
                  <p className="mb-6 text-center text-sm text-muted-foreground">
                    Start by posting your first job listing
                  </p>
                  <Button asChild>
                    <Link href="/admin/jobs/new">
                      <Plus className="mr-2 h-4 w-4" />
                      Post First Job
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
