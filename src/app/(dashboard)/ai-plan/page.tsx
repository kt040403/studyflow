import Link from 'next/link'
import { Bot, Plus, Calendar, Target, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import type { AIPlan, AIPlanItem, Goal } from '@/types/database'

interface PlanWithDetails extends AIPlan {
  items: AIPlanItem[]
  goal: Pick<Goal, 'id' | 'title' | 'color'> | null
}

export default async function AIPlanPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // プラン一覧取得（アイテム数も含む）
  const { data: plans } = await supabase
    .from('ai_plans')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false }) as { data: AIPlan[] | null }

  // 各プランのアイテムと目標を取得
  const plansWithDetails: PlanWithDetails[] = []

  if (plans) {
    for (const plan of plans) {
      const { data: items } = await supabase
        .from('ai_plan_items')
        .select('*')
        .eq('plan_id', plan.id)
        .order('day_number') as { data: AIPlanItem[] | null }

      const { data: goal } = await supabase
        .from('goals')
        .select('id, title, color')
        .eq('id', plan.goal_id)
        .single() as { data: Pick<Goal, 'id' | 'title' | 'color'> | null }

      plansWithDetails.push({
        ...plan,
        items: items || [],
        goal,
      })
    }
  }

  const activePlans = plansWithDetails.filter((p) => p.is_active)
  const inactivePlans = plansWithDetails.filter((p) => !p.is_active)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">AI学習計画</h1>
          <p className="text-muted-foreground mt-1">
            AIが生成した学習計画を管理します
          </p>
        </div>
        <Button asChild>
          <Link href="/ai-plan/generate">
            <Plus className="mr-2 h-4 w-4" />
            新しい計画を生成
          </Link>
        </Button>
      </div>

      {plansWithDetails.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Bot className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">学習計画がありません</h3>
            <p className="text-muted-foreground mb-4">
              AIがあなたの目標に合わせた最適な学習計画を自動生成します
            </p>
            <Button asChild>
              <Link href="/ai-plan/generate">
                <Bot className="mr-2 h-4 w-4" />
                AI学習計画を生成する
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {activePlans.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">アクティブな計画</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {activePlans.map((plan) => (
                  <PlanCard key={plan.id} plan={plan} />
                ))}
              </div>
            </div>
          )}

          {inactivePlans.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-muted-foreground">
                完了・非アクティブな計画
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {inactivePlans.map((plan) => (
                  <PlanCard key={plan.id} plan={plan} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function PlanCard({ plan }: { plan: PlanWithDetails }) {
  const completedCount = plan.items.filter((item) => item.is_completed).length
  const totalItems = plan.items.length
  const progressPercent = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0

  const totalMinutes = plan.items.reduce((sum, item) => sum + (item.estimated_minutes || 0), 0)
  const totalHours = Math.floor(totalMinutes / 60)
  const remainingMinutes = totalMinutes % 60

  return (
    <Link href={`/ai-plan/${plan.id}`}>
      <Card className={`h-full transition-colors hover:border-indigo-300 dark:hover:border-indigo-700 ${
        !plan.is_active ? 'opacity-60' : ''
      }`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base line-clamp-2">{plan.title}</CardTitle>
            {!plan.is_active && (
              <Badge variant="secondary" className="shrink-0">完了</Badge>
            )}
          </div>
          {plan.goal && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: plan.goal.color }}
              />
              {plan.goal.title}
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">進捗</span>
              <span className="font-medium">{completedCount} / {totalItems}</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{plan.total_days}日間</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                {totalHours > 0 ? `${totalHours}h` : ''}
                {remainingMinutes > 0 ? `${remainingMinutes}m` : ''}
                {totalMinutes === 0 && '-'}
              </span>
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            作成: {format(new Date(plan.created_at), 'yyyy/MM/dd', { locale: ja })}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
