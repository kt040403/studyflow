import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI学習計画',
}

export default function AIPlanLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
