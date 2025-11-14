"use client"

import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { Bot, User } from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  content: string
  direction: string
  ai_generated: boolean
  created_at: string
  status: string
  sender: string
  recipient: string
}

interface MessageThreadProps {
  messages: Message[]
}

export function MessageThread({ messages }: MessageThreadProps) {
  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">No messages yet. Start a conversation!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mx-auto max-w-4xl space-y-4">
        {messages.map((message) => {
          const isOutbound = message.direction === "outbound"

          return (
            <div key={message.id} className={cn("flex gap-3", isOutbound ? "flex-row-reverse" : "flex-row")}>
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                  isOutbound ? "bg-primary/10" : "bg-muted",
                )}
              >
                {isOutbound ? (
                  <Bot className="h-4 w-4 text-primary" />
                ) : (
                  <User className="h-4 w-4 text-muted-foreground" />
                )}
              </div>

              <div className={cn("flex max-w-[70%] flex-col gap-2", isOutbound ? "items-end" : "items-start")}>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{isOutbound ? message.sender : message.recipient}</span>
                  {message.ai_generated && (
                    <Badge variant="outline" className="text-xs">
                      AI
                    </Badge>
                  )}
                  <Badge variant="secondary" className="text-xs">
                    {message.status}
                  </Badge>
                </div>

                <div
                  className={cn("rounded-lg px-4 py-2", isOutbound ? "bg-primary text-primary-foreground" : "bg-muted")}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                </div>

                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
