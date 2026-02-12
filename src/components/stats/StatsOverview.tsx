'use client'

import { Clock, Calendar, TrendingUp, Target } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface StatsOverviewProps {
  data: {
    totalMinutes: number
    totalSessions: number
    thisWeekMinutes: number
    thisMonthMinutes: number
    avgMinutesPerDay: number
  }
}

export function StatsOverview({ data }: StatsOverviewProps) {
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours === 0) return `${mins}分`
    if (mins === 0) return `${hours}時間`
    return `${hours}時間${mins}分`
  }

  const stats = [
    {
      label: '今週の学習',
      value: formatTime(data.thisWeekMinutes),
      icon: Calendar,
      color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400',
    },
    {
      label: '今月の学習',
      value: formatTime(data.thisMonthMinutes),
      icon: TrendingUp,
      color: 'bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400',
    },
    {
      label: '1日平均',
      value: formatTime(data.avgMinutesPerDay),
      icon: Clock,
      color: 'bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400',
    },
    {
      label: '総セッション数',
      value: `${data.totalSessions}回`,
      icon: Target,
      color: 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400',
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-xl font-bold">{stat.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
