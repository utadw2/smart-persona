"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Plus, X } from "lucide-react"

interface JobFormProps {
  job?: any
}

export function JobForm({ job }: JobFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: job?.title || "",
    company: job?.company || "",
    description: job?.description || "",
    location: job?.location || "",
    remote: job?.remote ?? false,
    job_type: job?.job_type || "full-time",
    salary_min: job?.salary_min || 0,
    salary_max: job?.salary_max || 0,
    industry: job?.industry || "",
    experience_required: job?.experience_required || 0,
    application_url: job?.application_url || "",
    is_active: job?.is_active ?? true,
    requirements: job?.requirements || [],
    skills: job?.skills || [],
  })

  const [newRequirement, setNewRequirement] = useState("")
  const [newSkill, setNewSkill] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (job) {
        const { error } = await supabase.from("jobs").update(formData).eq("id", job.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from("jobs").insert([formData])
        if (error) throw error
      }
      router.push("/admin/jobs")
      router.refresh()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setFormData({ ...formData, requirements: [...formData.requirements, newRequirement.trim()] })
      setNewRequirement("")
    }
  }

  const removeRequirement = (index: number) => {
    setFormData({ ...formData, requirements: formData.requirements.filter((_, i) => i !== index) })
  }

  const addSkill = () => {
    if (newSkill.trim()) {
      setFormData({ ...formData, skills: [...formData.skills, newSkill.trim()] })
      setNewSkill("")
    }
  }

  const removeSkill = (index: number) => {
    setFormData({ ...formData, skills: formData.skills.filter((_, i) => i !== index) })
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title</Label>
              <Input
                id="title"
                placeholder="e.g., Senior Full Stack Developer"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                placeholder="e.g., TechCorp Inc"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Job Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the role, responsibilities, and what you're looking for..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={6}
              required
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                placeholder="e.g., Technology, Healthcare"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="job_type">Job Type</Label>
              <Select
                value={formData.job_type}
                onValueChange={(value) => setFormData({ ...formData, job_type: value })}
              >
                <SelectTrigger id="job_type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full-time">Full-time</SelectItem>
                  <SelectItem value="part-time">Part-time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="freelance">Freelance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g., San Francisco, CA"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience_required">Years of Experience Required</Label>
              <Input
                id="experience_required"
                type="number"
                min="0"
                value={formData.experience_required}
                onChange={(e) =>
                  setFormData({ ...formData, experience_required: Number.parseInt(e.target.value) || 0 })
                }
              />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="salary_min">Minimum Salary (USD)</Label>
              <Input
                id="salary_min"
                type="number"
                min="0"
                step="1000"
                placeholder="e.g., 80000"
                value={formData.salary_min}
                onChange={(e) => setFormData({ ...formData, salary_min: Number.parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="salary_max">Maximum Salary (USD)</Label>
              <Input
                id="salary_max"
                type="number"
                min="0"
                step="1000"
                placeholder="e.g., 120000"
                value={formData.salary_max}
                onChange={(e) => setFormData({ ...formData, salary_max: Number.parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="application_url">Application URL</Label>
            <Input
              id="application_url"
              type="url"
              placeholder="https://..."
              value={formData.application_url}
              onChange={(e) => setFormData({ ...formData, application_url: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Requirements</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add a requirement"
                value={newRequirement}
                onChange={(e) => setNewRequirement(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addRequirement())}
              />
              <Button type="button" onClick={addRequirement} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.requirements.map((req, index) => (
                <Badge key={index} variant="secondary" className="gap-1">
                  {req}
                  <button type="button" onClick={() => removeRequirement(index)} className="ml-1">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Required Skills</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add a skill"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
              />
              <Button type="button" onClick={addSkill} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.skills.map((skill, index) => (
                <Badge key={index} variant="secondary" className="gap-1">
                  {skill}
                  <button type="button" onClick={() => removeSkill(index)} className="ml-1">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="remote">Remote Work</Label>
              <p className="text-sm text-muted-foreground">This position allows remote work</p>
            </div>
            <Switch
              id="remote"
              checked={formData.remote}
              onCheckedChange={(checked) => setFormData({ ...formData, remote: checked })}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="is_active">Active Status</Label>
              <p className="text-sm text-muted-foreground">Make this job visible to users</p>
            </div>
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? "Saving..." : job ? "Update Job" : "Post Job"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/admin/jobs")}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
