import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Plus } from "lucide-react"

interface Persona {
  id: string
  name: string
  description: string
  tone: string
  is_active: boolean
}

interface ActivePersonasProps {
  personas: Persona[]
}

export function ActivePersonas({ personas }: ActivePersonasProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Active Personas</CardTitle>
            <CardDescription>Your AI personalities</CardDescription>
          </div>
          <Button asChild size="sm">
            <Link href="/dashboard/personas/new">
              <Plus className="mr-2 h-4 w-4" />
              New
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {personas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="mb-4 text-sm text-muted-foreground">No personas yet. Create your first AI personality.</p>
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/personas/new">Create Persona</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {personas.slice(0, 5).map((persona) => (
              <div key={persona.id} className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{persona.name}</h4>
                    {persona.is_active && (
                      <Badge variant="secondary" className="text-xs">
                        Active
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{persona.description}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Tone: {persona.tone}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
