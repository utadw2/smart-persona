import { generateObject } from "ai"
import { z } from "zod"
import type { Persona } from "@/lib/types"

const resumeSchema = z.object({
  personalInfo: z.object({
    name: z.string(),
    title: z.string(),
    email: z.string().optional(),
    phone: z.string().optional(),
    location: z.string().optional(),
    linkedin: z.string().optional(),
    github: z.string().optional(),
    website: z.string().optional(),
  }),
  professionalSummary: z.string().describe("A compelling 2-3 sentence professional summary"),
  experience: z.array(
    z.object({
      title: z.string(),
      company: z.string(),
      duration: z.string(),
      description: z.string(),
      achievements: z.array(z.string()),
    }),
  ),
  skills: z.object({
    technical: z.array(z.string()),
    soft: z.array(z.string()),
  }),
  education: z.array(
    z.object({
      degree: z.string(),
      field: z.string(),
      institution: z.string(),
      year: z.string(),
      achievements: z.array(z.string()).optional(),
    }),
  ),
  projects: z
    .array(
      z.object({
        title: z.string(),
        description: z.string(),
        technologies: z.array(z.string()),
        link: z.string().optional(),
        highlights: z.array(z.string()),
      }),
    )
    .optional(),
  certifications: z
    .array(
      z.object({
        name: z.string(),
        issuer: z.string(),
        year: z.string(),
      }),
    )
    .optional(),
})

export type Resume = z.infer<typeof resumeSchema>

interface GenerateResumeParams {
  persona: Persona
  userProfile?: {
    email?: string
    full_name?: string
    location?: string
    linkedin?: string
    github?: string
    website?: string
  }
  targetJob?: {
    title?: string
    company?: string
    description?: string
  }
  style?: "professional" | "creative" | "technical" | "executive"
}

export async function generateResume({
  persona,
  userProfile,
  targetJob,
  style = "professional",
}: GenerateResumeParams): Promise<Resume> {
  const personaContext = `
Persona Name: ${persona.name}
Description: ${persona.description}

Career Information:
- Job Title: ${persona.career?.title || "Not specified"}
- Years of Experience: ${persona.career?.experience_years || "Not specified"}
- Industry: ${persona.career?.industry || "Not specified"}
- Specializations: ${persona.career?.specializations?.join(", ") || "Not specified"}

Education:
- Degree: ${persona.education?.degree || "Not specified"}
- Field: ${persona.education?.field || "Not specified"}
- Institution: ${persona.education?.institution || "Not specified"}
- Graduation Year: ${persona.education?.graduation_year || "Not specified"}

Projects:
${persona.projects?.map((p) => `- ${p.title}: ${p.description} (Technologies: ${p.technologies?.join(", ") || "N/A"})`).join("\n") || "No projects listed"}

Job Preferences:
- Remote: ${persona.job_preferences?.remote ? "Yes" : "No"}
- Preferred Locations: ${persona.job_preferences?.location?.join(", ") || "Any"}
- Job Types: ${persona.job_preferences?.job_types?.join(", ") || "Any"}
- Salary Range: ${persona.job_preferences?.salary_range ? `$${persona.job_preferences.salary_range.min} - $${persona.job_preferences.salary_range.max}` : "Not specified"}
`

  const targetJobContext = targetJob
    ? `\n\nTarget Job:
- Title: ${targetJob.title}
- Company: ${targetJob.company}
- Description: ${targetJob.description}

Please tailor the resume to highlight relevant skills and experience for this specific role.`
    : ""

  const styleInstructions = {
    professional:
      "Use a traditional, clean format with clear sections. Focus on achievements and quantifiable results.",
    creative:
      "Use engaging language and highlight innovative projects. Show personality while maintaining professionalism.",
    technical:
      "Emphasize technical skills, tools, and methodologies. Include detailed project descriptions with technical depth.",
    executive:
      "Focus on leadership, strategic impact, and business outcomes. Highlight management experience and organizational achievements.",
  }

  try {
    const { object } = await generateObject({
      model: "openai/gpt-5",
      schema: resumeSchema,
      messages: [
        {
          role: "system",
          content: `You are an expert resume writer and career coach. Generate a compelling, ATS-friendly resume based on the provided persona information.

Style: ${style}
Instructions: ${styleInstructions[style]}

Guidelines:
- Create a strong professional summary that captures the candidate's value proposition
- Use action verbs and quantify achievements where possible
- Ensure all information is consistent and professional
- Make the resume ATS-friendly with clear section headers
- Highlight relevant skills and experience
- Keep descriptions concise but impactful`,
        },
        {
          role: "user",
          content: `Generate a professional resume based on this information:

${personaContext}

${
  userProfile
    ? `Contact Information:
- Email: ${userProfile.email || ""}
- Full Name: ${userProfile.full_name || persona.name}
- Location: ${userProfile.location || ""}
- LinkedIn: ${userProfile.linkedin || ""}
- GitHub: ${userProfile.github || ""}
- Website: ${userProfile.website || ""}`
    : ""
}

${targetJobContext}

Please generate a complete, professional resume that showcases this person's qualifications effectively.`,
        },
      ],
      maxOutputTokens: 3000,
      temperature: 0.7,
    })

    return object
  } catch (error) {
    console.error("[v0] Resume generation error:", error)
    throw new Error("Failed to generate resume")
  }
}
