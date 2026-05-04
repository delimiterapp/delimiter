'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AppProvider, useApp } from '@/components/app/app-context'
import { Sidebar } from '@/components/app/sidebar'
import { getProvider } from '@/lib/provider-catalog'

const PAGE_LABELS: Record<string, string> = {
  '/dashboard': 'Spend',
  '/dashboard/providers': 'Connect',
  '/dashboard/alerts': 'Alerts',
  '/dashboard/settings': 'Settings',
  '/dashboard/logs': 'Logs',
  '/dashboard/fallbacks': 'Fallbacks',
}

function Breadcrumbs() {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)

  const crumbs: { label: string; href: string }[] = []
  let path = ''
  for (const segment of segments) {
    path += `/${segment}`
    const label = PAGE_LABELS[path]
    if (label) {
      crumbs.push({ label, href: path })
    } else if (crumbs.length > 0 && crumbs[crumbs.length - 1]!.href.endsWith('/providers')) {
      const provider = getProvider(segment)
      if (provider) {
        crumbs.push({ label: provider.name, href: path })
      }
    }
  }

  if (crumbs.length <= 1) return null

  return (
    <nav className="flex items-center gap-1.5 text-sm text-text-secondary">
      {crumbs.map((crumb, i) => (
        <span key={crumb.href} className="flex items-center gap-1.5">
          {i > 0 && (
            <svg className="h-3.5 w-3.5 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          )}
          {i < crumbs.length - 1 ? (
            <Link href={crumb.href} className="transition-colors hover:text-text-primary">{crumb.label}</Link>
          ) : (
            <span className="font-medium text-text-primary">{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}

function ShellContent({ children }: { children: React.ReactNode }) {
  const { loading } = useApp()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-accent" />
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col md:flex-row overflow-hidden">
      {/* Mobile top bar */}
      <div className="flex h-12 shrink-0 items-center border-b border-border bg-white px-4 md:hidden">
        <button
          onClick={() => setSidebarOpen(true)}
          className="mr-3 rounded-md p-1 text-text-secondary hover:bg-surface"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
        <span className="text-sm font-semibold text-text-primary">Delimiter</span>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/30 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Mobile sidebar drawer */}
      <div className={`fixed inset-y-0 left-0 z-50 w-60 transition-transform duration-200 md:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar onNavigate={() => setSidebarOpen(false)} onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:h-screen md:shrink-0">
        <Sidebar />
      </div>

      <div className="min-h-0 flex-1 flex flex-col overflow-hidden">
        <div className="hidden md:flex h-[49px] shrink-0 items-center border-b border-border bg-white px-6">
          <Breadcrumbs />
        </div>
        <main className="flex-1 overflow-y-auto bg-surface">
          {children}
        </main>
      </div>
    </div>
  )
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <ShellContent>{children}</ShellContent>
    </AppProvider>
  )
}
