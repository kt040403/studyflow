'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface WeeklyChartProps {
  data: {
    week: string
    minutes: number
    days: number
  }[]
}

export function WeeklyChart({ data }: WeeklyChartProps) {
  const formatMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours === 0) return `${mins}分`
    if (mins === 0) return `${hours}時間`
    return `${hours}h${mins}m`
  }

  const chartData = data.map((d) => ({
    ...d,
    hours: Math.round((d.minutes / 60) * 10) / 10,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>週別学習時間</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 || data.every((d) => d.minutes === 0) ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            データがありません
          </div>
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="week"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}h`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="rounded-lg border bg-background p-3 shadow-md">
                          <p className="font-medium">{data.week}週</p>
                          <p className="text-sm text-muted-foreground">
                            学習時間: {formatMinutes(data.minutes)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            学習日数: {data.days}日
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar
                  dataKey="hours"
                  fill="#6366f1"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={50}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
