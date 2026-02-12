'use client'

import { Flame, Trophy, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface StudyStreakProps {
  data: {
    currentStreak: number
    longestStreak: number
    totalDays: number
  }
}

export function StudyStreak({ data }: StudyStreakProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          学習ストリーク
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Flame className="h-8 w-8 text-orange-500" />
              <span className="text-4xl font-bold">{data.currentStreak}</span>
            </div>
            <p className="text-sm text-muted-foreground">現在のストリーク</p>
            {data.currentStreak > 0 && (
              <p className="text-xs text-orange-500 mt-1">継続中!</p>
            )}
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Trophy className="h-8 w-8 text-amber-500" />
              <span className="text-4xl font-bold">{data.longestStreak}</span>
            </div>
            <p className="text-sm text-muted-foreground">最長ストリーク</p>
            {data.currentStreak === data.longestStreak && data.currentStreak > 0 && (
              <p className="text-xs text-amber-500 mt-1">自己ベスト!</p>
            )}
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Calendar className="h-8 w-8 text-indigo-500" />
              <span className="text-4xl font-bold">{data.totalDays}</span>
            </div>
            <p className="text-sm text-muted-foreground">総学習日数</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
