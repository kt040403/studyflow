import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '統計',
}

export default function StatsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
