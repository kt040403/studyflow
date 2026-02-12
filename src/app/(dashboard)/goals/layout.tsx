import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '目標',
}

export default function GoalsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
