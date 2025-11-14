"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { format } from "date-fns"
import { MessageSquare, Bot, Briefcase, Eye } from "lucide-react"
import type { Analytics, Persona, Message, JobMatch } from "@/lib/types"

interface UserAnalyticsDashboardProps {
  analytics: Analytics[]
  personas: Persona[]
  messages: Message[]
  jobMatches: JobMatch[]
}

export function UserAnalyticsDashboard({ analytics, personas, messages, jobMatches }: UserAnalyticsDashboardProps) {
  // Calculate stats
  const totalMessages = messages.length
  const totalAIResponses = messages.filter((m) => m.ai_generated).length
  const totalPersonas = personas.length
  const totalJobMatches = jobMatches.length
  const totalPersonaViews = personas.reduce((sum, p) => sum + (p.views_count || 0), 0)

  // Prepare chart data
  const chartData = analytics.map((item) => ({
    date: format(new Date(item.date), "MMM dd"),
    sent: item.messages_sent || 0,
    received: item.messages_received || 0,
    ai: item.ai_responses || 0,
  }))

  // Persona performance data
  const personaData = personas.map((p) => ({
    name: p.name,
    views: p.views_count || 0,
    messages: messages.filter((m) => m.persona_id === p.id).length,
  }))

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMessages}</div>
            <p className="text-xs text-muted-foreground">Across all channels</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">AI Responses</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAIResponses}</div>
            <p className="text-xs text-muted-foreground">
              {totalMessages > 0 ? Math.round((totalAIResponses / totalMessages) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Job Matches</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalJobMatches}</div>
            <p className="text-xs text-muted-foreground">Based on your personas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Persona Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPersonaViews}</div>
            <p className="text-xs text-muted-foreground">Community engagement</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Message Activity</CardTitle>
            <CardDescription>Your messaging trends over time</CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ChartContainer
                config={{
                  sent: { label: "Sent", color: "hsl(var(--chart-1))" },
                  received: { label: "Received", color: "hsl(var(--chart-2))" },
                }}
                className="h-[300px]"
              >
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="sent"
                    stackId="1"
                    stroke="hsl(var(--chart-1))"
                    fill="hsl(var(--chart-1))"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="received"
                    stackId="2"
                    stroke="hsl(var(--chart-2))"
                    fill="hsl(var(--chart-2))"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ChartContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Response Rate</CardTitle>
            <CardDescription>AI-generated messages by day</CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ChartContainer
                config={{
                  ai: { label: "AI Responses", color: "hsl(var(--chart-3))" },
                }}
                className="h-[300px]"
              >
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="ai" stroke="hsl(var(--chart-3))" strokeWidth={2} />
                </LineChart>
              </ChartContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Persona Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Persona Performance</CardTitle>
          <CardDescription>Views and messages per persona</CardDescription>
        </CardHeader>
        <CardContent>
          {personaData.length > 0 ? (
            <ChartContainer
              config={{
                views: { label: "Views", color: "hsl(var(--chart-4))" },
                messages: { label: "Messages", color: "hsl(var(--chart-5))" },
              }}
              className="h-[300px]"
            >
              <BarChart data={personaData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="views" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="messages" fill="hsl(var(--chart-5))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          ) : (
            <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
              Create personas to see performance data
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
