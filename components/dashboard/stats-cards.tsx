import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, Users, Zap } from "lucide-react"

interface StatsCardsProps {
  personasCount: number
  messagesCount: number
  channelsCount: number
}

export function StatsCards({ personasCount, messagesCount, channelsCount }: StatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Active Personas</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{personasCount}</div>
          <p className="text-xs text-muted-foreground">AI personalities configured</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{messagesCount}</div>
          <p className="text-xs text-muted-foreground">Across all channels</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Connected Channels</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{channelsCount}</div>
          <p className="text-xs text-muted-foreground">Social media accounts</p>
        </CardContent>
      </Card>
    </div>
  )
}
