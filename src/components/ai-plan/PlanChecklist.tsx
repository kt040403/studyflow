'use client'

import { useState } from 'react'
import { Check, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { togglePlanItemComplete } from '@/app/(dashboard)/ai-plan/[id]/actions'
import type { AIPlanItem } from '@/types/database'
import { toast } from 'sonner'

interface PlanChecklistProps {
  items: AIPlanItem[]
  planId: string
}

export function PlanChecklist({ items: initialItems, planId }: PlanChecklistProps) {
  const [items, setItems] = useState(initialItems)
  const [loadingItems, setLoadingItems] = useState<Set<string>>(new Set())

  const completedCount = items.filter((item) => item.is_completed).length
  const progressPercent = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0

  const handleToggle = async (itemId: string, currentCompleted: boolean) => {
    setLoadingItems((prev) => new Set(prev).add(itemId))

    // 楽観的更新
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, is_completed: !currentCompleted }
          : item
      )
    )

    const result = await togglePlanItemComplete(itemId, !currentCompleted)

    if (result.error) {
      // 失敗したら元に戻す
      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? { ...item, is_completed: currentCompleted }
            : item
        )
      )
      toast.error('更新に失敗しました')
    }

    setLoadingItems((prev) => {
      const next = new Set(prev)
      next.delete(itemId)
      return next
    })
  }

  const formatMinutes = (minutes: number | null) => {
    if (!minutes) return null
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours === 0) return `${mins}分`
    if (mins === 0) return `${hours}時間`
    return `${hours}時間${mins}分`
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>学習計画チェックリスト</CardTitle>
          <Badge variant="secondary">
            {completedCount} / {items.length} 完了
          </Badge>
        </div>
        <div className="flex items-center gap-3 mt-2">
          <Progress value={progressPercent} className="flex-1" />
          <span className="text-sm font-medium w-12 text-right">{progressPercent}%</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className={`flex gap-4 rounded-lg border p-4 transition-colors ${
                item.is_completed
                  ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900'
                  : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
              }`}
            >
              <div className="pt-0.5">
                <Checkbox
                  checked={item.is_completed}
                  disabled={loadingItems.has(item.id)}
                  onCheckedChange={() => handleToggle(item.id, item.is_completed)}
                  className={item.is_completed ? 'bg-green-600 border-green-600' : ''}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h4
                    className={`font-medium ${
                      item.is_completed ? 'line-through text-muted-foreground' : ''
                    }`}
                  >
                    {item.title}
                  </h4>
                  {item.estimated_minutes && (
                    <Badge variant="outline" className="shrink-0">
                      <Clock className="mr-1 h-3 w-3" />
                      {formatMinutes(item.estimated_minutes)}
                    </Badge>
                  )}
                </div>
                {item.description && (
                  <p
                    className={`mt-1 text-sm ${
                      item.is_completed
                        ? 'text-muted-foreground'
                        : 'text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    {item.description}
                  </p>
                )}
                {item.is_completed && item.completed_at && (
                  <p className="mt-2 text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    完了済み
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
