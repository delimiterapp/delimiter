import type { Metadata } from 'next'
import './globals.css'
import { TopNav } from '@/components/docs/top-nav'
import { Sidebar } from '@/components/docs/sidebar'

export const metadata: Metadata = {
  title: 'Delimiter Docs',
  description: 'Developer documentation for Delimiter — AI rate limit monitoring SDK',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-bg text-text-primary antialiased">
        <TopNav />
        <div className="flex min-h-[calc(100vh-64px)]">
          <Sidebar />
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
