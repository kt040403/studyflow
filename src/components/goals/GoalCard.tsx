'use client'

import Link from 'next/link'
import { MoreVertical, Trash2, Edit, Pause, Play, CheckCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Goal } from '@/types/database'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

interface GoalCardProps {
  goal: Goal
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: Goal['status']) => void
}

const categoryLabels: Record<string, string> = {
  programming: 'プログラミング',
  language: '語学',
  certification: '資格',
  other: 'その他',
}

const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  active: { label: '進行中', variant: 'default' },
  completed: { label: '完了', variant: 'secondary' },
  paused: { label: '一時停止', variant: 'outline' },
  archived: { label: 'アーカイブ', variant: 'destructive' },
}

export function GoalCard({ goal, onDelete, onStatusChange }: GoalCardProps) {
  const status = statusLabels[goal.status] || statusLabels.active

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="h-4 w-4 rounded-full"
              style={{ backgroundColor: goal.color }}
            />
            <Link
              href={`/goals/${goal.id}`}
              className="text-lg font-semibold hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              {goal.title}
            </Link>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/goals/${goal.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  編集
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {goal.status === 'active' && (
                <DropdownMenuItem onClick={() => onStatusChange(goal.id, 'paused')}>
                  <Pause className="mr-2 h-4 w-4" />
                  一時停止
                </DropdownMenuItem>
              )}
              {goal.status === 'paused' && (
                <DropdownMenuItem onClick={() => onStatusChange(goal.id, 'active')}>
                  <Play className="mr-2 h-4 w-4" />
                  再開
                </DropdownMenuItem>
              )}
              {goal.status !== 'completed' && (
                <DropdownMenuItem onClick={() => onStatusChange(goal.id, 'completed')}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  完了にする
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 dark:text-red-400"
                onClick={() => onDelete(goal.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                削除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {goal.description && (
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
            {goal.description}
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant="secondary">{categoryLabels[goal.category]}</Badge>
          <Badge variant={status.variant}>{status.label}</Badge>
          {goal.target_date && (
            <Badge variant="outline">
              期限: {format(new Date(goal.target_date), 'yyyy/MM/dd', { locale: ja })}
            </Badge>
          )}
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-muted-foreground">進捗</span>
            <span className="font-medium">{goal.progress_percent}%</span>
          </div>
          <Progress value={goal.progress_percent} />
        </div>
      </CardContent>
    </Card>
  )
}
