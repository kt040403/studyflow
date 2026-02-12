import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '学習記録',
}

export default function LogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
