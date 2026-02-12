import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Edit, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import type { Goal, Milestone, StudyLog } from '@/types/database'

const categoryLabels: Record<string, string> = {
  programming: 'プログラミング',
  language: '語学',
  certification: '資格',
  other: 'その他',
}

const statusLabels: Record<string, string> = {
  active: '進行中',
  completed: '完了',
  paused: '一時停止',
  archived: 'アーカイブ',
}

export default async function GoalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return notFound()

  const { data: goal } = await supabase
    .from('goals')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single() as { data: Goal | null }

  if (!goal) return notFound()

  // マイルストーン取得
  const { data: milestones } = await supabase
    .from('milestones')
    .select('*')
    .eq('goal_id', id)
    .order('sort_order') as { data: Milestone[] | null }

  // 学習ログ取得（最新10件）
  const { data: studyLogs } = await supabase
    .from('study_logs')
    .select('*')
    .eq('goal_id', id)
    .order('study_date', { ascending: false })
    .limit(10) as { data: StudyLog[] | null }

  // 総学習時間計算
  const { data: allLogs } = await supabase
    .from('study_logs')
    .select('duration_minutes')
    .eq('goal_id', id) as { data: Pick<StudyLog, 'duration_minutes'>[] | null }

  const totalMinutes = allLogs?.reduce((sum, log) => sum + log.duration_minutes, 0) || 0
  const totalHours = Math.floor(totalMinutes / 60)
  const remainingMinutes = totalMinutes % 60

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/goals">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div
              className="h-4 w-4 rounded-full"
              style={{ backgroundColor: goal.color }}
            />
            <h1 className="text-2xl font-bold">{goal.title}</h1>
          </div>
          <div className="mt-1 flex gap-2">
            <Badge variant="secondary">{categoryLabels[goal.category]}</Badge>
            <Badge variant="outline">{statusLabels[goal.status]}</Badge>
          </div>
        </div>
        <Button asChild>
          <Link href={`/goals/${id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            編集
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>進捗</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl font-bold">{goal.progress_percent}%</span>
                {goal.target_hours && (
                  <span className="text-muted-foreground">
                    {totalHours}h / {goal.target_hours}h 目標
                  </span>
                )}
              </div>
              <Progress value={goal.progress_percent} className="h-3" />
            </CardContent>
          </Card>

          {goal.description && (
            <Card>
              <CardHeader>
                <CardTitle>詳細</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{goal.description}</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>マイルストーン</CardTitle>
              <Button size="sm" variant="outline">追加</Button>
            </CardHeader>
            <CardContent>
              {milestones && milestones.length > 0 ? (
                <ul className="space-y-3">
                  {milestones.map((milestone) => (
                    <li
                      key={milestone.id}
                      className="flex items-center gap-3 rounded-lg border p-3"
                    >
                      <input
                        type="checkbox"
                        checked={milestone.is_completed}
                        className="h-4 w-4 rounded border-zinc-300"
                        readOnly
                      />
                      <span className={milestone.is_completed ? 'line-through text-muted-foreground' : ''}>
                        {milestone.title}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  マイルストーンがありません
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>概要</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">総学習時間</p>
                <p className="text-xl font-semibold">
                  {totalHours}時間{remainingMinutes > 0 ? `${remainingMinutes}分` : ''}
                </p>
              </div>
              {goal.target_date && (
                <div>
                  <p className="text-sm text-muted-foreground">目標期限</p>
                  <p className="text-xl font-semibold">
                    {format(new Date(goal.target_date), 'yyyy年MM月dd日', { locale: ja })}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">作成日</p>
                <p className="font-medium">
                  {format(new Date(goal.created_at), 'yyyy年MM月dd日', { locale: ja })}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>最近の学習</CardTitle>
            </CardHeader>
            <CardContent>
              {studyLogs && studyLogs.length > 0 ? (
                <ul className="space-y-3">
                  {studyLogs.map((log) => (
                    <li key={log.id} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {format(new Date(log.study_date), 'MM/dd', { locale: ja })}
                      </span>
                      <span className="font-medium">
                        {Math.floor(log.duration_minutes / 60) > 0 && `${Math.floor(log.duration_minutes / 60)}h `}
                        {log.duration_minutes % 60}m
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  学習記録がありません
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
