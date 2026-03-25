'use client'

import { useState, useRef, useEffect } from 'react'
import { useApp } from './app-context'

export function BreadcrumbSwitcher() {
  const { projects, activeProject, setActiveProject, addProject } = useApp()
  const [open, setOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

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

  return (
    <div ref={ref} className="relative">
      {/* Breadcrumb display */}
      <div className="flex items-center gap-1 text-[13px]">
        <a href="/" className="flex items-center gap-1.5 font-semibold text-text-primary">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
        <svg className="h-3.5 w-3.5 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
        <span className="text-text-secondary">Personal</span>
        <svg className="h-3.5 w-3.5 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1 rounded-md px-1.5 py-0.5 font-medium text-text-primary transition-colors hover:bg-surface"
        >
          <span className="max-w-[100px] truncate">{activeProject?.name || 'Project'}</span>
          <svg className="h-3 w-3 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
      </div>

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
              onClick={() => setCreating(true)}
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
  )
}
