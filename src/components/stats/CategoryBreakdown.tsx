'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface CategoryBreakdownProps {
  data: {
    category: string
    color: string
    minutes: number
    sessions: number
  }[]
}

export function CategoryBreakdown({ data }: CategoryBreakdownProps) {
  const formatMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours === 0) return `${mins}分`
    if (mins === 0) return `${hours}時間`
    return `${hours}h${mins}m`
  }

  const totalMinutes = data.reduce((sum, d) => sum + d.minutes, 0)

  const chartData = data.map((d) => ({
    ...d,
    percent: totalMinutes > 0 ? Math.round((d.minutes / totalMinutes) * 100) : 0,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>カテゴリ別分析</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            データがありません
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {/* 円グラフ */}
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="minutes"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload
                        return (
                          <div className="rounded-lg border bg-background p-3 shadow-md">
                            <p className="font-medium">{d.category}</p>
                            <p className="text-sm text-muted-foreground">
                              学習時間: {formatMinutes(d.minutes)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              セッション数: {d.sessions}回
                            </p>
                            <p className="text-sm text-muted-foreground">
                              割合: {d.percent}%
                            </p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* カテゴリリスト */}
            <div className="flex flex-col justify-center space-y-4">
              {chartData.map((item) => (
                <div key={item.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-4 w-4 rounded"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-medium">{item.category}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatMinutes(item.minutes)}</p>
                    <p className="text-xs text-muted-foreground">{item.percent}%</p>
                  </div>
                </div>
              ))}

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-muted-foreground">合計</span>
                  <p className="font-bold">{formatMinutes(totalMinutes)}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
