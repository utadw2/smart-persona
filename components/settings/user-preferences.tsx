"use client"

import type React from "react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { UserPreferences } from "@/lib/types"

interface UserPreferencesProps {
  preferences: UserPreferences | null
  userId: string
}

export function UserPreferencesComponent({ preferences, userId }: UserPreferencesProps) {
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    remember_me: preferences?.remember_me ?? false,
    session_timeout_minutes: preferences?.session_timeout_minutes ?? 30,
    auto_logout: preferences?.auto_logout ?? true,
    theme: preferences?.theme ?? "system",
    profile_visibility: preferences?.profile_visibility ?? "public",
    show_online_status: preferences?.show_online_status ?? true,
    allow_messages: preferences?.allow_messages ?? true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const { error } = await supabase.from("user_preferences").upsert({
        user_id: userId,
        ...formData,
      })

      if (error) throw error
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
        <CardTitle>User Preferences</CardTitle>
        <CardDescription>Manage your session, notifications, and privacy settings</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Session Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Session Settings</h3>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="remember_me">Remember Me</Label>
                <p className="text-sm text-muted-foreground">Stay logged in for 30 days</p>
              </div>
              <Switch
                id="remember_me"
                checked={formData.remember_me}
                onCheckedChange={(checked) => setFormData({ ...formData, remember_me: checked })}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="auto_logout">Auto Logout</Label>
                <p className="text-sm text-muted-foreground">Automatically log out after inactivity</p>
              </div>
              <Switch
                id="auto_logout"
                checked={formData.auto_logout}
                onCheckedChange={(checked) => setFormData({ ...formData, auto_logout: checked })}
              />
            </div>
          </div>

          {/* UI Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Appearance</h3>

            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Select
                value={formData.theme}
                onValueChange={(value) => setFormData({ ...formData, theme: value as "light" | "dark" | "system" })}
              >
                <SelectTrigger id="theme">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Privacy</h3>

            <div className="space-y-2">
              <Label htmlFor="profile_visibility">Profile Visibility</Label>
              <Select
                value={formData.profile_visibility}
                onValueChange={(value) => setFormData({ ...formData, profile_visibility: value as any })}
              >
                <SelectTrigger id="profile_visibility">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="connections_only">Connections Only</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="show_online_status">Show Online Status</Label>
                <p className="text-sm text-muted-foreground">Let others see when you're online</p>
              </div>
              <Switch
                id="show_online_status"
                checked={formData.show_online_status}
                onCheckedChange={(checked) => setFormData({ ...formData, show_online_status: checked })}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="allow_messages">Allow Messages</Label>
                <p className="text-sm text-muted-foreground">Allow others to send you messages</p>
              </div>
              <Switch
                id="allow_messages"
                checked={formData.allow_messages}
                onCheckedChange={(checked) => setFormData({ ...formData, allow_messages: checked })}
              />
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
          {success && <p className="text-sm text-green-600">Preferences saved successfully!</p>}

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Preferences"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
