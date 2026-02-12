'use client'

import { useEffect } from 'react'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Dashboard error:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-950">
            <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-2">エラーが発生しました</h1>
        <p className="text-muted-foreground mb-6">
          データの読み込み中にエラーが発生しました。
          再度お試しください。
        </p>

        {error.digest && (
          <p className="text-xs text-muted-foreground mb-4">
            エラーコード: {error.digest}
          </p>
        )}

        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Button onClick={reset} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            再試行
          </Button>
          <Button asChild>
            <Link href="/dashboard">
              <Home className="mr-2 h-4 w-4" />
              ダッシュボードへ
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
