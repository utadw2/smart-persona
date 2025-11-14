import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"

interface ProfileActivityProps {
  messages: any[]
  personas: any[]
}

export function ProfileActivity({ messages, personas }: ProfileActivityProps) {
  const activities = [
    ...messages.map((msg) => ({
      type: "message",
      title: "Sent a message",
      description: msg.content?.substring(0, 100) + (msg.content?.length > 100 ? "..." : ""),
      timestamp: msg.created_at,
      channel: msg.channel_id,
    })),
    ...personas.map((persona) => ({
      type: "persona",
      title: "Created persona",
      description: persona.name,
      timestamp: persona.created_at,
    })),
  ]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Your latest actions on the platform</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground">No recent activity</p>
          ) : (
            activities.map((activity, index) => (
              <div key={index} className="flex items-start gap-4 border-b pb-4 last:border-0 last:pb-0">
                <Badge variant={activity.type === "message" ? "default" : "secondary"} className="mt-1">
                  {activity.type}
                </Badge>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">{activity.title}</p>
                  <p className="text-sm text-muted-foreground">{activity.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
