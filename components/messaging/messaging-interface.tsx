"use client"

import { useState } from "react"
import { ChannelSelector } from "./channel-selector"
import { MessageThread } from "./message-thread"
import { MessageComposer } from "./message-composer"

interface Persona {
  id: string
  name: string
  description: string
  tone: string
  response_style: string
}

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

interface Message {
  id: string
  content: string
  direction: string
  ai_generated: boolean
  created_at: string
  status: string
  sender: string
  recipient: string
  channel_id: string
  persona_id: string
}

interface MessagingInterfaceProps {
  userId: string
  personas: Persona[]
  channels: Channel[]
  initialMessages: Message[]
}

export function MessagingInterface({ userId, personas, channels, initialMessages }: MessagingInterfaceProps) {
  const [selectedChannel, setSelectedChannel] = useState<string | null>(channels[0]?.channels.id || null)
  const [messages, setMessages] = useState<Message[]>(initialMessages)

  const filteredMessages = selectedChannel ? messages.filter((m) => m.channel_id === selectedChannel) : messages

  const handleNewMessage = (message: Message) => {
    setMessages((prev) => [message, ...prev])
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar - Channel List */}
      <div className="w-80 border-r bg-muted/30">
        <ChannelSelector channels={channels} selectedChannel={selectedChannel} onSelectChannel={setSelectedChannel} />
      </div>

      {/* Main Content - Messages */}
      <div className="flex flex-1 flex-col">
        {selectedChannel ? (
          <>
            <MessageThread messages={filteredMessages} />
            <MessageComposer
              userId={userId}
              personas={personas}
              channelId={selectedChannel}
              onMessageSent={handleNewMessage}
            />
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <h3 className="mb-2 text-lg font-semibold">No Channel Selected</h3>
              <p className="text-sm text-muted-foreground">Select a channel from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
