'use client'

import { useEffect, useState } from 'react'

type Project = { id: string; name: string; key: string }
type User = { id: string; email: string; name: string | null }

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => {
        if (!r.ok) {
          window.location.href = '/sign-in'
          return null
        }
        return r.json()
      })
      .then((data) => {
        if (data) {
          setUser(data.user)
          setProject(data.projects?.[0] || null)
        }
        setLoading(false)
      })
  }, [])

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/'
  }

  function copy(text: string) {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-accent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Top bar */}
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <a href="/" className="flex items-center">
              <img src="/logo.png" alt="delimiter" className="h-5" />
            </a>
            <div className="h-5 w-px bg-border" />
            <span className="text-sm text-text-secondary">{project?.name || 'Dashboard'}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-text-secondary">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-surface hover:text-text-primary"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* Provider health cards - empty state */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {['OpenAI', 'Anthropic', 'Google Gemini'].map((provider) => (
            <div key={provider} className="rounded-xl border border-border bg-white p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{provider}</span>
                <span className="rounded-full bg-surface px-2 py-0.5 text-xs text-text-tertiary">
                  No data
                </span>
              </div>
              <div className="mt-4 space-y-2">
                <div>
                  <div className="flex justify-between text-xs text-text-tertiary">
                    <span>Requests / min</span>
                    <span>— / —</span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-surface" />
                </div>
                <div>
                  <div className="flex justify-between text-xs text-text-tertiary">
                    <span>Tokens / min</span>
                    <span>— / —</span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-surface" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state CTA */}
        <div className="mt-8 rounded-xl border border-dashed border-border bg-white p-10 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent-light">
            <svg className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold">Waiting for data</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-text-secondary">
            Once you initialize the Delimiter SDK and make an AI API request,
            rate limit data will appear here automatically.
          </p>

          {project && (
            <div className="mx-auto mt-6 max-w-md">
              <div className="overflow-hidden rounded-lg border border-border bg-code-bg text-left">
                <div className="flex items-center justify-between border-b border-white/5 px-4 py-2">
                  <span className="font-mono text-xs text-white/40">Quick start</span>
                  <button
                    onClick={() =>
                      copy(
                        `import { delimiter } from '@delimiter/sdk'\ndelimiter.init('${project.key}')`
                      )
                    }
                    className="text-xs text-white/40 transition-colors hover:text-white/70"
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <pre className="overflow-x-auto p-4 font-mono text-sm leading-relaxed text-code-text">
{`import { delimiter } from '@delimiter/sdk'
delimiter.init('${project.key}')`}
                </pre>
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-center gap-3">
            <a
              href="/console"
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
            >
              Setup guide
            </a>
            <a
              href="/docs"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-surface"
            >
              Read docs
            </a>
          </div>
        </div>

        {/* Alert log - empty state */}
        <div className="mt-8 rounded-xl border border-border bg-white">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="font-semibold">Alert log</h2>
            <span className="text-xs text-text-tertiary">Last 24 hours</span>
          </div>
          <div className="px-5 py-10 text-center text-sm text-text-tertiary">
            No alerts yet. Alerts will appear when rate limits are approached.
          </div>
        </div>

        {/* SDK info panel */}
        {project && (
          <div className="mt-8 rounded-xl border border-border bg-white p-5">
            <h2 className="font-semibold">SDK info</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <div className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
                  Project key
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <code className="font-mono text-sm">{project.key}</code>
                  <button
                    onClick={() => copy(project.key)}
                    className="text-xs text-text-tertiary transition-colors hover:text-text-primary"
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
              <div>
                <div className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
                  Apps reporting
                </div>
                <div className="mt-1 text-sm text-text-secondary">None yet</div>
              </div>
              <div>
                <div className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
                  Detected providers
                </div>
                <div className="mt-1 text-sm text-text-secondary">None yet</div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
