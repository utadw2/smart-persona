import { requireAdmin } from "@/lib/auth/admin"
import { AdminHeader } from "@/components/admin/admin-header"
import { JobForm } from "@/components/admin/job-form"

export default async function NewJobPage() {
  const { user, profile } = await requireAdmin()

  return (
    <div className="flex min-h-screen flex-col">
      <AdminHeader user={user} profile={profile} />
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Post New Job</h1>
            <p className="text-muted-foreground">Create a new job listing</p>
          </div>
          <JobForm />
        </div>
      </main>
    </div>
  )
}
