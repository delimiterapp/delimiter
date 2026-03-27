'use client'

import { useState, useRef, useEffect } from 'react'
import { useApp } from './app-context'

export function BreadcrumbSwitcher() {
  const { user, projects, activeProject, setActiveProject, addProject } = useApp()
  const [open, setOpen] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const isFree = user?.plan === 'free' || user?.plan === 'none'

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setCreating(false)
        setNewName('')
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    if (creating && inputRef.current) inputRef.current.focus()
  }, [creating])

  async function handleCreate() {
    if (!newName.trim()) return
    await addProject(newName.trim())
    setCreating(false)
    setNewName('')
    setOpen(false)
  }

  function handleNewProject() {
    if (isFree && projects.length >= 1) {
      setOpen(false)
      setShowUpgrade(true)
    } else {
      setCreating(true)
    }
  }

  return (
    <>
      <div ref={ref} className="relative flex items-center gap-3 min-w-0">
        {/* User avatar */}
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent/70 text-[11px] font-semibold text-white">
          {user?.email?.[0]?.toUpperCase() || '?'}
        </div>

        {/* Separator */}
        <svg className="h-4 w-4 shrink-0 text-border" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path d="M9 4l6 16" />
        </svg>

        {/* Project selector */}
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1.5 rounded-md px-1.5 py-1 min-w-0 transition-colors hover:bg-surface"
        >
          <span className="truncate text-[13px] font-medium text-text-primary">
            {activeProject?.name || 'Project'}
          </span>
          <svg className={`h-3 w-3 shrink-0 text-text-tertiary transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>

        {/* Dropdown */}
        {open && (
          <div className="absolute left-0 top-full z-50 mt-1.5 w-56 rounded-lg border border-border bg-white py-1 shadow-md">
            <div className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">
              Projects
            </div>
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => { setActiveProject(project); setOpen(false) }}
                className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-[13px] transition-colors ${
                  activeProject?.id === project.id
                    ? 'bg-accent-light font-medium text-accent'
                    : 'text-text-secondary hover:bg-surface hover:text-text-primary'
                }`}
              >
                <div className={`h-1.5 w-1.5 rounded-full ${activeProject?.id === project.id ? 'bg-accent' : 'bg-border'}`} />
                <span className="truncate">{project.name}</span>
              </button>
            ))}

            <div className="my-1 border-t border-border" />

            {creating ? (
              <div className="px-3 py-1.5">
                <input
                  ref={inputRef}
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') { setCreating(false); setNewName('') } }}
                  placeholder="Project name..."
                  className="w-full rounded-md border border-border bg-surface px-2 py-1 text-[13px] outline-none focus:border-accent"
                />
              </div>
            ) : (
              <button
                onClick={handleNewProject}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-[13px] text-text-secondary transition-colors hover:bg-surface hover:text-text-primary"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                New project
              </button>
            )}
          </div>
        )}
      </div>

      {/* Upgrade modal */}
      {showUpgrade && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-white p-8 shadow-xl">
            <button
              onClick={() => setShowUpgrade(false)}
              className="absolute right-4 top-4 text-text-tertiary transition-colors hover:text-text-primary"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                <svg className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold">Upgrade to Pro</h2>
              <p className="mt-2 text-sm text-text-secondary">
                The free plan includes 1 project. Upgrade to create unlimited projects and unlock higher event limits.
              </p>
            </div>

            <div className="mt-6 rounded-xl border border-border bg-surface/50 p-5">
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-semibold">Pro Plan</span>
                <div>
                  <span className="text-2xl font-bold">$20</span>
                  <span className="text-sm text-text-secondary">/mo</span>
                </div>
              </div>
              <ul className="mt-4 space-y-2.5">
                {['Unlimited projects', 'Unlimited providers & API keys', '50,000 events/month', 'Fallback chains', 'Slack, webhook & email alerts', 'Priority support'].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-text-secondary">
                    <svg className="h-4 w-4 shrink-0 text-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowUpgrade(false)}
                className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-surface"
              >
                Maybe later
              </button>
              <a
                href="/api/checkout"
                className="flex-1 rounded-lg bg-text-primary px-4 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-text-primary/90"
              >
                Upgrade
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
