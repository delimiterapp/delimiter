'use client'

import { useState } from 'react'
import { useApp } from '@/components/app/app-context'

export default function SettingsPage() {
  const { activeProject, refreshProjects, projects, setActiveProject } = useApp()
  const [copied, setCopied] = useState(false)
  const [name, setName] = useState(activeProject?.name || '')
  const [saving, setSaving] = useState(false)
  const [rotating, setRotating] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  function copy(text: string) {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function saveName() {
    if (!activeProject || !name.trim()) return
    setSaving(true)
    await fetch(`/api/projects/${activeProject.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim() }),
    })
    await refreshProjects()
    setSaving(false)
  }

  async function rotateKey() {
    if (!activeProject) return
    setRotating(true)
    await fetch(`/api/projects/${activeProject.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rotateKey: true }),
    })
    await refreshProjects()
    setRotating(false)
  }

  async function deleteProject() {
    if (!activeProject) return
    setDeleting(true)
    await fetch(`/api/projects/${activeProject.id}`, { method: 'DELETE' })
    await refreshProjects()
    // After refresh, check remaining projects
    const remaining = projects.filter((p) => p.id !== activeProject.id)
    if (remaining.length > 0) {
      setActiveProject(remaining[0])
    } else {
      window.location.href = '/dashboard'
    }
    setDeleting(false)
    setConfirmDelete(false)
  }

  if (!activeProject) return null

  return (
    <div className="p-8">
      <h1 className="mb-6 text-lg font-semibold">Settings</h1>

      <div className="space-y-6">
        {/* Project key */}
        <div className="rounded-xl border border-border bg-white p-5">
          <h2 className="text-sm font-medium">Project Key</h2>
          <p className="mt-1 text-xs text-text-tertiary">
            Use this key to initialize the Delimiter SDK.
          </p>
          <div className="mt-3 flex items-center gap-3">
            <code className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 font-mono text-sm">
              {activeProject.key}
            </code>
            <button
              onClick={() => copy(activeProject.key)}
              className="rounded-lg border border-border px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-surface"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button
              onClick={rotateKey}
              disabled={rotating}
              className="rounded-lg border border-border px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-surface disabled:opacity-50"
            >
              {rotating ? 'Rotating...' : 'Rotate key'}
            </button>
          </div>
        </div>

        {/* Project name */}
        <div className="rounded-xl border border-border bg-white p-5">
          <h2 className="text-sm font-medium">Project Name</h2>
          <div className="mt-3 flex items-center gap-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-accent"
            />
            <button
              onClick={saveName}
              disabled={saving || name.trim() === activeProject.name}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        {/* Danger zone */}
        <div className="rounded-xl border border-red/30 bg-white p-5">
          <h2 className="text-sm font-medium text-red">Danger Zone</h2>
          <p className="mt-1 text-xs text-text-tertiary">
            Deleting a project removes all associated data, alerts, and fallback configurations.
          </p>
          <div className="mt-3">
            {confirmDelete ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-red">Are you sure?</span>
                <button
                  onClick={deleteProject}
                  disabled={deleting}
                  className="rounded-lg bg-red px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red/90 disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : 'Yes, delete'}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="rounded-lg border border-border px-4 py-2 text-sm text-text-secondary hover:bg-surface"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="rounded-lg border border-red/30 px-4 py-2 text-sm font-medium text-red transition-colors hover:bg-red/5"
              >
                Delete project
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
