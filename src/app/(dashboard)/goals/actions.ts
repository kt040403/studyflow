'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { GoalInsert, GoalUpdate, Profile } from '@/types/database'

export async function createGoal(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: '認証が必要です' }
  }

  // Freeプランの目標数制限チェック
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single() as { data: Pick<Profile, 'plan'> | null }

  if (profile?.plan === 'free') {
    const { count } = await supabase
      .from('goals')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .neq('status', 'archived') as { count: number | null }

    if (count && count >= 3) {
      return { error: 'Freeプランでは目標は3つまでです。Proプランにアップグレードしてください。' }
    }
  }

  const goal: GoalInsert = {
    user_id: user.id,
    title: formData.get('title') as string,
    description: formData.get('description') as string || null,
    category: formData.get('category') as 'programming' | 'language' | 'certification' | 'other',
    target_date: formData.get('target_date') as string || null,
    target_hours: formData.get('target_hours') ? parseInt(formData.get('target_hours') as string) : null,
    color: formData.get('color') as string || '#6366f1',
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from('goals').insert(goal)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/goals')
  revalidatePath('/dashboard')
  redirect('/goals')
}

export async function updateGoal(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: '認証が必要です' }
  }

  const goal: GoalUpdate = {
    title: formData.get('title') as string,
    description: formData.get('description') as string || null,
    category: formData.get('category') as 'programming' | 'language' | 'certification' | 'other',
    target_date: formData.get('target_date') as string || null,
    target_hours: formData.get('target_hours') ? parseInt(formData.get('target_hours') as string) : null,
    color: formData.get('color') as string,
    status: formData.get('status') as 'active' | 'completed' | 'paused' | 'archived',
    updated_at: new Date().toISOString(),
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('goals')
    .update(goal)
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/goals')
  revalidatePath('/dashboard')
  revalidatePath(`/goals/${id}`)
  redirect(`/goals/${id}`)
}

export async function deleteGoal(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: '認証が必要です' }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any

  // 関連するマイルストーンと学習ログも削除
  await sb.from('milestones').delete().eq('goal_id', id)
  await sb.from('study_logs').delete().eq('goal_id', id)

  const { error } = await sb
    .from('goals')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/goals')
  revalidatePath('/dashboard')
  redirect('/goals')
}

export async function updateGoalProgress(id: string, progress: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: '認証が必要です' }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('goals')
    .update({
      progress_percent: Math.min(100, Math.max(0, progress)),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/goals')
  revalidatePath('/dashboard')
  revalidatePath(`/goals/${id}`)
}
