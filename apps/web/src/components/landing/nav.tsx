'use client'

import { useState, useRef, useEffect } from 'react'
import { ScrambleButton } from '@/components/ui/scramble-button'

export function Nav() {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-white/80 backdrop-blur-md">
      <nav className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        <a href="/" className="shine-hover-light flex items-center rounded-lg px-1 py-0.5">
          <img src="/logo.png" alt="delimiter" className="h-7 w-auto object-contain" />
        </a>
        <div className="flex items-center gap-2">
          {/* Hamburger menu for GitHub & Docs */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="shine-hover-light inline-flex items-center justify-center rounded-lg p-2 text-text-secondary transition-colors hover:bg-surface hover:text-text-primary"
              aria-label="Menu"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 overflow-hidden rounded-xl border border-border bg-white shadow-lg">
                <a
                  href="https://github.com/syedos/delimiter"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-surface"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                  GitHub
                </a>
                <div className="mx-4 border-t border-border" />
                <a
                  href="/docs"
                  className="flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-surface"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                  </svg>
                  Docs
                </a>
              </div>
            )}
          </div>
          <ScrambleButton
            as="a"
            href="/sign-in"
            className="inline-flex items-center gap-2 rounded-lg bg-text-primary px-4 py-1.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-text-primary/90 hover:shadow-md"
            style={{ fontFamily: "'Chakra Petch', sans-serif" }}
          >
            Start Monitoring
          </ScrambleButton>
        </div>
      </nav>
    </header>
  )
}
