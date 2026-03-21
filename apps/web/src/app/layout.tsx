import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Delimiter — AI Rate Limit Monitoring',
  description:
    'Know your AI rate limits before your app does. Three lines of code. Every provider. One dashboard.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-bg text-text-primary antialiased">{children}</body>
    </html>
  )
}
