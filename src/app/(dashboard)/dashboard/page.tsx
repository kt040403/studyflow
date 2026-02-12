import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'ダッシュボード',
}
import { SummaryCards } from '@/components/dashboard/SummaryCards'
import { GoalProgressCard } from '@/components/dashboard/GoalProgressCard'
import { WeeklyChart } from '@/components/dashboard/WeeklyChart'
import { StreakBadge } from '@/components/dashboard/StreakBadge'
import { startOfWeek, endOfWeek, subDays, format } from 'date-fns'
import type { Profile, Goal, StudyLog } from '@/types/database'

async function getDashboardData(userId: string) {
  const supabase = await createClient()
  const today = new Date()
  const todayStr = format(today, 'yyyy-MM-dd')
  const weekStart = startOfWeek(today, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 })

  // プロフィール取得
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single() as { data: Profile | null }

  // アクティブな目標取得
  const { data: goals } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('sort_order')
    .limit(5) as { data: Goal[] | null }

  // 今日の学習時間
  const { data: todayLogs } = await supabase
    .from('study_logs')
    .select('duration_minutes')
    .eq('user_id', userId)
    .eq('study_date', todayStr) as { data: Pick<StudyLog, 'duration_minutes'>[] | null }

  const todayMinutes = todayLogs?.reduce((sum, log) => sum + log.duration_minutes, 0) || 0

  // 週間学習時間
  const { data: weeklyLogs } = await supabase
    .from('study_logs')
    .select('duration_minutes, study_date')
    .eq('user_id', userId)
    .gte('study_date', format(weekStart, 'yyyy-MM-dd'))
    .lte('study_date', format(weekEnd, 'yyyy-MM-dd')) as { data: Pick<StudyLog, 'duration_minutes' | 'study_date'>[] | null }

  const weeklyMinutes = weeklyLogs?.reduce((sum, log) => sum + log.duration_minutes, 0) || 0

  // 週間チャートデータ
  const weekDays = ['月', '火', '水', '木', '金', '土', '日']
  const chartData = weekDays.map((day, index) => {
    const date = format(
      new Date(weekStart.getTime() + index * 24 * 60 * 60 * 1000),
      'yyyy-MM-dd'
    )
    const dayLogs = weeklyLogs?.filter((log) => log.study_date === date) || []
    const minutes = dayLogs.reduce((sum, log) => sum + log.duration_minutes, 0)
    return { day, minutes }
  })

  // 総学習時間
  const { data: totalLogs } = await supabase
    .from('study_logs')
    .select('duration_minutes')
    .eq('user_id', userId) as { data: Pick<StudyLog, 'duration_minutes'>[] | null }

  const totalMinutes = totalLogs?.reduce((sum, log) => sum + log.duration_minutes, 0) || 0
  const totalHours = Math.floor(totalMinutes / 60)

  // ストリーク計算
  let streak = 0
  let checkDate = today
  while (true) {
    const dateStr = format(checkDate, 'yyyy-MM-dd')
    const { data: dayLogs } = await supabase
      .from('study_logs')
      .select('id')
      .eq('user_id', userId)
      .eq('study_date', dateStr)
      .limit(1)

    if (dayLogs && dayLogs.length > 0) {
      streak++
      checkDate = subDays(checkDate, 1)
    } else if (format(checkDate, 'yyyy-MM-dd') === todayStr) {
      // 今日まだ記録がない場合は昨日からチェック
      checkDate = subDays(checkDate, 1)
    } else {
      break
    }

    // 無限ループ防止
    if (streak > 365) break
  }

  return {
    profile,
    goals: goals || [],
    todayMinutes,
    weeklyMinutes,
    weeklyGoalMinutes: 20 * 60, // 仮に週20時間目標
    totalHours,
    streak,
    chartData,
  }
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const data = await getDashboardData(user.id)

  return (
    <div className="space-y-6">
      <StreakBadge
        streak={data.streak}
        displayName={data.profile?.display_name || 'ユーザー'}
      />

      <SummaryCards
        todayMinutes={data.todayMinutes}
        weeklyMinutes={data.weeklyMinutes}
        weeklyGoalMinutes={data.weeklyGoalMinutes}
        totalHours={data.totalHours}
        streak={data.streak}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <GoalProgressCard goals={data.goals} />
        <WeeklyChart data={data.chartData} />
      </div>
    </div>
  )
}
