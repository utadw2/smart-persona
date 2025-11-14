"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { format } from "date-fns"

interface AnalyticsData {
  date: string
  messages_sent: number
  messages_received: number
  ai_responses: number
  response_time_avg: number
}

interface AnalyticsChartsProps {
  data: AnalyticsData[]
}

export function AnalyticsCharts({ data }: AnalyticsChartsProps) {
  const chartData = data.map((item) => ({
    date: format(new Date(item.date), "MMM dd"),
    sent: item.messages_sent || 0,
    received: item.messages_received || 0,
    ai: item.ai_responses || 0,
  }))

  return (
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
                sent: {
                  label: "Sent",
                  color: "hsl(var(--chart-1))",
                },
                received: {
                  label: "Received",
                  color: "hsl(var(--chart-2))",
                },
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
                ai: {
                  label: "AI Responses",
                  color: "hsl(var(--chart-3))",
                },
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
  )
}
