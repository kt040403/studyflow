import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-01-28.clover',
  typescript: true,
})

export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    features: [
      '目標3つまで',
      '学習記録無制限',
      '基本的な統計',
    ],
    limits: {
      maxGoals: 3,
      aiGenerations: 0,
    },
  },
  pro: {
    name: 'Pro',
    price: 980,
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    features: [
      '目標無制限',
      '学習記録無制限',
      'AI学習計画生成（月10回）',
      '詳細な統計・分析',
      '優先サポート',
    ],
    limits: {
      maxGoals: Infinity,
      aiGenerations: 10,
    },
  },
  pro_plus: {
    name: 'Pro+',
    price: 1980,
    priceId: process.env.STRIPE_PRO_PLUS_PRICE_ID,
    features: [
      '目標無制限',
      '学習記録無制限',
      'AI学習計画生成（無制限）',
      '詳細な統計・分析',
      '優先サポート',
      '新機能の先行アクセス',
    ],
    limits: {
      maxGoals: Infinity,
      aiGenerations: Infinity,
    },
  },
} as const

export type PlanType = keyof typeof PLANS
