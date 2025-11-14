import { generateText } from "ai"

interface GenerateResponseParams {
  message: string
  persona: {
    name: string
    description: string
    tone: string
    response_style: string
    personality_traits?: any
  }
  aiSettings: {
    model: string
    temperature: number
    max_tokens: number
    custom_instructions?: string
  }
  context?: string
}

export async function generateAIResponse({
  message,
  persona,
  aiSettings,
  context,
}: GenerateResponseParams): Promise<string> {
  const systemPrompt = `You are ${persona.name}, an AI assistant with the following characteristics:

Description: ${persona.description}
Tone: ${persona.tone}
Response Style: ${persona.response_style}

${aiSettings.custom_instructions ? `Additional Instructions: ${aiSettings.custom_instructions}` : ""}

${context ? `Context: ${context}` : ""}

Respond to messages in a way that matches your personality and tone. Keep responses natural and engaging.`

  try {
    const { text } = await generateText({
      model: aiSettings.model,
      temperature: aiSettings.temperature,
      maxTokens: aiSettings.max_tokens,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: message,
        },
      ],
    })

    return text
  } catch (error) {
    console.error("[v0] AI generation error:", error)
    throw new Error("Failed to generate AI response")
  }
}
