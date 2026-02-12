import { createClient } from '@/lib/supabase/server'
import { PlanGenerateForm } from '@/components/ai-plan/PlanGenerateForm'
import type { Goal, Profile } from '@/types/database'

export default async function GeneratePlanPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // プロフィール取得
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single() as { data: Profile | null }

  if (!profile) return null

  // アクティブな目標取得
  const { data: goals } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('sort_order') as { data: Goal[] | null }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">AI学習計画生成</h1>
        <p className="text-muted-foreground mt-1">
          AIがあなたの目標に合わせた最適な学習計画を作成します
        </p>
      </div>

      <PlanGenerateForm goals={goals || []} profile={profile} />
    </div>
  )
}
