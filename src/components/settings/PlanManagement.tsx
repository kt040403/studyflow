'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CreditCard, ExternalLink, Loader2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import type { Profile } from '@/types/database'
import { toast } from 'sonner'

interface PlanManagementProps {
  profile: Profile
}

export function PlanManagement({ profile }: PlanManagementProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handlePortal = async () => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'ポータルの作成に失敗しました')
      }

      window.location.href = data.url
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'エラーが発生しました')
      setIsLoading(false)
    }
  }

  const isPaid = profile.plan !== 'free'
  const hasStripeCustomer = !!profile.stripe_customer_id
  const aiLimit = profile.plan === 'pro' ? 10 : profile.plan === 'pro_plus' ? Infinity : 0
  const aiUsagePercent = aiLimit === Infinity ? 0 : (profile.ai_usage_count / aiLimit) * 100

  return (
    <div className="space-y-6">
      {/* AI使用状況 */}
      {isPaid && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">AI学習計画生成</span>
            <span className="text-sm text-muted-foreground">
              {profile.plan === 'pro_plus' ? (
                '無制限'
              ) : (
                `${profile.ai_usage_count} / ${aiLimit} 回（今月）`
              )}
            </span>
          </div>
          {profile.plan === 'pro' && (
            <Progress value={aiUsagePercent} className="h-2" />
          )}
        </div>
      )}

      {/* プラン変更・管理 */}
      <div className="flex flex-col sm:flex-row gap-3">
        {isPaid && hasStripeCustomer ? (
          <>
            <Button
              variant="outline"
              onClick={handlePortal}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  処理中...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  支払い・プラン管理
                  <ExternalLink className="ml-2 h-3 w-3" />
                </>
              )}
            </Button>
            {profile.plan === 'pro' && (
              <Button asChild className="flex-1">
                <Link href="/pricing">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Pro+にアップグレード
                </Link>
              </Button>
            )}
          </>
        ) : (
          <Button asChild className="flex-1">
            <Link href="/pricing">
              <Sparkles className="mr-2 h-4 w-4" />
              プランをアップグレード
            </Link>
          </Button>
        )}
      </div>

      {/* プラン詳細 */}
      <div className="rounded-lg bg-zinc-50 dark:bg-zinc-900 p-4 space-y-2">
        <h4 className="font-medium text-sm">現在のプランの特典</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          {profile.plan === 'free' && (
            <>
              <li>- 目標3つまで</li>
              <li>- 学習記録無制限</li>
              <li>- 基本的な統計</li>
            </>
          )}
          {profile.plan === 'pro' && (
            <>
              <li>- 目標無制限</li>
              <li>- 学習記録無制限</li>
              <li>- AI学習計画生成（月10回）</li>
              <li>- 詳細な統計・分析</li>
              <li>- 優先サポート</li>
            </>
          )}
          {profile.plan === 'pro_plus' && (
            <>
              <li>- 目標無制限</li>
              <li>- 学習記録無制限</li>
              <li>- AI学習計画生成（無制限）</li>
              <li>- 詳細な統計・分析</li>
              <li>- 優先サポート</li>
              <li>- 新機能の先行アクセス</li>
            </>
          )}
        </ul>
      </div>
    </div>
  )
}
