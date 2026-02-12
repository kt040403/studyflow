'use client'

import { Flame } from 'lucide-react'

interface StreakBadgeProps {
  streak: number
  displayName: string
}

export function StreakBadge({ streak, displayName }: StreakBadgeProps) {
  const getStreakMessage = (days: number) => {
    if (days === 0) return '今日から学習を始めましょう！'
    if (days === 1) return '素晴らしいスタートです！'
    if (days < 7) return `${days}日連続学習中！`
    if (days < 30) return `${days}日連続！すごい！`
    return `${days}日連続！驚異的です！`
  }

  return (
    <div className="flex items-center gap-3 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 p-4 text-white">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
        <Flame className="h-6 w-6" />
      </div>
      <div>
        <p className="text-sm opacity-90">おかえり、{displayName}さん！</p>
        <p className="font-bold">{getStreakMessage(streak)}</p>
      </div>
    </div>
  )
}
