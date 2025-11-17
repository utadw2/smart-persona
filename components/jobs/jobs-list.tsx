"use client"

import { useState, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SearchInput } from "@/components/ui/search-input"
import { MapPin, DollarSign, Briefcase, ExternalLink, Heart, Check } from "lucide-react"
import type { Job, Persona, JobMatch } from "@/lib/types"

interface JobsListProps {
  jobs: Job[]
  personas: Persona[]
  jobMatches: JobMatch[]
  userId: string
}

export function JobsList({ jobs, personas, jobMatches, userId }: JobsListProps) {
  const supabase = createClient()
  const [selectedPersona, setSelectedPersona] = useState<string>("all")
  const [filter, setFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [savingJobId, setSavingJobId] = useState<string | null>(null)

  // 27-65 feature cal Match job 

  const calculateMatchScore = (job: Job, persona: Persona): number => {
    let score = 0
    const maxScore = 100

    // Match skills คำนวนการเข้ากันของสกิล หรือ jobMatches
    if (persona.career?.specializations && job.skills) {
      const matchingSkills = persona.career.specializations.filter((skill) =>
        job.skills.some((jobSkill) => jobSkill.toLowerCase().includes(skill.toLowerCase())),
      )
      score += (matchingSkills.length / Math.max(job.skills.length, 1)) * 40
    }

    // Match industry
    if (persona.career?.industry && job.industry) {
      if (persona.career.industry.toLowerCase() === job.industry.toLowerCase()) {
        score += 20
      }
    }

    // Match experience
    if (persona.career?.experience_years && job.experience_required) {
      if (persona.career.experience_years >= job.experience_required) {
        score += 15
      }
    }

    // Match remote preference
    if (persona.job_preferences?.remote && job.remote) {
      score += 10
    }

    // Match location
    if (persona.job_preferences?.location && job.location) {
      const matchesLocation = persona.job_preferences.location.some((loc) =>
        job.location?.toLowerCase().includes(loc.toLowerCase()),
      )
      if (matchesLocation) score += 10
    }

    // Match salary
    if (persona.job_preferences?.salary_range && job.salary_min && job.salary_max) {
      const personaMin = persona.job_preferences.salary_range.min
      const personaMax = persona.job_preferences.salary_range.max
      if (job.salary_min >= personaMin && job.salary_max <= personaMax) {
        score += 5
      }
    }

    return Math.min(Math.round(score), maxScore)
  }

  const getJobsWithScores = () => {
    if (selectedPersona === "all") {
      return jobs.map((job) => ({
        ...job,
        match_score: personas.length > 0 ? Math.max(...personas.map((p) => calculateMatchScore(job, p))) : 0,
      }))
    }

    const persona = personas.find((p) => p.id === selectedPersona)
    if (!persona) return jobs.map((job) => ({ ...job, match_score: 0 }))

    return jobs.map((job) => ({
      ...job,
      match_score: calculateMatchScore(job, persona),
    }))
  }

  const filteredJobs = useMemo(() => {
    let filtered = getJobsWithScores()

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.industry?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.skills?.some((skill) => skill.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    }

    // Apply status filter
    if (filter === "saved") {
      filtered = filtered.filter((job) => jobMatches.some((m) => m.job_id === job.id && m.status === "saved"))
    } else if (filter === "applied") {
      filtered = filtered.filter((job) => jobMatches.some((m) => m.job_id === job.id && m.status === "applied"))
    } else if (filter === "high-match") {
      filtered = filtered.filter((job) => job.match_score >= 60)
    }

    // Sort by match score
    return filtered.sort((a, b) => b.match_score - a.match_score)
  }, [jobs, selectedPersona, searchQuery, filter, personas, jobMatches])

  const handleSaveJob = async (jobId: string) => {
    setSavingJobId(jobId)
    try {
      const existingMatch = jobMatches.find((m) => m.job_id === jobId)

      if (existingMatch) {
        await supabase.from("job_matches").update({ status: "saved" }).eq("id", existingMatch.id)
      } else {
        await supabase.from("job_matches").insert({
          user_id: userId,
          job_id: jobId,
          persona_id: selectedPersona !== "all" ? selectedPersona : personas[0]?.id,
          status: "saved",
          match_score: filteredJobs.find((j) => j.id === jobId)?.match_score || 0,
        })
      }
      window.location.reload()
    } catch (error) {
      console.error("Error saving job:", error)
    } finally {
      setSavingJobId(null)
    }
  }

  const isJobSaved = (jobId: string) => {
    return jobMatches.some((m) => m.job_id === jobId && m.status === "saved")
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search jobs by title, company, skills, or industry..."
          className="w-full"
        />

        <div className="flex flex-wrap gap-4">
          <Select value={selectedPersona} onValueChange={setSelectedPersona}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select persona" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Personas</SelectItem>
              {personas.map((persona) => (
                <SelectItem key={persona.id} value={persona.id}>
                  {persona.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter jobs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Jobs</SelectItem>
              <SelectItem value="high-match">High Match (60%+)</SelectItem>
              <SelectItem value="saved">Saved Jobs</SelectItem>
              <SelectItem value="applied">Applied</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Showing {filteredJobs.length} of {jobs.length} jobs
      </p>

      {filteredJobs.length > 0 ? (
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <Card key={job.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle>{job.title}</CardTitle>
                      {job.match_score > 0 && (
                        <Badge
                          variant={job.match_score >= 70 ? "default" : job.match_score >= 50 ? "secondary" : "outline"}
                        >
                          {job.match_score}% Match
                        </Badge>
                      )}
                      {job.remote && <Badge variant="outline">Remote</Badge>}
                    </div>
                    <CardDescription className="mt-2">
                      {job.company} • {job.industry}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleSaveJob(job.id)}
                    disabled={savingJobId === job.id}
                  >
                    {isJobSaved(job.id) ? <Check className="h-5 w-5 text-primary" /> : <Heart className="h-5 w-5" />}
                  </Button>
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

                {job.application_url && (
                  <Button asChild variant="outline" className="w-full bg-transparent">
                    <a href={job.application_url} target="_blank" rel="noopener noreferrer">
                      Apply Now
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Briefcase className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">No jobs found</h3>
            <p className="text-center text-sm text-muted-foreground">
              {searchQuery
                ? "Try adjusting your search query or filters"
                : "Try adjusting your filters or create a persona with career information"}
            </p>
            {searchQuery && (
              <Button variant="outline" className="mt-4 bg-transparent" onClick={() => setSearchQuery("")}>
                Clear Search
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
