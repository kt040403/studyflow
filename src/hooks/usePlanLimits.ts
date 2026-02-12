import { PLANS, PlanType } from '@/lib/stripe'

export interface PlanLimits {
  maxGoals: number
  aiGenerations: number
  canCreateGoal: (currentGoalCount: number) => boolean
  canUseAI: boolean
  getRemainingAIGenerations: (usedCount: number) => number
  planName: string
  isPaid: boolean
}

export function usePlanLimits(plan: PlanType): PlanLimits {
  const planConfig = PLANS[plan]
  const isPaid = plan !== 'free'

  return {
    maxGoals: planConfig.limits.maxGoals,
    aiGenerations: planConfig.limits.aiGenerations,
    canCreateGoal: (currentGoalCount: number) => {
      return currentGoalCount < planConfig.limits.maxGoals
    },
    canUseAI: planConfig.limits.aiGenerations > 0,
    getRemainingAIGenerations: (usedCount: number) => {
      if (planConfig.limits.aiGenerations === Infinity) {
        return Infinity
      }
      return Math.max(0, planConfig.limits.aiGenerations - usedCount)
    },
    planName: planConfig.name,
    isPaid,
  }
}

// サーバーサイドで使用する場合
export function getPlanLimits(plan: PlanType): PlanLimits {
  return usePlanLimits(plan)
}

// 目標作成時のチェック
export function checkGoalLimit(plan: PlanType, currentGoalCount: number): {
  allowed: boolean
  message?: string
} {
  const limits = getPlanLimits(plan)

  if (limits.canCreateGoal(currentGoalCount)) {
    return { allowed: true }
  }

  return {
    allowed: false,
    message: `Freeプランでは目標は${limits.maxGoals}つまでです。プランをアップグレードしてください。`,
  }
}

// AI機能使用時のチェック
export function checkAILimit(
  plan: PlanType,
  usedCount: number
): {
  allowed: boolean
  remaining: number
  message?: string
} {
  const limits = getPlanLimits(plan)

  if (!limits.canUseAI) {
    return {
      allowed: false,
      remaining: 0,
      message: 'AI機能はProプラン以上で利用できます。',
    }
  }

  const remaining = limits.getRemainingAIGenerations(usedCount)

  if (remaining <= 0 && limits.aiGenerations !== Infinity) {
    return {
      allowed: false,
      remaining: 0,
      message: '今月のAI生成回数上限に達しました。',
    }
  }

  return {
    allowed: true,
    remaining,
  }
}
