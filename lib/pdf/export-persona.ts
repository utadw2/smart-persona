import jsPDF from "jspdf"
import type { Persona, Profile } from "@/lib/types"

export function exportPersonaToPDF(persona: Persona, profile?: Profile | null) {
  const doc = new jsPDF()

  let yPosition = 20
  const pageWidth = doc.internal.pageSize.getWidth()
  const leftMargin = 20
  const rightMargin = 20
  const contentWidth = pageWidth - leftMargin - rightMargin

  // Helper function to add text with wrapping
  const addText = (text: string, fontSize = 10, isBold = false) => {
    if (isBold) {
      doc.setFont("helvetica", "bold")
    } else {
      doc.setFont("helvetica", "normal")
    }
    doc.setFontSize(fontSize)
    const lines = doc.splitTextToSize(text, contentWidth)
    doc.text(lines, leftMargin, yPosition)
    yPosition += lines.length * (fontSize * 0.5) + 2
  }

  const addSection = (title: string) => {
    yPosition += 5
    doc.setFillColor(240, 240, 240)
    doc.rect(leftMargin, yPosition - 5, contentWidth, 8, "F")
    doc.setFont("helvetica", "bold")
    doc.setFontSize(12)
    doc.text(title, leftMargin + 2, yPosition)
    yPosition += 10
  }

  // Title
  doc.setFont("helvetica", "bold")
  doc.setFontSize(20)
  doc.text(persona.name, leftMargin, yPosition)
  yPosition += 10

  // Profile info
  if (profile?.full_name) {
    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(`by ${profile.full_name}`, leftMargin, yPosition)
    yPosition += 8
    doc.setTextColor(0, 0, 0)
  }

  // Description
  addSection("About")
  addText(persona.description)

  // Persona Details
  addSection("Persona Details")
  addText(`Tone: ${persona.tone}`, 10, true)
  addText(`Response Style: ${persona.response_style}`, 10, true)

  // Career Information
  if (persona.career && (persona.career.title || persona.career.industry)) {
    addSection("Career")

    if (persona.career.title) {
      addText(`Position: ${persona.career.title}`, 10, true)
    }

    if (persona.career.industry) {
      addText(`Industry: ${persona.career.industry}`)
    }

    if (persona.career.experience_years) {
      addText(`Experience: ${persona.career.experience_years} years`)
    }

    if (persona.career.specializations && persona.career.specializations.length > 0) {
      addText("Skills:", 10, true)
      addText(persona.career.specializations.join(", "))
    }
  }

  // Education
  if (persona.education && (persona.education.degree || persona.education.institution)) {
    addSection("Education")

    if (persona.education.degree) {
      addText(persona.education.degree, 10, true)
    }

    if (persona.education.field) {
      addText(persona.education.field)
    }

    const eduDetails = []
    if (persona.education.institution) eduDetails.push(persona.education.institution)
    if (persona.education.graduation_year) eduDetails.push(String(persona.education.graduation_year))

    if (eduDetails.length > 0) {
      addText(eduDetails.join(" • "))
    }
  }

  // Projects
  if (persona.projects && persona.projects.length > 0) {
    addSection("Projects")

    persona.projects.forEach((project: any) => {
      addText(project.title, 11, true)
      addText(project.description)

      if (project.technologies && project.technologies.length > 0) {
        addText(`Technologies: ${project.technologies.join(", ")}`, 9)
      }

      if (project.link) {
        doc.setTextColor(0, 0, 255)
        addText(project.link, 9)
        doc.setTextColor(0, 0, 0)
      }

      yPosition += 3
    })
  }

  // Job Preferences
  if (persona.job_preferences) {
    addSection("Job Preferences")

    if (persona.job_preferences.remote !== undefined) {
      addText(`Remote Work: ${persona.job_preferences.remote ? "Yes" : "No"}`)
    }

    if (persona.job_preferences.job_types && persona.job_preferences.job_types.length > 0) {
      addText(`Job Types: ${persona.job_preferences.job_types.join(", ")}`)
    }

    if (persona.job_preferences.location && persona.job_preferences.location.length > 0) {
      addText(`Preferred Locations: ${persona.job_preferences.location.join(", ")}`)
    }

    if (persona.job_preferences.salary_range) {
      const min = persona.job_preferences.salary_range.min?.toLocaleString() || "0"
      const max = persona.job_preferences.salary_range.max?.toLocaleString() || "0"
      addText(`Salary Range: $${min} - $${max}`)
    }
  }

  // Footer
  yPosition = doc.internal.pageSize.getHeight() - 15
  doc.setFontSize(8)
  doc.setTextColor(150, 150, 150)
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, leftMargin, yPosition)

  // Save the PDF
  doc.save(`${persona.name.replace(/\s+/g, "_")}_Persona.pdf`)
}
