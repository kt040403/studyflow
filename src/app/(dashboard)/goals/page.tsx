'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GoalCard } from '@/components/goals/GoalCard'
import { createClient } from '@/lib/supabase/client'
import { deleteGoal } from './actions'
import type { Goal } from '@/types/database'
import { toast } from 'sonner'

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchGoals() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('sort_order') as { data: Goal[] | null }

      setGoals(data || [])
      setIsLoading(false)
    }
    fetchGoals()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('この目標を削除しますか？関連する学習記録も削除されます。')) return

    const result = await deleteGoal(id)
    if (result?.error) {
      toast.error(result.error)
    } else {
      setGoals((prev) => prev.filter((g) => g.id !== id))
      toast.success('目標を削除しました')
    }
  }

  const handleStatusChange = async (id: string, status: Goal['status']) => {
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('goals')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      toast.error('ステータスの更新に失敗しました')
    } else {
      setGoals((prev) =>
        prev.map((g) => (g.id === id ? { ...g, status } : g))
      )
      toast.success('ステータスを更新しました')
    }
  }

  const activeGoals = goals.filter((g) => g.status === 'active')
  const completedGoals = goals.filter((g) => g.status === 'completed')
  const pausedGoals = goals.filter((g) => g.status === 'paused')

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">目標</h1>
        <Button asChild>
          <Link href="/goals/new">
            <Plus className="mr-2 h-4 w-4" />
            新しい目標
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">
            進行中 ({activeGoals.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            完了 ({completedGoals.length})
          </TabsTrigger>
          <TabsTrigger value="paused">
            一時停止 ({pausedGoals.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          {activeGoals.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="text-muted-foreground">進行中の目標がありません</p>
              <Button asChild className="mt-4">
                <Link href="/goals/new">目標を作成する</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {activeGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onDelete={handleDelete}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          {completedGoals.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="text-muted-foreground">完了した目標がありません</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {completedGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onDelete={handleDelete}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="paused" className="mt-6">
          {pausedGoals.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="text-muted-foreground">一時停止中の目標がありません</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {pausedGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onDelete={handleDelete}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
