"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Plus, X } from "lucide-react"

interface PersonaFormProps {
  userId: string
  persona?: any
}

export function PersonaForm({ userId, persona }: PersonaFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: persona?.name || "",
    description: persona?.description || "",
    tone: persona?.tone || "professional",
    response_style: persona?.response_style || "concise",
    visibility: persona?.visibility || "private",
    career: {
      title: persona?.career?.title || "",
      experience_years: persona?.career?.experience_years || 0,
      industry: persona?.career?.industry || "",
      specializations: persona?.career?.specializations || [],
    },
    education: {
      degree: persona?.education?.degree || "",
      field: persona?.education?.field || "",
      institution: persona?.education?.institution || "",
      graduation_year: persona?.education?.graduation_year || new Date().getFullYear(),
    },
    projects: persona?.projects || [],
    job_preferences: {
      remote: persona?.job_preferences?.remote ?? false,
      location: persona?.job_preferences?.location || [],
      job_types: persona?.job_preferences?.job_types || [],
      salary_range: {
        min: persona?.job_preferences?.salary_range?.min || 0,
        max: persona?.job_preferences?.salary_range?.max || 0,
      },
    },
  })

  const [newSpecialization, setNewSpecialization] = useState("")
  const [newLocation, setNewLocation] = useState("")
  const [newProject, setNewProject] = useState({ title: "", description: "", technologies: "", link: "" })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (persona) {
        const { error } = await supabase.from("personas").update(formData).eq("id", persona.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from("personas").insert([{ ...formData, user_id: userId }])
        if (error) throw error
      }
      router.push("/dashboard/personas")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAIGenerate = async () => {
    if (!formData.career.title) {
      setError("Please enter a job title first to generate persona details")
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch("/api/persona/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle: formData.career.title,
          industry: formData.career.industry,
          experienceYears: formData.career.experience_years,
        }),
      })

      if (!response.ok) throw new Error("Failed to generate persona")

      const data = await response.json()

      setFormData({
        ...formData,
        name: data.name || formData.name,
        description: data.description || formData.description,
        tone: data.tone || formData.tone,
        response_style: data.response_style || formData.response_style,
        career: {
          ...formData.career,
          specializations: data.specializations || formData.career.specializations,
        },
      })
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to generate persona")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleFineTune = async () => {
    if (!formData.description) {
      setError("Please add a description first")
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch("/api/persona/fine-tune", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPersona: formData,
        }),
      })

      if (!response.ok) throw new Error("Failed to fine-tune persona")

      const data = await response.json()

      setFormData({
        ...formData,
        description: data.description || formData.description,
        tone: data.tone || formData.tone,
        response_style: data.response_style || formData.response_style,
      })
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to fine-tune persona")
    } finally {
      setIsGenerating(false)
    }
  }

  const addSpecialization = () => {
    if (newSpecialization.trim()) {
      setFormData({
        ...formData,
        career: {
          ...formData.career,
          specializations: [...formData.career.specializations, newSpecialization.trim()],
        },
      })
      setNewSpecialization("")
    }
  }

  const removeSpecialization = (index: number) => {
    setFormData({
      ...formData,
      career: {
        ...formData.career,
        specializations: formData.career.specializations.filter((_, i) => i !== index),
      },
    })
  }

  const addLocation = () => {
    if (newLocation.trim()) {
      setFormData({
        ...formData,
        job_preferences: {
          ...formData.job_preferences,
          location: [...formData.job_preferences.location, newLocation.trim()],
        },
      })
      setNewLocation("")
    }
  }

  const removeLocation = (index: number) => {
    setFormData({
      ...formData,
      job_preferences: {
        ...formData.job_preferences,
        location: formData.job_preferences.location.filter((_, i) => i !== index),
      },
    })
  }

  const addProject = () => {
    if (newProject.title.trim() && newProject.description.trim()) {
      setFormData({
        ...formData,
        projects: [
          ...formData.projects,
          {
            ...newProject,
            technologies: newProject.technologies.split(",").map((t) => t.trim()),
          },
        ],
      })
      setNewProject({ title: "", description: "", technologies: "", link: "" })
    }
  }

  const removeProject = (index: number) => {
    setFormData({
      ...formData,
      projects: formData.projects.filter((_, i) => i !== index),
    })
  }

  const toggleJobType = (type: string) => {
    const types = formData.job_preferences.job_types
    if (types.includes(type)) {
      setFormData({
        ...formData,
        job_preferences: {
          ...formData.job_preferences,
          job_types: types.filter((t) => t !== type),
        },
      })
    } else {
      setFormData({
        ...formData,
        job_preferences: {
          ...formData.job_preferences,
          job_types: [...types, type],
        },
      })
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAIGenerate}
                  disabled={isGenerating || !formData.career.title}
                >
                  {isGenerating ? "Generating..." : "🤖 AI Generate"}
                </Button>
                {persona && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleFineTune}
                    disabled={isGenerating || !formData.description}
                  >
                    {isGenerating ? "Fine-tuning..." : "✨ Fine Tune"}
                  </Button>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Persona Name</Label>
              <Input
                id="name"
                placeholder="e.g., Professional Assistant"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the personality and purpose of this AI persona..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                required
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tone">Tone</Label>
                <Select value={formData.tone} onValueChange={(value) => setFormData({ ...formData, tone: value })}>
                  <SelectTrigger id="tone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="formal">Formal</SelectItem>
                    <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="response_style">Response Style</Label>
                <Select
                  value={formData.response_style}
                  onValueChange={(value) => setFormData({ ...formData, response_style: value })}
                >
                  <SelectTrigger id="response_style">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="concise">Concise</SelectItem>
                    <SelectItem value="detailed">Detailed</SelectItem>
                    <SelectItem value="conversational">Conversational</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-4 border-t pt-6">
            <h3 className="text-lg font-semibold">Career Information</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="career_title">Job Title</Label>
                <Input
                  id="career_title"
                  placeholder="e.g., Senior Software Engineer"
                  value={formData.career.title}
                  onChange={(e) => setFormData({ ...formData, career: { ...formData.career, title: e.target.value } })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience_years">Years of Experience</Label>
                <Input
                  id="experience_years"
                  type="number"
                  min="0"
                  placeholder="e.g., 5"
                  value={formData.career.experience_years}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      career: { ...formData.career, experience_years: Number.parseInt(e.target.value) || 0 },
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                placeholder="e.g., Technology, Healthcare, Finance"
                value={formData.career.industry}
                onChange={(e) => setFormData({ ...formData, career: { ...formData.career, industry: e.target.value } })}
              />
            </div>

            <div className="space-y-2">
              <Label>Specializations / Skills</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a skill or specialization"
                  value={newSpecialization}
                  onChange={(e) => setNewSpecialization(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSpecialization())}
                />
                <Button type="button" onClick={addSpecialization} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.career.specializations.map((spec, index) => (
                  <Badge key={index} variant="secondary" className="gap-1">
                    {spec}
                    <button type="button" onClick={() => removeSpecialization(index)} className="ml-1">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4 border-t pt-6">
            <h3 className="text-lg font-semibold">Education</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="degree">Degree</Label>
                <Input
                  id="degree"
                  placeholder="e.g., Bachelor of Science"
                  value={formData.education.degree}
                  onChange={(e) =>
                    setFormData({ ...formData, education: { ...formData.education, degree: e.target.value } })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="field">Field of Study</Label>
                <Input
                  id="field"
                  placeholder="e.g., Computer Science"
                  value={formData.education.field}
                  onChange={(e) =>
                    setFormData({ ...formData, education: { ...formData.education, field: e.target.value } })
                  }
                />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="institution">Institution</Label>
                <Input
                  id="institution"
                  placeholder="e.g., Stanford University"
                  value={formData.education.institution}
                  onChange={(e) =>
                    setFormData({ ...formData, education: { ...formData.education, institution: e.target.value } })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="graduation_year">Graduation Year</Label>
                <Input
                  id="graduation_year"
                  type="number"
                  min="1950"
                  max="2050"
                  placeholder="e.g., 2020"
                  value={formData.education.graduation_year}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      education: { ...formData.education, graduation_year: Number.parseInt(e.target.value) || 0 },
                    })
                  }
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 border-t pt-6">
            <h3 className="text-lg font-semibold">Projects</h3>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Add Project</CardTitle>
                <CardDescription>Showcase your work and achievements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="project_title">Project Title</Label>
                  <Input
                    id="project_title"
                    placeholder="e.g., E-commerce Platform"
                    value={newProject.title}
                    onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project_description">Description</Label>
                  <Textarea
                    id="project_description"
                    placeholder="Describe the project..."
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project_technologies">Technologies (comma-separated)</Label>
                  <Input
                    id="project_technologies"
                    placeholder="e.g., React, Node.js, PostgreSQL"
                    value={newProject.technologies}
                    onChange={(e) => setNewProject({ ...newProject, technologies: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project_link">Link (optional)</Label>
                  <Input
                    id="project_link"
                    type="url"
                    placeholder="https://..."
                    value={newProject.link}
                    onChange={(e) => setNewProject({ ...newProject, link: e.target.value })}
                  />
                </div>
                <Button type="button" onClick={addProject} variant="outline" className="w-full bg-transparent">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Project
                </Button>
              </CardContent>
            </Card>

            {formData.projects.length > 0 && (
              <div className="space-y-2">
                {formData.projects.map((project, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base">{project.title}</CardTitle>
                          <CardDescription className="mt-1">{project.description}</CardDescription>
                        </div>
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeProject(index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    {(project.technologies || project.link) && (
                      <CardContent>
                        {project.technologies && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {project.technologies.map((tech, i) => (
                              <Badge key={i} variant="outline">
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {project.link && (
                          <a
                            href={project.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline"
                          >
                            View Project →
                          </a>
                        )}
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4 border-t pt-6">
            <h3 className="text-lg font-semibold">Job Preferences</h3>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="remote">Remote Work</Label>
                <p className="text-sm text-muted-foreground">Prefer remote or hybrid positions</p>
              </div>
              <Switch
                id="remote"
                checked={formData.job_preferences.remote}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, job_preferences: { ...formData.job_preferences, remote: checked } })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Preferred Locations</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a location"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addLocation())}
                />
                <Button type="button" onClick={addLocation} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.job_preferences.location.map((loc, index) => (
                  <Badge key={index} variant="secondary" className="gap-1">
                    {loc}
                    <button type="button" onClick={() => removeLocation(index)} className="ml-1">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Job Types</Label>
              <div className="flex flex-wrap gap-2">
                {["full-time", "part-time", "contract", "freelance"].map((type) => (
                  <Badge
                    key={type}
                    variant={formData.job_preferences.job_types.includes(type) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleJobType(type)}
                  >
                    {type}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Salary Range (USD)</Label>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="salary_min" className="text-sm text-muted-foreground">
                    Minimum
                  </Label>
                  <Input
                    id="salary_min"
                    type="number"
                    min="0"
                    step="1000"
                    placeholder="e.g., 80000"
                    value={formData.job_preferences.salary_range.min}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        job_preferences: {
                          ...formData.job_preferences,
                          salary_range: {
                            ...formData.job_preferences.salary_range,
                            min: Number.parseInt(e.target.value) || 0,
                          },
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salary_max" className="text-sm text-muted-foreground">
                    Maximum
                  </Label>
                  <Input
                    id="salary_max"
                    type="number"
                    min="0"
                    step="1000"
                    placeholder="e.g., 120000"
                    value={formData.job_preferences.salary_range.max}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        job_preferences: {
                          ...formData.job_preferences,
                          salary_range: {
                            ...formData.job_preferences.salary_range,
                            max: Number.parseInt(e.target.value) || 0,
                          },
                        },
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 border-t pt-6">
            <h3 className="text-lg font-semibold">Visibility Settings</h3>
            <div className="space-y-2">
              <Label htmlFor="visibility">Status</Label>
              <Select
                value={formData.visibility}
                onValueChange={(value) => setFormData({ ...formData, visibility: value as "published" | "private" })}
              >
                <SelectTrigger id="visibility">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="published">Published - Active for messaging</SelectItem>
                  <SelectItem value="private">Private - Inactive</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                {formData.visibility === "published"
                  ? "This persona is active and can be used for automated responses"
                  : "This persona is inactive and won't be used for messaging"}
              </p>
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? "Saving..." : persona ? "Update Persona" : "Create Persona"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/dashboard/personas")}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
