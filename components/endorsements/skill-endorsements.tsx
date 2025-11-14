"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ThumbsUp } from "lucide-react"
import { useRouter } from "next/navigation"
import type { SkillWithEndorsements } from "@/lib/types"

interface SkillEndorsementsProps {
  personaId: string
  skills: SkillWithEndorsements[]
  canEndorse: boolean
}

export function SkillEndorsements({ personaId, skills, canEndorse }: SkillEndorsementsProps) {
  const router = useRouter()
  const [endorsingSkill, setEndorsingSkill] = useState<string | null>(null)

  const handleEndorse = async (skill: string, isEndorsed: boolean) => {
    setEndorsingSkill(skill)
    try {
      const response = await fetch("/api/endorsements", {
        method: isEndorsed ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ persona_id: personaId, skill }),
      })

      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error("[v0] Endorsement action failed:", error)
    } finally {
      setEndorsingSkill(null)
    }
  }

  if (skills.length === 0) return null

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-muted-foreground">Skills & Endorsements</h4>
      <div className="flex flex-wrap gap-2">
        {skills.map((skillData) => (
          <Badge
            key={skillData.skill}
            variant={skillData.is_endorsed_by_current_user ? "default" : "secondary"}
            className="flex items-center gap-1 px-3 py-1"
          >
            <span>{skillData.skill}</span>
            {canEndorse && (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1 hover:bg-transparent"
                onClick={() => handleEndorse(skillData.skill, skillData.is_endorsed_by_current_user)}
                disabled={endorsingSkill === skillData.skill}
              >
                <ThumbsUp className={`h-3 w-3 ${skillData.is_endorsed_by_current_user ? "fill-current" : ""}`} />
              </Button>
            )}
            <span className="text-xs ml-1">{skillData.endorsement_count}</span>
          </Badge>
        ))}
      </div>
    </div>
  )
}
