'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface GoalComparisonProps {
  data: {
    id: string
    title: string
    color: string
    totalMinutes: number
    totalSessions: number
    targetHours: number | null
    progress: number
  }[]
}

export function GoalComparison({ data }: GoalComparisonProps) {
  const formatMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours === 0) return `${mins}分`
    if (mins === 0) return `${hours}時間`
    return `${hours}h${mins}m`
  }

  const chartData = data
    .filter((d) => d.totalMinutes > 0)
    .map((d) => ({
      ...d,
      hours: Math.round((d.totalMinutes / 60) * 10) / 10,
      shortTitle: d.title.length > 10 ? d.title.slice(0, 10) + '...' : d.title,
    }))
    .sort((a, b) => b.totalMinutes - a.totalMinutes)

  return (
    <Card>
      <CardHeader>
        <CardTitle>目標別学習時間</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            目標がありません
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            学習記録がありません
          </div>
        ) : (
          <div className="space-y-6">
            {/* グラフ */}
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}h`}
                  />
                  <YAxis
                    type="category"
                    dataKey="shortTitle"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    width={100}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload
                        return (
                          <div className="rounded-lg border bg-background p-3 shadow-md">
                            <p className="font-medium">{d.title}</p>
                            <p className="text-sm text-muted-foreground">
                              学習時間: {formatMinutes(d.totalMinutes)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              セッション数: {d.totalSessions}回
                            </p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar dataKey="hours" radius={[0, 4, 4, 0]} maxBarSize={30}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* 目標リスト */}
            <div className="space-y-4">
              {data.map((goal) => (
                <div key={goal.id} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: goal.color }}
                      />
                      <span className="font-medium">{goal.title}</span>
                    </div>
                    <span className="text-muted-foreground">
                      {formatMinutes(goal.totalMinutes)}
                      {goal.targetHours && ` / ${goal.targetHours}h`}
                    </span>
                  </div>
                  <Progress value={goal.progress} className="h-2" />
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
