'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bot, Loader2 } from 'lucide-react'
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { Goal, Profile } from '@/types/database'
import { toast } from 'sonner'
import { format, addDays } from 'date-fns'

interface PlanGenerateFormProps {
  goals: Goal[]
  profile: Profile
}

const skillLevels = [
  { value: 'beginner', label: '初心者' },
  { value: 'beginner_intermediate', label: '初中級' },
  { value: 'intermediate', label: '中級' },
  { value: 'advanced', label: '上級' },
]

export function PlanGenerateForm({ goals, profile }: PlanGenerateFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedGoalId, setSelectedGoalId] = useState<string>('')

  const canUseAI = profile.plan !== 'free'
  const aiUsageRemaining = profile.plan === 'pro' ? 10 - profile.ai_usage_count : Infinity

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!canUseAI) {
      toast.error('AI機能はProプラン以上で利用できます')
      return
    }

    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      goalId: formData.get('goalId') as string,
      skillLevel: formData.get('skillLevel') as string,
      dailyHours: parseFloat(formData.get('dailyHours') as string),
      targetDate: formData.get('targetDate') as string,
      additionalNotes: formData.get('additionalNotes') as string,
    }

    try {
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || '計画の生成に失敗しました')
      }

      toast.success('学習計画を生成しました！')
      router.push(`/ai-plan/${result.plan.id}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '計画の生成に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  if (goals.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Bot className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">
            AI学習計画を生成するには、まず目標を作成してください
          </p>
          <Button asChild>
            <a href="/goals/new">目標を作成する</a>
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!canUseAI) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Bot className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">AI機能はProプラン以上で利用できます</h3>
          <p className="text-muted-foreground mb-4">
            AIがあなたに最適な学習計画を自動生成します
          </p>
          <Button asChild>
            <a href="/pricing">プランをアップグレード</a>
          </Button>
        </CardContent>
      </Card>
    )
  }

  const selectedGoal = goals.find((g) => g.id === selectedGoalId)
  const defaultTargetDate = selectedGoal?.target_date || format(addDays(new Date(), 30), 'yyyy-MM-dd')

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          AI学習計画を生成
        </CardTitle>
        <CardDescription>
          目標と学習条件を入力すると、AIが最適な学習計画を自動生成します
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="goalId">目標を選択</Label>
            <Select
              name="goalId"
              required
              value={selectedGoalId}
              onValueChange={setSelectedGoalId}
            >
              <SelectTrigger>
                <SelectValue placeholder="目標を選択してください" />
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
            <Label>現在のスキルレベル</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {skillLevels.map((level) => (
                <label
                  key={level.value}
                  className="flex items-center justify-center rounded-lg border p-3 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 has-[:checked]:border-indigo-600 has-[:checked]:bg-indigo-50 dark:has-[:checked]:bg-indigo-950"
                >
                  <input
                    type="radio"
                    name="skillLevel"
                    value={level.value}
                    defaultChecked={level.value === 'beginner_intermediate'}
                    className="sr-only"
                  />
                  <span className="text-sm font-medium">{level.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dailyHours">1日の学習可能時間</Label>
              <Select name="dailyHours" defaultValue="2">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.5">30分</SelectItem>
                  <SelectItem value="1">1時間</SelectItem>
                  <SelectItem value="1.5">1時間30分</SelectItem>
                  <SelectItem value="2">2時間</SelectItem>
                  <SelectItem value="3">3時間</SelectItem>
                  <SelectItem value="4">4時間</SelectItem>
                  <SelectItem value="5">5時間以上</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetDate">達成したい期限</Label>
              <Input
                id="targetDate"
                name="targetDate"
                type="date"
                defaultValue={defaultTargetDate}
                min={format(addDays(new Date(), 7), 'yyyy-MM-dd')}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="additionalNotes">追加の希望・コメント（任意）</Label>
            <Textarea
              id="additionalNotes"
              name="additionalNotes"
              placeholder="例: 実務で使うPHP8の機能を重点的に学びたい。テストコードも書けるようになりたい。"
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg bg-zinc-50 dark:bg-zinc-800 p-4">
            <div className="text-sm">
              <span className="text-muted-foreground">残り生成回数: </span>
              <span className="font-semibold">
                {profile.plan === 'pro_plus' ? '無制限' : `${aiUsageRemaining}/10`}
              </span>
              <span className="text-muted-foreground">（今月）</span>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isLoading || !selectedGoalId}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                AIで計画を生成中...
              </>
            ) : (
              <>
                <Bot className="mr-2 h-4 w-4" />
                AIで学習計画を生成する
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
