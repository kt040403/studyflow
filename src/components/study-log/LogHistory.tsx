'use client'

import { Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { deleteStudyLog } from '@/app/(dashboard)/log/actions'
import type { StudyLog, Goal } from '@/types/database'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { toast } from 'sonner'

interface LogHistoryProps {
  logs: (StudyLog & { goals: Goal | null })[]
  onDelete?: (id: string) => void
}

const moodEmojis: Record<string, string> = {
  great: '🔥',
  good: '😊',
  neutral: '😐',
  difficult: '😓',
}

export function LogHistory({ logs, onDelete }: LogHistoryProps) {
  const handleDelete = async (id: string) => {
    if (!confirm('この記録を削除しますか？')) return

    const result = await deleteStudyLog(id)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('記録を削除しました')
      onDelete?.(id)
    }
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours === 0) return `${mins}分`
    if (mins === 0) return `${hours}時間`
    return `${hours}時間${mins}分`
  }

  if (logs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>学習履歴</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-4">
            まだ学習記録がありません
          </p>
        </CardContent>
      </Card>
    )
  }

  // 日付でグループ化
  const groupedLogs = logs.reduce((groups, log) => {
    const date = log.study_date
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(log)
    return groups
  }, {} as Record<string, typeof logs>)

  return (
    <Card>
      <CardHeader>
        <CardTitle>学習履歴</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(groupedLogs).map(([date, dateLogs]) => (
          <div key={date}>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              {format(new Date(date), 'yyyy年MM月dd日（E）', { locale: ja })}
            </h3>
            <div className="space-y-3">
              {dateLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 rounded-lg border p-4"
                >
                  {log.goals && (
                    <div
                      className="mt-1 h-3 w-3 rounded-full shrink-0"
                      style={{ backgroundColor: log.goals.color }}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {log.goals?.title || '削除された目標'}
                      </span>
                      {log.mood && (
                        <span className="text-lg">{moodEmojis[log.mood]}</span>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge variant="secondary">
                        {formatDuration(log.duration_minutes)}
                      </Badge>
                    </div>
                    {log.note && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        {log.note}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-red-600"
                    onClick={() => handleDelete(log.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
