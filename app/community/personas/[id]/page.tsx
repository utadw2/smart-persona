import { redirect, notFound } from 'next/navigation'
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Briefcase, GraduationCap, Code, ExternalLink, MapPin, DollarSign } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { FollowButton } from "@/components/community/follow-button"
import { SkillEndorsements } from "@/components/endorsements/skill-endorsements"
import { ExportPersonaButton } from "@/components/personas/export-persona-button"
import Link from "next/link"
import type { SkillWithEndorsements } from "@/lib/types"

export default async function PersonaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const { id } = await params
  const { data: persona } = await supabase.from("personas").select("*").eq("id", id).maybeSingle()

  if (!persona) {
    notFound()
  }

  // Fetch the owner's profile
  const { data: ownerProfile } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, bio, location, website, twitter, linkedin, github")
    .eq("id", persona.user_id)
    .maybeSingle()

  // Attach profile to persona for compatibility
  const personaWithProfile = {
    ...persona,
    profiles: ownerProfile,
  }

  // Check if persona is public or belongs to current user
  if (persona.visibility !== "published" && persona.user_id !== user.id) {
    redirect("/community")
  }

  // Increment view count
  if (persona.user_id !== user.id) {
    await supabase
      .from("personas")
      .update({ views_count: (persona.views_count || 0) + 1 })
      .eq("id", id)
  }

  const { data: followData } = await supabase
    .from("follows")
    .select("id")
    .eq("follower_id", user.id)
    .eq("following_id", persona.user_id)
    .maybeSingle()

  const isFollowing = !!followData

  const { data: followerCount } = await supabase.rpc("get_follower_count", { user_id: persona.user_id })

  const { data: followingCount } = await supabase.rpc("get_following_count", { user_id: persona.user_id })

  const skills = persona.career?.specializations || []
  const skillsWithEndorsements: SkillWithEndorsements[] = await Promise.all(
    skills.map(async (skill: string) => {
      const { data: count } = await supabase.rpc("get_skill_endorsement_count", {
        p_persona_id: id,
        p_skill: skill,
      })

      const { data: userEndorsement } = await supabase
        .from("skill_endorsements")
        .select("id")
        .eq("persona_id", id)
        .eq("skill", skill)
        .eq("endorser_id", user.id)
        .maybeSingle()

      return {
        skill,
        endorsement_count: count || 0,
        is_endorsed_by_current_user: !!userEndorsement,
      }
    }),
  )

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader user={user} profile={profile} />
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-5xl space-y-6">
          {/* Profile Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={personaWithProfile.profiles?.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback className="text-2xl">
                    {personaWithProfile.profiles?.full_name?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-3xl">{persona.name}</CardTitle>
                  <CardDescription className="mt-2 text-base">
                    by {personaWithProfile.profiles?.full_name || "Anonymous"}
                  </CardDescription>
                  {personaWithProfile.profiles?.bio && (
                    <p className="mt-3 text-sm text-muted-foreground">{personaWithProfile.profiles.bio}</p>
                  )}
                  <div className="mt-4 flex items-center gap-4">
                    <div className="text-sm">
                      <span className="font-semibold">{followerCount || 0}</span> followers
                    </div>
                    <div className="text-sm">
                      <span className="font-semibold">{followingCount || 0}</span> following
                    </div>
                    <FollowButton userId={user.id} targetUserId={persona.user_id} isFollowing={isFollowing} />
                    <ExportPersonaButton
                      persona={persona}
                      profile={personaWithProfile.profiles}
                      variant="outline"
                      size="sm"
                    />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {personaWithProfile.profiles?.location && (
                      <Badge variant="outline">
                        <MapPin className="mr-1 h-3 w-3" />
                        {personaWithProfile.profiles.location}
                      </Badge>
                    )}
                    {personaWithProfile.profiles?.website && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={personaWithProfile.profiles.website} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="mr-1 h-3 w-3" />
                          Website
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Persona Details */}
          <Card>
            <CardHeader>
              <CardTitle>About This Persona</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{persona.description}</p>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <span className="text-sm font-medium">Tone:</span>
                  <Badge variant="secondary" className="ml-2 capitalize">
                    {persona.tone}
                  </Badge>
                </div>
                <div>
                  <span className="text-sm font-medium">Response Style:</span>
                  <Badge variant="secondary" className="ml-2 capitalize">
                    {persona.response_style}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Career Information */}
          {persona.career && (persona.career.title || persona.career.industry) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Career
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {persona.career.title && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Position</span>
                    <p className="text-lg font-semibold">{persona.career.title}</p>
                  </div>
                )}
                <div className="grid gap-4 md:grid-cols-2">
                  {persona.career.industry && (
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Industry</span>
                      <p>{persona.career.industry}</p>
                    </div>
                  )}
                  {persona.career.experience_years && (
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Experience</span>
                      <p>{persona.career.experience_years} years</p>
                    </div>
                  )}
                </div>
                {skillsWithEndorsements.length > 0 && (
                  <SkillEndorsements
                    personaId={id}
                    skills={skillsWithEndorsements}
                    canEndorse={persona.user_id !== user.id}
                  />
                )}
              </CardContent>
            </Card>
          )}

          {/* Education */}
          {persona.education && (persona.education.degree || persona.education.institution) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Education
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {persona.education.degree && <p className="text-lg font-semibold">{persona.education.degree}</p>}
                {persona.education.field && <p className="text-muted-foreground">{persona.education.field}</p>}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {persona.education.institution && <span>{persona.education.institution}</span>}
                  {persona.education.graduation_year && <span>• {persona.education.graduation_year}</span>}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Projects */}
          {persona.projects && persona.projects.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Projects
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {persona.projects.map((project: any, index: number) => (
                  <div key={index} className="border-b pb-4 last:border-0 last:pb-0">
                    <h4 className="font-semibold">{project.title}</h4>
                    <p className="mt-1 text-sm text-muted-foreground">{project.description}</p>
                    {project.technologies && project.technologies.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {project.technologies.map((tech: string, i: number) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {project.link && (
                      <Button variant="link" size="sm" asChild className="mt-2 h-auto p-0">
                        <a href={project.link} target="_blank" rel="noopener noreferrer">
                          View Project <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Job Preferences */}
          {persona.job_preferences && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Job Preferences
                  </CardTitle>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/dashboard/jobs?persona=${id}`}>View Matching Jobs</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {persona.job_preferences.remote !== undefined && (
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Remote Work</span>
                      <p>{persona.job_preferences.remote ? "Yes" : "No"}</p>
                    </div>
                  )}
                  {persona.job_preferences.job_types && persona.job_preferences.job_types.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Job Types</span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {persona.job_preferences.job_types.map((type: string, i: number) => (
                          <Badge key={i} variant="outline" className="capitalize">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {persona.job_preferences.location && persona.job_preferences.location.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Preferred Locations</span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {persona.job_preferences.location.map((loc: string, i: number) => (
                        <Badge key={i} variant="secondary">
                          {loc}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {persona.job_preferences.salary_range && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Salary Range</span>
                    <p>
                      ${persona.job_preferences.salary_range.min?.toLocaleString()} - $
                      {persona.job_preferences.salary_range.max?.toLocaleString()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
