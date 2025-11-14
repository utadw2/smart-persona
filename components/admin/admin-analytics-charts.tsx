"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  Cell,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts"
import { format } from "date-fns"
import type { Analytics, Profile, Persona, Message } from "@/lib/types"

interface AdminAnalyticsChartsProps {
  data: Analytics[]
  users: Profile[]
  personas: Persona[]
  messages: Message[]
}

export function AdminAnalyticsCharts({ data, users, personas, messages }: AdminAnalyticsChartsProps) {
  const chartData = data.map((item) => ({
    date: format(new Date(item.date), "MMM dd"),
    sent: item.messages_sent || 0,
    received: item.messages_received || 0,
    ai: item.ai_responses || 0,
  }))

  // User growth data
  const userGrowthData = users.slice(-30).map((user, index) => ({
    date: format(new Date(user.created_at), "MMM dd"),
    users: index + 1,
  }))

  // Persona visibility distribution
  const personaVisibilityData = [
    { name: "Published", value: personas.filter((p) => p.visibility === "published").length },
    { name: "Private", value: personas.filter((p) => p.visibility === "private").length },
  ]

  const COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ]

  return (
    <div className="grid gap-6">
      {/* Original charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Message Activity</CardTitle>
            <CardDescription>Sent vs Received messages over time</CardDescription>
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
            <CardTitle>AI Response Activity</CardTitle>
            <CardDescription>AI-generated responses per day</CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ChartContainer
                config={{
                  ai: { label: "AI Responses", color: "hsl(var(--chart-3))" },
                }}
                className="h-[300px]"
              >
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="ai" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* New analytics charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
            <CardDescription>Total registered users over time</CardDescription>
          </CardHeader>
          <CardContent>
            {userGrowthData.length > 0 ? (
              <ChartContainer
                config={{
                  users: { label: "Users", color: "hsl(var(--chart-4))" },
                }}
                className="h-[300px]"
              >
                <LineChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="users" stroke="hsl(var(--chart-4))" strokeWidth={2} />
                </LineChart>
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
            <CardTitle>Persona Visibility</CardTitle>
            <CardDescription>Distribution of published vs private personas</CardDescription>
          </CardHeader>
          <CardContent>
            {personaVisibilityData.some((d) => d.value > 0) ? (
              <ChartContainer
                config={{
                  published: { label: "Published", color: "hsl(var(--chart-1))" },
                  private: { label: "Private", color: "hsl(var(--chart-2))" },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={personaVisibilityData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {personaVisibilityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
                No personas created yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
