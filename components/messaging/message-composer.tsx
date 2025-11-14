"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Send, Sparkles, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Persona {
  id: string
  name: string
  description: string
  tone: string
  response_style: string
}

interface MessageComposerProps {
  userId: string
  personas: Persona[]
  channelId: string
  onMessageSent: (message: any) => void
}

export function MessageComposer({ userId, personas, channelId, onMessageSent }: MessageComposerProps) {
  const supabase = createClient()
  const [message, setMessage] = useState("")
  const [selectedPersona, setSelectedPersona] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!message.trim() || !selectedPersona) {
      setError("Please select a persona and enter a message")
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch("/api/messages/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          personaId: selectedPersona,
          channelId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate response")
      }

      setMessage(data.response)
    } catch (error) {
      console.error("[v0] Generation error:", error)
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSend = async () => {
    if (!message.trim() || !selectedPersona) {
      setError("Please select a persona and enter a message")
      return
    }

    setIsSending(true)
    setError(null)

    try {
      const persona = personas.find((p) => p.id === selectedPersona)

      const { data: newMessage, error: insertError } = await supabase
        .from("messages")
        .insert([
          {
            user_id: userId,
            persona_id: selectedPersona,
            channel_id: channelId,
            content: message,
            direction: "outbound",
            ai_generated: false,
            status: "sent",
            sender: persona?.name || "User",
            recipient: "Channel",
          },
        ])
        .select()
        .single()

      if (insertError) throw insertError

      onMessageSent(newMessage)
      setMessage("")
    } catch (error) {
      console.error("[v0] Send error:", error)
      setError(error instanceof Error ? error.message : "Failed to send message")
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="border-t bg-background p-4">
      <div className="mx-auto max-w-4xl space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Label htmlFor="persona" className="sr-only">
              Select Persona
            </Label>
            <Select value={selectedPersona} onValueChange={setSelectedPersona}>
              <SelectTrigger id="persona">
                <SelectValue placeholder="Select a persona" />
              </SelectTrigger>
              <SelectContent>
                {personas.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">No active personas</div>
                ) : (
                  personas.map((persona) => (
                    <SelectItem key={persona.id} value={persona.id}>
                      {persona.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="outline"
            onClick={handleGenerate}
            disabled={isGenerating || !selectedPersona || !message.trim()}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate AI
              </>
            )}
          </Button>
        </div>

        <div className="flex gap-2">
          <Textarea
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            className="resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
          />
          <Button
            onClick={handleSend}
            disabled={isSending || !selectedPersona || !message.trim()}
            size="icon"
            className="h-auto"
          >
            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    </div>
  )
}
