"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Globe, Lock } from "lucide-react"

interface PersonaVisibilitySettingsProps {
  personaId: string
  isPublic: boolean
  onUpdate?: () => void
}

export function PersonaVisibilitySettings({ personaId, isPublic, onUpdate }: PersonaVisibilitySettingsProps) {
  const supabase = createClient()
  const [isPublicState, setIsPublicState] = useState(isPublic)
  const [isLoading, setIsLoading] = useState(false)

  const handleToggle = async (checked: boolean) => {
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from("personas")
        .update({
          is_public: checked,
          visibility: checked ? "public" : "private",
        })
        .eq("id", personaId)

      if (error) throw error

      setIsPublicState(checked)
      if (onUpdate) onUpdate()
    } catch (error) {
      console.error("Error updating visibility:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isPublicState ? <Globe className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
          Community Visibility
        </CardTitle>
        <CardDescription>Control whether this persona appears in the community showcase</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label htmlFor="public-toggle">Make Public</Label>
            <p className="text-sm text-muted-foreground">
              {isPublicState
                ? "This persona is visible to all users in the community"
                : "This persona is private and only visible to you"}
            </p>
          </div>
          <Switch id="public-toggle" checked={isPublicState} onCheckedChange={handleToggle} disabled={isLoading} />
        </div>
      </CardContent>
    </Card>
  )
}
