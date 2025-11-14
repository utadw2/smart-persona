"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface GlobalAISettingsProps {
  settings: any
}

export function GlobalAISettings({ settings }: GlobalAISettingsProps) {
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    model: settings?.model || "openai/gpt-4o-mini",
    temperature: settings?.temperature || 0.7,
    max_tokens: settings?.max_tokens || 500,
    auto_reply: settings?.auto_reply ?? true,
    response_delay: settings?.response_delay || 0,
    custom_instructions: settings?.custom_instructions || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      if (settings) {
        const { error } = await supabase
          .from("ai_settings")
          .update({ ...formData, is_global: true })
          .eq("id", settings.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from("ai_settings").insert([{ ...formData, is_global: true }])
        if (error) throw error
      }
      setSuccess(true)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Configuration</CardTitle>
        <CardDescription>Default settings for all AI personas</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="model">AI Model</Label>
            <Select value={formData.model} onValueChange={(value) => setFormData({ ...formData, model: value })}>
              <SelectTrigger id="model">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai/gpt-4o-mini">GPT-4o Mini</SelectItem>
                <SelectItem value="openai/gpt-4o">GPT-4o</SelectItem>
                <SelectItem value="anthropic/claude-sonnet-4">Claude Sonnet 4</SelectItem>
                <SelectItem value="xai/grok-beta">Grok Beta</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="temperature">Temperature</Label>
              <Input
                id="temperature"
                type="number"
                step="0.1"
                min="0"
                max="2"
                value={formData.temperature}
                onChange={(e) => setFormData({ ...formData, temperature: Number.parseFloat(e.target.value) })}
              />
              <p className="text-xs text-muted-foreground">0 = focused, 2 = creative</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_tokens">Max Tokens</Label>
              <Input
                id="max_tokens"
                type="number"
                min="50"
                max="4000"
                value={formData.max_tokens}
                onChange={(e) => setFormData({ ...formData, max_tokens: Number.parseInt(e.target.value) })}
              />
              <p className="text-xs text-muted-foreground">Maximum response length</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="response_delay">Response Delay (seconds)</Label>
            <Input
              id="response_delay"
              type="number"
              min="0"
              max="300"
              value={formData.response_delay}
              onChange={(e) => setFormData({ ...formData, response_delay: Number.parseInt(e.target.value) })}
            />
            <p className="text-xs text-muted-foreground">Delay before sending AI responses</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom_instructions">Custom Instructions</Label>
            <Textarea
              id="custom_instructions"
              placeholder="Add global instructions for all AI personas..."
              value={formData.custom_instructions}
              onChange={(e) => setFormData({ ...formData, custom_instructions: e.target.value })}
              rows={4}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="auto_reply">Auto Reply</Label>
              <p className="text-sm text-muted-foreground">Automatically respond to incoming messages</p>
            </div>
            <Switch
              id="auto_reply"
              checked={formData.auto_reply}
              onCheckedChange={(checked) => setFormData({ ...formData, auto_reply: checked })}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          {success && <p className="text-sm text-green-600">Settings saved successfully!</p>}

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Settings"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
