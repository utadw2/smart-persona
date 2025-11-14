"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, FileText } from "lucide-react"
import type { Persona, Profile } from "@/lib/types"
import type { Resume } from "@/lib/ai/generate-resume"
import { ResumePreview } from "./resume-preview"

interface ResumeGeneratorProps {
  personas: Persona[]
  profile: Profile | null
}

export function ResumeGenerator({ personas, profile }: ResumeGeneratorProps) {
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>("")
  const [style, setStyle] = useState<string>("professional")
  const [targetJob, setTargetJob] = useState({
    title: "",
    company: "",
    description: "",
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedResume, setGeneratedResume] = useState<Resume | null>(null)
  const [error, setError] = useState<string>("")

  const handleGenerate = async () => {
    if (!selectedPersonaId) {
      setError("Please select a persona")
      return
    }

    setIsGenerating(true)
    setError("")

    try {
      const response = await fetch("/api/resume/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personaId: selectedPersonaId,
          targetJob: targetJob.title ? targetJob : undefined,
          style,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate resume")
      }

      const data = await response.json()
      setGeneratedResume(data.resume)
    } catch (err) {
      setError("Failed to generate resume. Please try again.")
      console.error(err)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Configuration Panel */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6">Resume Configuration</h2>

        <div className="space-y-6">
          {/* Persona Selection */}
          <div className="space-y-2">
            <Label htmlFor="persona">Select Persona</Label>
            <Select value={selectedPersonaId} onValueChange={setSelectedPersonaId}>
              <SelectTrigger id="persona">
                <SelectValue placeholder="Choose a persona" />
              </SelectTrigger>
              <SelectContent>
                {personas.map((persona) => (
                  <SelectItem key={persona.id} value={persona.id}>
                    {persona.name} - {persona.career?.title || "No title"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Style Selection */}
          <div className="space-y-2">
            <Label htmlFor="style">Resume Style</Label>
            <Select value={style} onValueChange={setStyle}>
              <SelectTrigger id="style">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="creative">Creative</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="executive">Executive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Target Job (Optional) */}
          <div className="space-y-4">
            <Label>Target Job (Optional)</Label>
            <Input
              placeholder="Job Title"
              value={targetJob.title}
              onChange={(e) => setTargetJob({ ...targetJob, title: e.target.value })}
            />
            <Input
              placeholder="Company Name"
              value={targetJob.company}
              onChange={(e) => setTargetJob({ ...targetJob, company: e.target.value })}
            />
            <Textarea
              placeholder="Job Description"
              value={targetJob.description}
              onChange={(e) => setTargetJob({ ...targetJob, description: e.target.value })}
              rows={4}
            />
          </div>

          {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}

          <Button onClick={handleGenerate} disabled={isGenerating || !selectedPersonaId} className="w-full" size="lg">
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Resume...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Generate Resume
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Preview Panel */}
      <div>
        {generatedResume ? (
          <ResumePreview resume={generatedResume} profile={profile} />
        ) : (
          <Card className="p-12 flex flex-col items-center justify-center text-center min-h-[600px]">
            <FileText className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Resume Generated</h3>
            <p className="text-muted-foreground text-sm">
              Select a persona and click "Generate Resume" to create your professional resume
            </p>
          </Card>
        )}
      </div>
    </div>
  )
}
