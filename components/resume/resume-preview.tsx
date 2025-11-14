"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Download, Mail, MapPin, Globe, Linkedin, Github } from "lucide-react"
import type { Resume } from "@/lib/ai/generate-resume"
import type { Profile } from "@/lib/types"

interface ResumePreviewProps {
  resume: Resume
  profile: Profile | null
}

export function ResumePreview({ resume, profile }: ResumePreviewProps) {
  const handleDownload = () => {
    const resumeText = `
${resume.personalInfo.name}
${resume.personalInfo.title}
${resume.personalInfo.email ? `Email: ${resume.personalInfo.email}` : ""}
${resume.personalInfo.phone ? `Phone: ${resume.personalInfo.phone}` : ""}
${resume.personalInfo.location ? `Location: ${resume.personalInfo.location}` : ""}
${resume.personalInfo.linkedin ? `LinkedIn: ${resume.personalInfo.linkedin}` : ""}
${resume.personalInfo.github ? `GitHub: ${resume.personalInfo.github}` : ""}
${resume.personalInfo.website ? `Website: ${resume.personalInfo.website}` : ""}

PROFESSIONAL SUMMARY
${resume.professionalSummary}

EXPERIENCE
${resume.experience
  .map(
    (exp) => `
${exp.title} at ${exp.company}
${exp.duration}
${exp.description}
Achievements:
${exp.achievements.map((a) => `• ${a}`).join("\n")}
`,
  )
  .join("\n")}

SKILLS
Technical Skills: ${resume.skills.technical.join(", ")}
Soft Skills: ${resume.skills.soft.join(", ")}

EDUCATION
${resume.education
  .map(
    (edu) => `
${edu.degree} in ${edu.field}
${edu.institution}, ${edu.year}
${edu.achievements ? edu.achievements.map((a) => `• ${a}`).join("\n") : ""}
`,
  )
  .join("\n")}

${
  resume.projects && resume.projects.length > 0
    ? `
PROJECTS
${resume.projects
  .map(
    (proj) => `
${proj.title}
${proj.description}
Technologies: ${proj.technologies.join(", ")}
${proj.link ? `Link: ${proj.link}` : ""}
Highlights:
${proj.highlights.map((h) => `• ${h}`).join("\n")}
`,
  )
  .join("\n")}
`
    : ""
}

${
  resume.certifications && resume.certifications.length > 0
    ? `
CERTIFICATIONS
${resume.certifications.map((cert) => `• ${cert.name} - ${cert.issuer} (${cert.year})`).join("\n")}
`
    : ""
}
    `.trim()

    const blob = new Blob([resumeText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${resume.personalInfo.name.replace(/\s+/g, "_")}_Resume.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Card className="p-8">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-xl font-semibold">Resume Preview</h2>
        <Button onClick={handleDownload} variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Download
        </Button>
      </div>

      <div className="space-y-6 text-sm">
        {/* Header */}
        <div className="border-b pb-4">
          <h1 className="text-2xl font-bold text-foreground">{resume.personalInfo.name}</h1>
          <p className="text-lg text-muted-foreground mt-1">{resume.personalInfo.title}</p>
          <div className="flex flex-wrap gap-4 mt-3 text-muted-foreground">
            {resume.personalInfo.email && (
              <div className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                <span className="text-xs">{resume.personalInfo.email}</span>
              </div>
            )}
            {resume.personalInfo.location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span className="text-xs">{resume.personalInfo.location}</span>
              </div>
            )}
            {resume.personalInfo.linkedin && (
              <div className="flex items-center gap-1">
                <Linkedin className="h-3 w-3" />
                <span className="text-xs">{resume.personalInfo.linkedin}</span>
              </div>
            )}
            {resume.personalInfo.github && (
              <div className="flex items-center gap-1">
                <Github className="h-3 w-3" />
                <span className="text-xs">{resume.personalInfo.github}</span>
              </div>
            )}
            {resume.personalInfo.website && (
              <div className="flex items-center gap-1">
                <Globe className="h-3 w-3" />
                <span className="text-xs">{resume.personalInfo.website}</span>
              </div>
            )}
          </div>
        </div>

        {/* Professional Summary */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground mb-2">Professional Summary</h3>
          <p className="text-muted-foreground leading-relaxed">{resume.professionalSummary}</p>
        </div>

        {/* Experience */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground mb-3">Experience</h3>
          <div className="space-y-4">
            {resume.experience.map((exp, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h4 className="font-semibold text-foreground">{exp.title}</h4>
                    <p className="text-muted-foreground">{exp.company}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{exp.duration}</span>
                </div>
                <p className="text-muted-foreground text-xs mb-2">{exp.description}</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground text-xs">
                  {exp.achievements.map((achievement, i) => (
                    <li key={i}>{achievement}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Skills */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground mb-2">Skills</h3>
          <div className="space-y-2">
            <div>
              <span className="font-medium text-foreground">Technical: </span>
              <span className="text-muted-foreground">{resume.skills.technical.join(", ")}</span>
            </div>
            <div>
              <span className="font-medium text-foreground">Soft Skills: </span>
              <span className="text-muted-foreground">{resume.skills.soft.join(", ")}</span>
            </div>
          </div>
        </div>

        {/* Education */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground mb-3">Education</h3>
          <div className="space-y-3">
            {resume.education.map((edu, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-foreground">
                      {edu.degree} in {edu.field}
                    </h4>
                    <p className="text-muted-foreground text-xs">{edu.institution}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{edu.year}</span>
                </div>
                {edu.achievements && edu.achievements.length > 0 && (
                  <ul className="list-disc list-inside mt-1 space-y-1 text-muted-foreground text-xs">
                    {edu.achievements.map((achievement, i) => (
                      <li key={i}>{achievement}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Projects */}
        {resume.projects && resume.projects.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground mb-3">Projects</h3>
            <div className="space-y-3">
              {resume.projects.map((proj, idx) => (
                <div key={idx}>
                  <h4 className="font-semibold text-foreground">{proj.title}</h4>
                  <p className="text-muted-foreground text-xs mb-1">{proj.description}</p>
                  <p className="text-xs text-muted-foreground mb-1">
                    <span className="font-medium">Technologies:</span> {proj.technologies.join(", ")}
                  </p>
                  {proj.link && (
                    <p className="text-xs text-primary mb-1">
                      <a href={proj.link} target="_blank" rel="noopener noreferrer">
                        {proj.link}
                      </a>
                    </p>
                  )}
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground text-xs">
                    {proj.highlights.map((highlight, i) => (
                      <li key={i}>{highlight}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {resume.certifications && resume.certifications.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground mb-2">Certifications</h3>
            <ul className="space-y-1 text-muted-foreground text-xs">
              {resume.certifications.map((cert, idx) => (
                <li key={idx}>
                  <span className="font-medium text-foreground">{cert.name}</span> - {cert.issuer} ({cert.year})
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Card>
  )
}
