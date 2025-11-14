"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Plus, Settings } from "lucide-react"

interface Channel {
  id: string
  name: string
  type: string
  is_enabled: boolean
  icon: string
}

interface AdminChannelsManagerProps {
  channels: Channel[]
}

export function AdminChannelsManager({ channels }: AdminChannelsManagerProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Channel
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {channels.map((channel) => (
          <Card key={channel.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base">{channel.name}</CardTitle>
                  <CardDescription className="text-xs">{channel.type}</CardDescription>
                </div>
                <Badge variant={channel.is_enabled ? "secondary" : "outline"} className="text-xs">
                  {channel.is_enabled ? "Enabled" : "Disabled"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Enable Channel</span>
                  <Switch checked={channel.is_enabled} disabled />
                </div>
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  <Settings className="mr-2 h-4 w-4" />
                  Configure
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {channels.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <h3 className="mb-2 text-lg font-semibold">No channels configured</h3>
            <p className="mb-6 text-center text-sm text-muted-foreground">
              Add your first social media channel to get started
            </p>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Channel
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
