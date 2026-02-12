import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import type Stripe from 'stripe'

// Webhook用にService Role Keyを使用（RLSをバイパス）
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(session)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdated(subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(subscription)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentFailed(invoice)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.supabase_user_id
  if (!userId) {
    console.error('No user ID in session metadata')
    return
  }

  const subscriptionId = session.subscription as string
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  const priceId = subscription.items.data[0]?.price.id

  // プランを判定
  let plan: 'free' | 'pro' | 'pro_plus' = 'free'
  if (priceId === process.env.STRIPE_PRO_PRICE_ID) {
    plan = 'pro'
  } else if (priceId === process.env.STRIPE_PRO_PLUS_PRICE_ID) {
    plan = 'pro_plus'
  }

  // プロフィール更新
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({
      plan,
      stripe_subscription_id: subscriptionId,
    })
    .eq('id', userId)

  if (error) {
    console.error('Failed to update profile:', error)
    throw error
  }

  console.log(`User ${userId} upgraded to ${plan}`)
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.supabase_user_id
  if (!userId) {
    // metadataがない場合はcustomer_idから検索
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('stripe_customer_id', subscription.customer)
      .single()

    if (!profile) {
      console.error('No profile found for customer:', subscription.customer)
      return
    }

    await updateSubscription(profile.id, subscription)
  } else {
    await updateSubscription(userId, subscription)
  }
}

async function updateSubscription(userId: string, subscription: Stripe.Subscription) {
  const priceId = subscription.items.data[0]?.price.id
  const status = subscription.status

  // アクティブでない場合はfreeに戻す
  if (status !== 'active' && status !== 'trialing') {
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ plan: 'free', stripe_subscription_id: null })
      .eq('id', userId)

    if (error) {
      console.error('Failed to downgrade profile:', error)
    }
    return
  }

  // プランを判定
  let plan: 'free' | 'pro' | 'pro_plus' = 'free'
  if (priceId === process.env.STRIPE_PRO_PRICE_ID) {
    plan = 'pro'
  } else if (priceId === process.env.STRIPE_PRO_PLUS_PRICE_ID) {
    plan = 'pro_plus'
  }

  const { error } = await supabaseAdmin
    .from('profiles')
    .update({
      plan,
      stripe_subscription_id: subscription.id,
    })
    .eq('id', userId)

  if (error) {
    console.error('Failed to update subscription:', error)
  }

  console.log(`User ${userId} subscription updated to ${plan}`)
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.supabase_user_id

  if (!userId) {
    // metadataがない場合はsubscription_idから検索
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('stripe_subscription_id', subscription.id)
      .single()

    if (!profile) {
      console.error('No profile found for subscription:', subscription.id)
      return
    }

    await downgradeToFree(profile.id)
  } else {
    await downgradeToFree(userId)
  }
}

async function downgradeToFree(userId: string) {
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({
      plan: 'free',
      stripe_subscription_id: null,
    })
    .eq('id', userId)

  if (error) {
    console.error('Failed to downgrade to free:', error)
    throw error
  }

  console.log(`User ${userId} downgraded to free`)
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id, email')
    .eq('stripe_customer_id', customerId)
    .single()

  if (!profile) {
    console.error('No profile found for customer:', customerId)
    return
  }

  // 支払い失敗の処理（メール通知などを追加可能）
  console.log(`Payment failed for user ${profile.id}`)
}
