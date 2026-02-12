import { FileQuestion, Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
            <FileQuestion className="h-8 w-8 text-zinc-600 dark:text-zinc-400" />
          </div>
        </div>

        <h1 className="text-6xl font-bold text-zinc-200 dark:text-zinc-800 mb-2">
          404
        </h1>
        <h2 className="text-2xl font-bold mb-2">ページが見つかりません</h2>
        <p className="text-muted-foreground mb-6">
          お探しのページは存在しないか、移動した可能性があります。
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Button variant="outline" asChild>
            <Link href="javascript:history.back()">
              <ArrowLeft className="mr-2 h-4 w-4" />
              戻る
            </Link>
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
