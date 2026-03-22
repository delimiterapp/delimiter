'use client'

import { useState, useRef, useEffect } from 'react'
import { ScrambleText } from '@/components/ui/scramble-text'

export function Nav() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const [unlockHoverKey, setUnlockHoverKey] = useState(0)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/50 bg-white/80 backdrop-blur-md">
      <nav className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        <a href="/" className="flex items-center">
          <img src="/logo.png" alt="delimiter" className="h-7" />
        </a>
        <div className="flex items-center gap-1">
          <a
            href="https://github.com/syedos/delimiter"
            target="_blank"
            rel="noopener noreferrer"
            className="shine-hover-light inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-text-secondary transition-colors hover:bg-surface hover:text-text-primary"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            GitHub
          </a>
          <a
            href="/docs"
            className="shine-hover-light inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-text-secondary transition-colors hover:bg-surface hover:text-text-primary"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
            Docs
          </a>
          <div className="ml-2 h-5 w-px bg-border" />
          <div className="relative ml-2" ref={ref}>
            <button
              onClick={() => setOpen(!open)}
              onMouseEnter={() => setUnlockHoverKey((k) => k + 1)}
              className="inline-flex items-center gap-2 rounded-lg bg-text-primary px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-text-primary/90"
              style={{ fontFamily: "'Chakra Petch', sans-serif" }}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a7 7 0 0 1 7 7" />
                <path d="M12 5a4 4 0 0 1 4 4" />
                <path d="M12 8a1 1 0 0 1 1 1" />
                <path d="M7.5 11.5c0-2.5.5-4.5 1.5-6" />
                <path d="M5 14c0-3.5 1-6.5 2.5-8.5" />
                <path d="M12 11v4" />
                <path d="M10 13v5" />
                <path d="M14 12v4" />
                <path d="M8 14v4" />
                <path d="M16 13v3" />
              </svg>
              <ScrambleText
                key={unlockHoverKey}
                text="Unlock"
                duration={0.4}
                skipInitialAnimation={unlockHoverKey === 0}
              />
              <svg className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
            {open && (
              <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-white shadow-lg">
                <a
                  href="/sign-in"
                  className="flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-surface"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-light text-accent">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7.864 4.243A7.5 7.5 0 0119.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 004.5 10.5a48.667 48.667 0 00-1.26 8.568M5.742 6.364a7.465 7.465 0 00-.246 1.636m13.5-4.243a7.465 7.465 0 011.004 3.743 48.52 48.52 0 01-.643 4.68M5.742 6.364A48.374 48.374 0 018.906 3.75a48.09 48.09 0 012.594-.472m9 9.75a48.09 48.09 0 01-2.594.472M12 12.75a2.25 2.25 0 002.25-2.25A2.25 2.25 0 0012 8.25a2.25 2.25 0 00-2.25 2.25A2.25 2.25 0 0012 12.75z" />
                    </svg>
                  </span>
                  <div>
                    <div className="font-medium text-text-primary">Sign in</div>
                    <div className="text-xs text-text-tertiary">Passkey login &middot; Face / Touch ID</div>
                  </div>
                </a>
                <div className="mx-4 border-t border-border" />
                <a
                  href="/sign-up"
                  className="flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-surface"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-green/10 text-green">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                    </svg>
                  </span>
                  <div>
                    <div className="font-medium text-text-primary">Sign up</div>
                    <div className="text-xs text-text-tertiary">Create account &middot; Passkey</div>
                  </div>
                </a>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  )
}
