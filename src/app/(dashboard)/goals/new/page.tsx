import { redirect } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { GoalForm } from '@/components/goals/GoalForm'
import { createGoal } from '../actions'
import { checkGoalLimit } from '@/hooks/usePlanLimits'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { Profile, Goal } from '@/types/database'

export default async function NewGoalPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // プロフィール取得
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single() as { data: Pick<Profile, 'plan'> | null }

  if (!profile) {
    redirect('/login')
  }

  // 現在の目標数取得
  const { count } = await supabase
    .from('goals')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id) as { count: number | null }

  const currentGoalCount = count || 0

  // プラン制限チェック
  const limitCheck = checkGoalLimit(profile.plan, currentGoalCount)

  if (!limitCheck.allowed) {
    return (
      <div className="mx-auto max-w-2xl">
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950">
          <CardContent className="py-8 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-amber-600 mb-4" />
            <h2 className="text-lg font-semibold mb-2">目標数の上限に達しました</h2>
            <p className="text-muted-foreground mb-4">
              {limitCheck.message}
            </p>
            <div className="flex justify-center gap-3">
              <Button variant="outline" asChild>
                <Link href="/goals">目標一覧に戻る</Link>
              </Button>
              <Button asChild>
                <Link href="/pricing">プランをアップグレード</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      <GoalForm action={createGoal} submitLabel="目標を作成" />
    </div>
  )
}
