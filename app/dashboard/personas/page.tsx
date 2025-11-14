import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/ui/empty-state"
import Link from "next/link"
import { Plus, Edit, Trash2, UserCircle } from "lucide-react"
import { ExportPersonaButton } from "@/components/personas/export-persona-button"

export default async function PersonasPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const { data: personas } = await supabase
    .from("personas")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader user={user} profile={profile} />
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Personas</h1>
              <p className="text-muted-foreground">Manage your AI personalities</p>
            </div>
            <Button asChild>
              <Link href="/dashboard/personas/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Persona
              </Link>
            </Button>
          </div>

          {personas && personas.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {personas.map((persona) => (
                <Card key={persona.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          {persona.name}
                          {persona.visibility === "published" && (
                            <Badge variant="secondary" className="text-xs">
                              Published
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="mt-2 line-clamp-2">{persona.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Tone:</span>
                        <span className="font-medium">{persona.tone}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Style:</span>
                        <span className="font-medium">{persona.response_style}</span>
                      </div>
                      <div className="mt-4 space-y-2">
                        <ExportPersonaButton persona={persona} profile={profile} variant="outline" size="sm" />
                        <div className="flex gap-2">
                          <Button asChild variant="outline" size="sm" className="flex-1 bg-transparent">
                            <Link href={`/dashboard/personas/${persona.id}/edit`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={UserCircle}
              title="No personas yet"
              description="Create your first AI personality to start managing your professional presence and automating interactions across platforms."
              action={{
                label: "Create Your First Persona",
                href: "/dashboard/personas/new",
              }}
              secondaryAction={{
                label: "Learn More",
                href: "/community",
              }}
            />
          )}
        </div>
      </main>
    </div>
  )
}
