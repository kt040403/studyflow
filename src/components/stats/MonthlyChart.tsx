'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface MonthlyChartProps {
  data: {
    month: string
    minutes: number
    days: number
  }[]
}

export function MonthlyChart({ data }: MonthlyChartProps) {
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
        <CardTitle>月別学習推移</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 || data.every((d) => d.minutes === 0) ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            データがありません
          </div>
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="month"
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
                          <p className="font-medium">{data.month}</p>
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
                <Area
                  type="monotone"
                  dataKey="hours"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorHours)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
