'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { StudyLogInsert, Goal, StudyLog } from '@/types/database'

export async function createStudyLog(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: '認証が必要です' }
  }

  const hours = parseInt(formData.get('hours') as string) || 0
  const minutes = parseInt(formData.get('minutes') as string) || 0
  const durationMinutes = hours * 60 + minutes

  if (durationMinutes <= 0) {
    return { error: '学習時間を入力してください' }
  }

  const log: StudyLogInsert = {
    user_id: user.id,
    goal_id: formData.get('goal_id') as string,
    duration_minutes: durationMinutes,
    study_date: formData.get('study_date') as string,
    note: formData.get('note') as string || null,
    mood: formData.get('mood') as 'great' | 'good' | 'neutral' | 'difficult' || null,
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any

  const { error } = await sb.from('study_logs').insert(log)

  if (error) {
    return { error: error.message }
  }

  // 目標の進捗を更新（目標時間がある場合）
  const { data: goal } = await supabase
    .from('goals')
    .select('target_hours')
    .eq('id', log.goal_id)
    .single() as { data: Pick<Goal, 'target_hours'> | null }

  if (goal?.target_hours) {
    const { data: totalLogs } = await supabase
      .from('study_logs')
      .select('duration_minutes')
      .eq('goal_id', log.goal_id) as { data: Pick<StudyLog, 'duration_minutes'>[] | null }

    const totalMinutes = totalLogs?.reduce((sum, l) => sum + l.duration_minutes, 0) || 0
    const totalHours = totalMinutes / 60
    const progress = Math.min(100, Math.round((totalHours / goal.target_hours) * 100))

    await sb
      .from('goals')
      .update({ progress_percent: progress, updated_at: new Date().toISOString() })
      .eq('id', log.goal_id)
  }

  revalidatePath('/log')
  revalidatePath('/dashboard')
  revalidatePath('/goals')
  revalidatePath(`/goals/${log.goal_id}`)

  return { success: true }
}

export async function deleteStudyLog(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: '認証が必要です' }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('study_logs')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/log')
  revalidatePath('/dashboard')

  return { success: true }
}
