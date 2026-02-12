import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // ユーザー情報取得
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // プロフィールが存在するか確認
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single()

        // プロフィールがなければadminクライアントで作成（RLSバイパス）
        if (!profile) {
          try {
            const adminClient = createAdminClient()
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (adminClient as any)
              .from('profiles')
              .insert({
                id: user.id,
                email: user.email || '',
                display_name: user.email?.split('@')[0] || 'User',
              })
          } catch (err) {
            console.error('Failed to create profile:', err)
          }
        }
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
