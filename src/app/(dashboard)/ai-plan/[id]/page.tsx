import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Target, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PlanChecklist } from '@/components/ai-plan/PlanChecklist'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import type { AIPlan, AIPlanItem, Goal } from '@/types/database'

export default async function PlanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return notFound()

  // プラン取得
  const { data: plan } = await supabase
    .from('ai_plans')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single() as { data: AIPlan | null }

  if (!plan) return notFound()

  // プランアイテム取得
  const { data: items } = await supabase
    .from('ai_plan_items')
    .select('*')
    .eq('plan_id', id)
    .order('day_number') as { data: AIPlanItem[] | null }

  // 関連する目標取得
  const { data: goal } = await supabase
    .from('goals')
    .select('id, title, color')
    .eq('id', plan.goal_id)
    .single() as { data: Pick<Goal, 'id' | 'title' | 'color'> | null }

  const completedCount = items?.filter((item) => item.is_completed).length || 0
  const totalMinutes = items?.reduce((sum, item) => sum + (item.estimated_minutes || 0), 0) || 0
  const totalHours = Math.floor(totalMinutes / 60)
  const remainingMinutes = totalMinutes % 60

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/ai-plan">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{plan.title}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            {goal && (
              <Link
                href={`/goals/${goal.id}`}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              >
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: goal.color }}
                />
                {goal.title}
              </Link>
            )}
            {!plan.is_active && (
              <Badge variant="secondary">非アクティブ</Badge>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-950">
                <Calendar className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">総日数</p>
                <p className="text-xl font-bold">{plan.total_days}日</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-950">
                <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">進捗</p>
                <p className="text-xl font-bold">
                  {completedCount} / {items?.length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-950">
                <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">総学習時間</p>
                <p className="text-xl font-bold">
                  {totalHours > 0 ? `${totalHours}h` : ''}{remainingMinutes > 0 ? `${remainingMinutes}m` : ''}
                  {totalMinutes === 0 && '-'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {items && items.length > 0 ? (
        <PlanChecklist items={items} planId={id} />
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">学習アイテムがありません</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">計画情報</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>作成日: {format(new Date(plan.created_at), 'yyyy年MM月dd日 HH:mm', { locale: ja })}</p>
        </CardContent>
      </Card>
    </div>
  )
}
