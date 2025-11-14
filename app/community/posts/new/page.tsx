import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { CreatePostForm } from "@/components/community/create-post-form"

export default async function NewPostPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Fetch user's personas for linking
  const { data: personas } = await supabase.from("personas").select("id, name").eq("user_id", user.id).order("name")

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader user={user} profile={profile} />
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-3xl space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Create Post</h1>
            <p className="text-muted-foreground">Share your thoughts with the community</p>
          </div>

          <CreatePostForm personas={personas || []} userId={user.id} />
        </div>
      </main>
    </div>
  )
}
