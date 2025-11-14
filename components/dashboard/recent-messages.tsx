import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

interface Message {
  id: string
  content: string
  direction: string
  ai_generated: boolean
  created_at: string
  status: string
}

interface RecentMessagesProps {
  messages: Message[]
}

export function RecentMessages({ messages }: RecentMessagesProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Messages</CardTitle>
            <CardDescription>Latest activity across channels</CardDescription>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard/messages">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-sm text-muted-foreground">No messages yet. Connect a channel to get started.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.slice(0, 5).map((message) => (
              <div key={message.id} className="flex items-start gap-3 border-b pb-4 last:border-0 last:pb-0">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={message.direction === "outbound" ? "default" : "secondary"} className="text-xs">
                      {message.direction}
                    </Badge>
                    {message.ai_generated && (
                      <Badge variant="outline" className="text-xs">
                        AI
                      </Badge>
                    )}
                  </div>
                  <p className="mt-2 text-sm line-clamp-2">{message.content}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
