'use client'

import { useState } from 'react'
import { AppProvider, useApp } from '@/components/app/app-context'
import { Sidebar } from '@/components/app/sidebar'

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
    <div className="flex h-screen overflow-hidden">
      {/* Mobile hamburger */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed left-3 top-3 z-40 rounded-lg border border-border bg-white p-2 shadow-sm md:hidden"
      >
        <svg className="h-5 w-5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/30 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 h-screen transition-transform duration-200 md:relative md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar onNavigate={() => setSidebarOpen(false)} />
      </div>

      <main className="flex-1 overflow-y-auto bg-surface">
        {children}
      </main>
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
