import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { stripe } from '@/lib/stripe'
import type { Profile } from '@/types/database'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { priceId } = await request.json()

    if (!priceId) {
      return NextResponse.json({ error: 'プランIDが必要です' }, { status: 400 })
    }

    // プロフィール取得
    let { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, email')
      .eq('id', user.id)
      .single() as { data: Pick<Profile, 'stripe_customer_id' | 'email'> | null }

    // プロフィールがない場合はadminクライアントで作成（RLSバイパス）
    if (!profile) {
      try {
        const adminClient = createAdminClient()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: newProfile, error: createError } = await (adminClient as any)
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email || '',
            display_name: user.email?.split('@')[0] || 'User',
          })
          .select('stripe_customer_id, email')
          .single()

        if (createError) {
          console.error('Failed to create profile:', createError)
          return NextResponse.json({ error: 'プロフィールの作成に失敗しました' }, { status: 500 })
        }
        profile = newProfile as Pick<Profile, 'stripe_customer_id' | 'email'>
      } catch (err) {
        console.error('Admin client error:', err)
        return NextResponse.json({ error: 'プロフィールの作成に失敗しました' }, { status: 500 })
      }
    }

    if (!profile) {
      return NextResponse.json({ error: 'プロフィールの作成に失敗しました' }, { status: 500 })
    }

    let customerId = profile.stripe_customer_id

    // Stripeカスタマーが存在しない場合は作成
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile.email || user.email || '',
        metadata: {
          supabase_user_id: user.id,
        },
      })
      customerId = customer.id

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id)
    }

    // Checkout Session作成
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/settings?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing?canceled=true`,
      metadata: {
        supabase_user_id: user.id,
      },
      subscription_data: {
        metadata: {
          supabase_user_id: user.id,
        },
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'チェックアウトの作成に失敗しました' },
      { status: 500 }
    )
  }
}
