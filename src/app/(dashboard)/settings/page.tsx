import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PlanManagement } from '@/components/settings/PlanManagement'
import { ProfileForm } from '@/components/settings/ProfileForm'
import type { Profile } from '@/types/database'
import Link from 'next/link'

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>
}) {
  const { success } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  let { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single() as { data: Profile | null }

  // プロフィールがない場合はadminクライアントで作成（RLSバイパス）
  if (!profile) {
    try {
      const adminClient = createAdminClient()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: newProfile, error } = await (adminClient as any)
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email || '',
          display_name: user.email?.split('@')[0] || 'User',
        })
        .select('*')
        .single()

      if (error) {
        console.error('Failed to create profile with admin client:', error)
      } else {
        profile = newProfile as Profile
      }
    } catch (err) {
      console.error('Admin client error:', err)
    }
  }

  // プロフィールがまだない場合はエラー表示（リダイレクトしない）
  if (!profile) {
    return (
      <div className="space-y-6">
        <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
          <CardHeader>
            <CardTitle className="text-red-800 dark:text-red-200">
              プロフィールの作成に失敗しました
            </CardTitle>
            <CardDescription className="text-red-700 dark:text-red-300">
              サーバー設定を確認してください。SUPABASE_SERVICE_ROLE_KEY が設定されていることを確認してください。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href="/dashboard">ダッシュボードに戻る</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const planLabels: Record<string, string> = {
    free: 'Free',
    pro: 'Pro',
    pro_plus: 'Pro+',
  }

  const planColors: Record<string, string> = {
    free: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200',
    pro: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    pro_plus: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">設定</h1>
        <p className="text-muted-foreground mt-1">
          アカウント設定とプラン管理
        </p>
      </div>

      {success && (
        <Card className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
          <CardContent className="py-4">
            <p className="text-green-800 dark:text-green-200">
              プランのアップグレードが完了しました！
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>プロフィール</CardTitle>
          <CardDescription>
            アカウント情報を管理します
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm profile={profile} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>プラン</CardTitle>
              <CardDescription>
                現在のプランと利用状況
              </CardDescription>
            </div>
            <Badge className={planColors[profile.plan]}>
              {planLabels[profile.plan]}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <PlanManagement profile={profile} />
        </CardContent>
      </Card>
    </div>
  )
}
