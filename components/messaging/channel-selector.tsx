"use client"
import { cn } from "@/lib/utils"
import { MessageSquare, Twitter, Facebook, Instagram, Linkedin, CheckCircle2 } from "lucide-react"

interface Channel {
  id: string
  channel_id: string
  is_connected: boolean
  channels: {
    id: string
    name: string
    type: string
    icon: string
  }
}

interface ChannelSelectorProps {
  channels: Channel[]
  selectedChannel: string | null
  onSelectChannel: (channelId: string) => void
}

const iconMap: Record<string, any> = {
  twitter: Twitter,
  facebook: Facebook,
  instagram: Instagram,
  linkedin: Linkedin,
  default: MessageSquare,
}

export function ChannelSelector({ channels, selectedChannel, onSelectChannel }: ChannelSelectorProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b p-4">
        <h2 className="text-lg font-semibold">Channels</h2>
        <p className="text-sm text-muted-foreground">{channels.length} connected</p>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {channels.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <MessageSquare className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">No channels connected yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {channels.map((channel) => {
              const Icon = iconMap[channel.channels.type.toLowerCase()] || iconMap.default
              const isSelected = selectedChannel === channel.channels.id

              return (
                <button
                  key={channel.id}
                  onClick={() => onSelectChannel(channel.channels.id)}
                  className={cn(
                    "w-full rounded-lg border p-3 text-left transition-colors hover:bg-accent",
                    isSelected && "border-primary bg-accent",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-lg",
                        isSelected ? "bg-primary/10" : "bg-muted",
                      )}
                    >
                      <Icon className={cn("h-5 w-5", isSelected ? "text-primary" : "text-muted-foreground")} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{channel.channels.name}</p>
                        {channel.is_connected && <CheckCircle2 className="h-3 w-3 text-green-500" />}
                      </div>
                      <p className="text-xs text-muted-foreground">{channel.channels.type}</p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
