import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users } from "lucide-react"

interface StatsCardsProps {
  personasCount: number
}

export function StatsCards({ personasCount }: StatsCardsProps) {
  return (
    <Card className="overflow-hidden border-2 transition-all hover:shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 bg-gradient-to-br from-primary/10 to-primary/5 pb-4">
        <CardTitle className="text-base font-semibold">Active Personas</CardTitle>
        <div className="rounded-full bg-primary/10 p-2">
          <Users className="h-5 w-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="text-4xl font-bold tracking-tight">{personasCount}</div>
        <p className="mt-2 text-sm text-muted-foreground"> personalities configured</p>
      </CardContent>
    </Card>
  )
}
