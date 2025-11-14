import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MapPin, Globe, Twitter, Linkedin, Github, Users, Briefcase } from "lucide-react"
import { FollowButton } from "@/components/community/follow-button"
import Link from "next/link"

export default async function UserProfilePage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: currentUserProfile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()

  // Fetch the viewed user's profile
  const { data: viewedProfile } = await supabase.from("profiles").select("*").eq("id", params.id).maybeSingle()

  if (!viewedProfile) {
    notFound()
  }

  // Fetch user's personas
  const { data: personas } = await supabase
    .from("personas")
    .select("*")
    .eq("user_id", params.id)
    .eq("visibility", "published")
    .order("created_at", { ascending: false })

  // Fetch user's posts
  const { data: posts } = await supabase
    .from("community_posts")
    .select("*")
    .eq("user_id", params.id)
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(5)

  // Check follow status
  const { data: followData } = await supabase
    .from("follows")
    .select("id")
    .eq("follower_id", user.id)
    .eq("following_id", params.id)
    .maybeSingle()

  const isFollowing = !!followData

  // Get follower/following counts
  const { data: followerCount } = await supabase.rpc("get_follower_count", { user_id: params.id })
  const { data: followingCount } = await supabase.rpc("get_following_count", { user_id: params.id })

  const getInitials = (name: string) => {
    return name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const isOwnProfile = user.id === params.id

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader user={user} profile={currentUserProfile} />
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-5xl space-y-6">
          {/* Profile Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col gap-6 md:flex-row md:items-start">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={viewedProfile.avatar_url || "/placeholder.svg"} alt={viewedProfile.full_name} />
                  <AvatarFallback className="text-2xl">{getInitials(viewedProfile.full_name || "U")}</AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="text-2xl font-bold">{viewedProfile.full_name || "User"}</h1>
                      {viewedProfile.role && (
                        <Badge variant={viewedProfile.role === "admin" ? "default" : "secondary"} className="mt-2">
                          {viewedProfile.role}
                        </Badge>
                      )}
                    </div>
                    {!isOwnProfile && (
                      <FollowButton userId={user.id} targetUserId={params.id} isFollowing={isFollowing} />
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <div>
                      <span className="font-semibold">{followerCount || 0}</span> followers
                    </div>
                    <div>
                      <span className="font-semibold">{followingCount || 0}</span> following
                    </div>
                    <div>
                      <span className="font-semibold">{personas?.length || 0}</span> personas
                    </div>
                  </div>

                  {viewedProfile.bio && <p className="text-sm leading-relaxed">{viewedProfile.bio}</p>}

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    {viewedProfile.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {viewedProfile.location}
                      </div>
                    )}
                    {viewedProfile.website && (
                      <a
                        href={viewedProfile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-foreground"
                      >
                        <Globe className="h-4 w-4" />
                        Website
                      </a>
                    )}
                    {viewedProfile.twitter && (
                      <a
                        href={`https://twitter.com/${viewedProfile.twitter}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-foreground"
                      >
                        <Twitter className="h-4 w-4" />
                        Twitter
                      </a>
                    )}
                    {viewedProfile.linkedin && (
                      <a
                        href={`https://linkedin.com/in/${viewedProfile.linkedin}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-foreground"
                      >
                        <Linkedin className="h-4 w-4" />
                        LinkedIn
                      </a>
                    )}
                    {viewedProfile.github && (
                      <a
                        href={`https://github.com/${viewedProfile.github}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-foreground"
                      >
                        <Github className="h-4 w-4" />
                        GitHub
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personas Section */}
          {personas && personas.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Personas ({personas.length})
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {personas.map((persona) => (
                    <Link key={persona.id} href={`/community/personas/${persona.id}`}>
                      <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                        <CardHeader>
                          <CardTitle className="text-lg">{persona.name}</CardTitle>
                          <CardDescription className="line-clamp-2">{persona.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div>{persona.views_count || 0} views</div>
                            <Badge variant="secondary" className="capitalize">
                              {persona.tone}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Posts */}
          {posts && posts.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Recent Posts ({posts.length})
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {posts.map((post) => (
                    <Link key={post.id} href={`/community/posts/${post.id}`}>
                      <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-base">{post.title}</CardTitle>
                              <CardDescription className="mt-1 line-clamp-2">{post.content}</CardDescription>
                            </div>
                            <Badge variant="outline" className="capitalize">
                              {post.post_type}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div>{post.likes_count} likes</div>
                            <div>{post.comments_count} comments</div>
                            <div>{post.views_count} views</div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
