import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"

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

interface MessagesListProps {
  messages: Message[]
}

export function MessagesList({ messages }: MessagesListProps) {
  if (messages.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <h3 className="mb-2 text-lg font-semibold">No messages yet</h3>
          <p className="text-center text-sm text-muted-foreground">
            Messages will appear here once you connect channels and start communicating
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <Card key={message.id}>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-2">
                  <Badge variant={message.direction === "outbound" ? "default" : "secondary"}>
                    {message.direction}
                  </Badge>
                  {message.ai_generated && <Badge variant="outline">AI Generated</Badge>}
                  <Badge variant="outline">{message.status}</Badge>
                </div>
                <p className="mb-2 text-sm">{message.content}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>From: {message.sender}</span>
                  <span>To: {message.recipient}</span>
                  <span>{formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
