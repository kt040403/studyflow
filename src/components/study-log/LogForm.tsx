'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createStudyLog } from '@/app/(dashboard)/log/actions'
import type { Goal } from '@/types/database'
import { format } from 'date-fns'
import { toast } from 'sonner'

interface LogFormProps {
  goals: Goal[]
}

const moods = [
  { value: 'great', label: '絶好調', emoji: '🔥' },
  { value: 'good', label: '良い', emoji: '😊' },
  { value: 'neutral', label: '普通', emoji: '😐' },
  { value: 'difficult', label: '難しかった', emoji: '😓' },
]

export function LogForm({ goals }: LogFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedMood, setSelectedMood] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    if (selectedMood) {
      formData.set('mood', selectedMood)
    }
    const result = await createStudyLog(formData)
    setIsLoading(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('学習記録を追加しました！')
      // フォームをリセット
      const form = document.getElementById('log-form') as HTMLFormElement
      form?.reset()
      setSelectedMood(null)
    }
  }

  if (goals.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">まず目標を作成してください</p>
          <Button asChild className="mt-4">
            <a href="/goals/new">目標を作成する</a>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>学習を記録する</CardTitle>
      </CardHeader>
      <CardContent>
        <form id="log-form" action={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="goal_id">目標</Label>
            <Select name="goal_id" required>
              <SelectTrigger>
                <SelectValue placeholder="目標を選択" />
              </SelectTrigger>
              <SelectContent>
                {goals.map((goal) => (
                  <SelectItem key={goal.id} value={goal.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: goal.color }}
                      />
                      {goal.title}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>学習時間</Label>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Input
                    name="hours"
                    type="number"
                    min={0}
                    max={24}
                    defaultValue={0}
                    className="w-20"
                  />
                  <span className="text-sm text-muted-foreground">時間</span>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Input
                    name="minutes"
                    type="number"
                    min={0}
                    max={59}
                    defaultValue={30}
                    className="w-20"
                  />
                  <span className="text-sm text-muted-foreground">分</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="study_date">学習日</Label>
            <Input
              id="study_date"
              name="study_date"
              type="date"
              defaultValue={format(new Date(), 'yyyy-MM-dd')}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>今日の調子</Label>
            <div className="flex gap-2">
              {moods.map((mood) => (
                <button
                  key={mood.value}
                  type="button"
                  onClick={() => setSelectedMood(mood.value)}
                  className={`flex flex-col items-center gap-1 rounded-lg border p-3 transition-colors ${
                    selectedMood === mood.value
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950'
                      : 'hover:bg-zinc-50 dark:hover:bg-zinc-800'
                  }`}
                >
                  <span className="text-2xl">{mood.emoji}</span>
                  <span className="text-xs">{mood.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">メモ（任意）</Label>
            <Textarea
              id="note"
              name="note"
              placeholder="今日学んだこと、気づいたことなど"
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? '記録中...' : '学習を記録する'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
