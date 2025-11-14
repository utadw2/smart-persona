import { createClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/lib/auth/admin"
import { AdminHeader } from "@/components/admin/admin-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Eye, Briefcase, GraduationCap, User } from "lucide-react"
import Link from "next/link"

export default async function AdminPersonasPage() {
  const { user, profile } = await requireAdmin()
  const supabase = await createClient()

  // Fetch all personas with user profiles
  const { data: personas } = await supabase
    .from("personas")
    .select(`
      *,
      profiles:user_id (
        id,
        full_name,
        email,
        avatar_url
      )
    `)
    .order("created_at", { ascending: false })

  const totalPersonas = personas?.length || 0
  const publicPersonas = personas?.filter((p) => p.is_public).length || 0
  const privatePersonas = totalPersonas - publicPersonas

  return (
    <div className="flex min-h-screen flex-col">
      <AdminHeader user={user} profile={profile} />
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Persona Management</h1>
            <p className="text-muted-foreground">View and manage all user personas</p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Personas</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalPersonas}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Public</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{publicPersonas}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Private</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{privatePersonas}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {personas && personas.length > 0 ? (
              personas.map((persona) => (
                <Card key={persona.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={persona.profiles?.avatar_url || "/placeholder.svg"} />
                        <AvatarFallback>{persona.profiles?.full_name?.[0] || "U"}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{persona.name}</CardTitle>
                        <CardDescription className="text-sm">
                          {persona.profiles?.full_name}
                          <br />
                          <span className="text-xs">{persona.profiles?.email}</span>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">{persona.description}</p>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant={persona.is_public ? "default" : "secondary"}>
                        {persona.is_public ? "Public" : "Private"}
                      </Badge>
                      <Badge variant={persona.visibility === "published" ? "default" : "outline"}>
                        {persona.visibility}
                      </Badge>
                    </div>

                    {persona.career?.title && (
                      <div className="flex items-center gap-2 text-sm">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <span className="line-clamp-1">{persona.career.title}</span>
                      </div>
                    )}

                    {persona.education?.degree && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <GraduationCap className="h-4 w-4" />
                        <span className="line-clamp-1">{persona.education.degree}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Eye className="h-4 w-4" />
                        <span>{persona.views_count || 0} views</span>
                      </div>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/community/personas/${persona.id}`}>View</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="col-span-full">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <User className="mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 text-lg font-semibold">No personas found</h3>
                  <p className="text-center text-sm text-muted-foreground">Users haven't created any personas yet</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
