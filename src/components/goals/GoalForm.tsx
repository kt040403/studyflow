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
import type { Goal } from '@/types/database'

const categories = [
  { value: 'programming', label: 'プログラミング' },
  { value: 'language', label: '語学' },
  { value: 'certification', label: '資格' },
  { value: 'other', label: 'その他' },
]

const colors = [
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#f43f5e', // rose
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#06b6d4', // cyan
]

interface GoalFormProps {
  goal?: Goal
  action: (formData: FormData) => Promise<{ error?: string } | void>
  submitLabel: string
}

export function GoalForm({ goal, action, submitLabel }: GoalFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedColor, setSelectedColor] = useState(goal?.color || colors[0])

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError(null)
    formData.set('color', selectedColor)
    const result = await action(formData)
    if (result?.error) {
      setError(result.error)
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{goal ? '目標を編集' : '新しい目標を作成'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">目標タイトル</Label>
            <Input
              id="title"
              name="title"
              placeholder="例: PHP中級マスター"
              defaultValue={goal?.title}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">詳細説明（任意）</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="目標の詳細や動機を記入してください"
              defaultValue={goal?.description || ''}
              rows={3}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category">カテゴリ</Label>
              <Select name="category" defaultValue={goal?.category || 'programming'}>
                <SelectTrigger>
                  <SelectValue placeholder="カテゴリを選択" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="target_hours">目標学習時間（時間）</Label>
              <Input
                id="target_hours"
                name="target_hours"
                type="number"
                placeholder="例: 100"
                defaultValue={goal?.target_hours || ''}
                min={1}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="target_date">目標達成期限（任意）</Label>
            <Input
              id="target_date"
              name="target_date"
              type="date"
              defaultValue={goal?.target_date || ''}
            />
          </div>

          <div className="space-y-2">
            <Label>テーマカラー</Label>
            <div className="flex gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`h-8 w-8 rounded-full transition-transform ${
                    selectedColor === color ? 'ring-2 ring-offset-2 ring-zinc-900 dark:ring-white scale-110' : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {goal && (
            <div className="space-y-2">
              <Label htmlFor="status">ステータス</Label>
              <Select name="status" defaultValue={goal.status}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">進行中</SelectItem>
                  <SelectItem value="completed">完了</SelectItem>
                  <SelectItem value="paused">一時停止</SelectItem>
                  <SelectItem value="archived">アーカイブ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex gap-3">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? '保存中...' : submitLabel}
            </Button>
            <Button type="button" variant="outline" onClick={() => history.back()}>
              キャンセル
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
