import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, AlertCircle } from "lucide-react"

export function SystemHealth() {
  const services = [
    { name: "Database", status: "operational", uptime: "99.9%" },
    { name: "AI Service", status: "operational", uptime: "99.7%" },
    { name: "Message Queue", status: "operational", uptime: "99.8%" },
    { name: "API Gateway", status: "operational", uptime: "99.9%" },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Health</CardTitle>
        <CardDescription>Service status overview</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {services.map((service) => (
            <div key={service.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {service.status === "operational" ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                )}
                <span className="text-sm font-medium">{service.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{service.uptime}</span>
                <Badge variant={service.status === "operational" ? "secondary" : "outline"} className="text-xs">
                  {service.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
