import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Target, Brain, BarChart3, Zap } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold">
                SF
              </div>
              <span className="text-xl font-bold">StudyFlow</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-sm font-medium hover:text-indigo-600">
                ログイン
              </Link>
              <Button asChild>
                <Link href="/signup">無料で始める</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-zinc-900 dark:text-white">
            AIがあなたの
            <span className="text-indigo-600">学習パートナー</span>
            になる
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            目標を設定するだけで、AIが最適な学習計画を自動生成。
            日々の進捗を可視化し、モチベーションを維持しながら効率的に学習を進められます。
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/signup">無料でアカウント作成</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/pricing">料金プランを見る</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-zinc-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            StudyFlowの特徴
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6">
              <div className="mx-auto w-14 h-14 rounded-xl bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center mb-4">
                <Target className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="font-semibold text-lg mb-2">目標管理</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                プログラミング、語学、資格取得など、あらゆる学習目標を一元管理
              </p>
            </div>
            <div className="text-center p-6">
              <div className="mx-auto w-14 h-14 rounded-xl bg-purple-100 dark:bg-purple-950 flex items-center justify-center mb-4">
                <Brain className="h-7 w-7 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold text-lg mb-2">AI学習計画</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                あなたの目標とスキルレベルに合わせた最適な学習計画をAIが自動生成
              </p>
            </div>
            <div className="text-center p-6">
              <div className="mx-auto w-14 h-14 rounded-xl bg-green-100 dark:bg-green-950 flex items-center justify-center mb-4">
                <BarChart3 className="h-7 w-7 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-lg mb-2">進捗可視化</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                学習時間や進捗をグラフで可視化。達成感を実感しながら継続
              </p>
            </div>
            <div className="text-center p-6">
              <div className="mx-auto w-14 h-14 rounded-xl bg-orange-100 dark:bg-orange-950 flex items-center justify-center mb-4">
                <Zap className="h-7 w-7 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="font-semibold text-lg mb-2">ストリーク</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                連続学習日数をトラッキング。習慣化をサポートしてモチベーション維持
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">シンプルな料金プラン</h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-12">
            まずは無料で始めて、必要に応じてアップグレード
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="rounded-2xl border bg-white dark:bg-zinc-900 p-6 text-left">
              <h3 className="font-semibold text-lg">Free</h3>
              <p className="text-3xl font-bold mt-2">¥0<span className="text-sm font-normal text-zinc-500">/月</span></p>
              <ul className="mt-6 space-y-3 text-sm">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> 目標3つまで
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> 基本的な進捗トラッキング
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> ダッシュボード
                </li>
              </ul>
            </div>
            <div className="rounded-2xl border-2 border-indigo-600 bg-white dark:bg-zinc-900 p-6 text-left relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs px-3 py-1 rounded-full">
                人気
              </div>
              <h3 className="font-semibold text-lg">Pro</h3>
              <p className="text-3xl font-bold mt-2">¥980<span className="text-sm font-normal text-zinc-500">/月</span></p>
              <ul className="mt-6 space-y-3 text-sm">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> 目標無制限
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> AI学習計画（月10回）
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> 広告非表示
                </li>
              </ul>
            </div>
            <div className="rounded-2xl border bg-white dark:bg-zinc-900 p-6 text-left">
              <h3 className="font-semibold text-lg">Pro+</h3>
              <p className="text-3xl font-bold mt-2">¥1,980<span className="text-sm font-normal text-zinc-500">/月</span></p>
              <ul className="mt-6 space-y-3 text-sm">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> AI生成無制限
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> CSVエクスポート
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> 優先サポート
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-indigo-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            今すぐ学習を始めよう
          </h2>
          <p className="text-indigo-100 mb-8">
            無料アカウントを作成して、効率的な学習をスタート
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/signup">無料でアカウント作成</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-zinc-200 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white text-sm font-bold">
              SF
            </div>
            <span className="font-semibold">StudyFlow</span>
          </div>
          <p className="text-sm text-zinc-500">
            © 2025 StudyFlow. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
