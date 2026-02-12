'use client'

import { Suspense, useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Check, Loader2, X, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    description: '学習を始めたい方に',
    features: [
      { text: '目標3つまで', included: true },
      { text: '学習記録無制限', included: true },
      { text: '基本的な統計', included: true },
      { text: 'AI学習計画生成', included: false },
      { text: '詳細な統計・分析', included: false },
      { text: '優先サポート', included: false },
    ],
    priceId: null,
    popular: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 980,
    description: '本格的に学習したい方に',
    features: [
      { text: '目標無制限', included: true },
      { text: '学習記録無制限', included: true },
      { text: '詳細な統計・分析', included: true },
      { text: 'AI学習計画生成（月10回）', included: true },
      { text: '優先サポート', included: true },
      { text: '新機能の先行アクセス', included: false },
    ],
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || 'price_980',
    popular: true,
  },
  {
    id: 'pro_plus',
    name: 'Pro+',
    price: 1980,
    description: '最大限に活用したい方に',
    features: [
      { text: '目標無制限', included: true },
      { text: '学習記録無制限', included: true },
      { text: '詳細な統計・分析', included: true },
      { text: 'AI学習計画生成（無制限）', included: true },
      { text: '優先サポート', included: true },
      { text: '新機能の先行アクセス', included: true },
    ],
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PLUS_PRICE_ID || 'price_1980',
    popular: false,
  },
]

function PricingContent() {
  const searchParams = useSearchParams()
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const canceled = searchParams.get('canceled')

  useEffect(() => {
    if (canceled) {
      toast.info('チェックアウトがキャンセルされました')
    }
  }, [canceled])

  const handleCheckout = async (priceId: string, planId: string) => {
    setLoadingPlan(planId)

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'チェックアウトの作成に失敗しました')
      }

      // Stripe Checkoutにリダイレクト
      window.location.href = data.url
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'エラーが発生しました')
      setLoadingPlan(null)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-12">
      <div className="mx-auto max-w-5xl px-4">
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            ダッシュボードに戻る
          </Link>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">料金プラン</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            あなたの学習スタイルに合わせたプランをお選びください。
            いつでもアップグレード・ダウングレードが可能です。
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative flex flex-col ${
                plan.popular
                  ? 'border-indigo-500 shadow-lg shadow-indigo-500/10'
                  : ''
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600">
                  人気
                </Badge>
              )}
              <CardHeader>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">
                    {plan.price === 0 ? '無料' : `¥${plan.price.toLocaleString()}`}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-muted-foreground">/月</span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check className="h-5 w-5 text-green-600 shrink-0" />
                      ) : (
                        <X className="h-5 w-5 text-zinc-300 dark:text-zinc-700 shrink-0" />
                      )}
                      <span
                        className={
                          feature.included
                            ? 'text-foreground'
                            : 'text-muted-foreground'
                        }
                      >
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                {plan.priceId ? (
                  <Button
                    className="w-full"
                    variant={plan.popular ? 'default' : 'outline'}
                    disabled={loadingPlan !== null}
                    onClick={() => handleCheckout(plan.priceId!, plan.id)}
                  >
                    {loadingPlan === plan.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        処理中...
                      </>
                    ) : (
                      'このプランを選択'
                    )}
                  </Button>
                ) : (
                  <Button className="w-full" variant="outline" asChild>
                    <Link href="/signup">無料で始める</Link>
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>
            すべてのプランは月額課金です。いつでもキャンセル可能です。
          </p>
          <p className="mt-2">
            ご質問がありましたら、
            <a href="mailto:support@studyflow.app" className="text-indigo-600 hover:underline">
              サポート
            </a>
            までお問い合わせください。
          </p>
        </div>
      </div>
    </div>
  )
}

export default function PricingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <PricingContent />
    </Suspense>
  )
}
