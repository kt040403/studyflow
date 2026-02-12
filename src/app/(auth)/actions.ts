'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { data: authData, error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { error: error.message }
  }

  // プロフィールが存在するか確認、なければadminクライアントで作成
  if (authData.user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', authData.user.id)
      .single()

    if (!profile) {
      try {
        const adminClient = createAdminClient()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (adminClient as any)
          .from('profiles')
          .insert({
            id: authData.user.id,
            email: authData.user.email || '',
            display_name: authData.user.email?.split('@')[0] || 'User',
          })
      } catch (err) {
        console.error('Failed to create profile:', err)
      }
    }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const displayName = formData.get('displayName') as string

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,
      },
    },
  })

  if (authError) {
    return { error: authError.message }
  }

  // プロフィール作成（adminクライアントでRLSバイパス）
  if (authData.user) {
    try {
      const adminClient = createAdminClient()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: profileError } = await (adminClient as any)
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: authData.user.email || '',
          display_name: displayName || authData.user.email?.split('@')[0] || 'User',
        })

      if (profileError) {
        console.error('Profile creation error:', profileError)
      }
    } catch (err) {
      console.error('Failed to create profile:', err)
    }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function signInWithProvider(provider: 'google' | 'github') {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  if (data.url) {
    redirect(data.url)
  }
}
