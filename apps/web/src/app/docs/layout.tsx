import type { Metadata } from 'next'
import { TopNav } from '@/components/docs/top-nav'
import { Sidebar } from '@/components/docs/sidebar'

export const metadata: Metadata = {
  title: {
    default: 'Docs',
    template: '%s — Delimiter Docs',
  },
  description: 'Developer documentation for Delimiter — AI rate limit monitoring SDK',
}

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopNav />
      <div className="flex min-h-[calc(100vh-64px)]">
        <Sidebar />
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </>
  )
}
