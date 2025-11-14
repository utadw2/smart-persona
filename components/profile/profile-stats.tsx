import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, MessageSquare, Radio } from "lucide-react"

interface ProfileStatsProps {
  personasCount: number
  messagesCount: number
  channelsCount: number
}

export function ProfileStats({ personasCount, messagesCount, channelsCount }: ProfileStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Personas</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{personasCount}</div>
          <p className="text-xs text-muted-foreground">AI personas created</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Messages Sent</CardTitle>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{messagesCount}</div>
          <p className="text-xs text-muted-foreground">Total messages</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Connected Channels</CardTitle>
          <Radio className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{channelsCount}</div>
          <p className="text-xs text-muted-foreground">Active connections</p>
        </CardContent>
      </Card>
    </div>
  )
}
