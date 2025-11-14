"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { exportPersonaToPDF } from "@/lib/pdf/export-persona"
import type { Persona, Profile } from "@/lib/types"

interface ExportPersonaButtonProps {
  persona: Persona
  profile?: Profile | null
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
}

export function ExportPersonaButton({ persona, profile, variant = "outline", size = "sm" }: ExportPersonaButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    try {
      exportPersonaToPDF(persona, profile)
    } catch (error) {
      console.error("[v0] Error exporting persona:", error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Button onClick={handleExport} variant={variant} size={size} disabled={isExporting}>
      <Download className="mr-2 h-4 w-4" />
      {isExporting ? "Exporting..." : "Export PDF"}
    </Button>
  )
}
