"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Twitter, Facebook, Instagram, Linkedin } from "lucide-react"

interface Channel {
  id: string
  name: string
  type: string
  icon: string
  is_enabled: boolean
}

interface UserChannel {
  id: string
  channel_id: string
  is_connected: boolean
  channels: Channel
}

interface ChannelsListProps {
  availableChannels: Channel[]
  userChannels: UserChannel[]
  userId: string
}

const iconMap: Record<string, any> = {
  twitter: Twitter,
  facebook: Facebook,
  instagram: Instagram,
  linkedin: Linkedin,
  default: MessageSquare,
}

export function ChannelsList({ availableChannels, userChannels }: ChannelsListProps) {
  const getChannelStatus = (channelId: string) => {
    return userChannels.find((uc) => uc.channel_id === channelId)
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {availableChannels.map((channel) => {
        const userChannel = getChannelStatus(channel.id)
        const Icon = iconMap[channel.type.toLowerCase()] || iconMap.default

        return (
          <Card key={channel.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{channel.name}</CardTitle>
                    <CardDescription className="text-xs">{channel.type}</CardDescription>
                  </div>
                </div>
                {userChannel?.is_connected && (
                  <Badge variant="secondary" className="text-xs">
                    Connected
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <Button variant={userChannel?.is_connected ? "outline" : "default"} className="w-full" disabled>
                {userChannel?.is_connected ? "Manage" : "Connect"}
              </Button>
              <p className="mt-2 text-center text-xs text-muted-foreground">Coming soon</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
