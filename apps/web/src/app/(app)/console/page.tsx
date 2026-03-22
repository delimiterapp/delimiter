'use client'

import { useEffect, useState } from 'react'

type Project = { id: string; name: string; key: string }

export default function Console() {
  const [project, setProject] = useState<Project | null>(null)
  const [step, setStep] = useState(0)
  const [copied, setCopied] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [loading, setLoading] = useState(true)

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
        if (data?.projects?.[0]) {
          setProject(data.projects[0])
        }
        setLoading(false)
      })
  }, [])

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

  if (confirmed) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-green/10">
            <svg className="h-8 w-8 text-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">You&apos;re all set</h1>
          <p className="mt-2 text-text-secondary">
            Your SDK is configured. Data will appear on your dashboard as requests come in.
          </p>
          <a
            href="/dashboard"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-text-primary px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-text-primary/90"
          >
            Go to dashboard
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </a>
        </div>
      </div>
    )
  }

  const steps = [
    {
      title: 'Install the SDK',
      description: 'Add the delimiter SDK to your project.',
      code: 'npm install @delimiter/sdk',
      language: 'bash',
    },
    {
      title: 'Initialize with your project key',
      description: 'Add this to your app entry point.',
      code: `import { delimiter } from '@delimiter/sdk'

delimiter.init('${project?.key || 'dlm_...'}')`,
      language: 'typescript',
    },
    {
      title: 'Wrap your AI client',
      description: 'Wrap any supported provider — types are fully preserved.',
      code: `import OpenAI from 'openai'

const openai = delimiter.wrap(
  new OpenAI({ apiKey: process.env.OPENAI_KEY })
)

// Use openai as normal — delimiter monitors in the background`,
      language: 'typescript',
    },
  ]

  return (
    <div className="min-h-screen bg-surface">
      {/* Top bar */}
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-6">
          <a href="/" className="flex items-center">
            <img src="/logo.png" alt="delimiter" className="h-5" />
          </a>
          <div className="flex items-center gap-3 text-sm text-text-secondary">
            <span className="rounded-full bg-accent-light px-2.5 py-0.5 text-xs font-medium text-accent">
              Setup
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12">
        <div className="mb-2 text-sm font-medium text-accent">Getting started</div>
        <h1 className="text-2xl font-bold">Set up Delimiter SDK</h1>
        <p className="mt-2 text-text-secondary">
          Follow these steps to start monitoring your AI rate limits. Takes about 2 minutes.
        </p>

        {/* Project key card */}
        <div className="mt-8 rounded-xl border border-border bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
                Project key
              </div>
              <code className="mt-1 block font-mono text-sm">{project?.key || 'Loading...'}</code>
            </div>
            <button
              onClick={() => copy(project?.key || '')}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-surface"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Steps */}
        <div className="mt-8 space-y-6">
          {steps.map((s, i) => (
            <div
              key={i}
              className={`rounded-xl border bg-white transition-all ${
                i === step
                  ? 'border-accent shadow-sm'
                  : i < step
                    ? 'border-green/30 bg-green/[0.02]'
                    : 'border-border opacity-60'
              }`}
            >
              <div className="flex items-start gap-4 p-5">
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    i < step
                      ? 'bg-green text-white'
                      : i === step
                        ? 'bg-accent text-white'
                        : 'bg-surface text-text-tertiary'
                  }`}
                >
                  {i < step ? (
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{s.title}</h3>
                  <p className="mt-0.5 text-sm text-text-secondary">{s.description}</p>
                  {i <= step && (
                    <div className="mt-4 overflow-hidden rounded-lg border border-border bg-code-bg">
                      <div className="flex items-center justify-between border-b border-white/5 px-4 py-2">
                        <span className="font-mono text-xs text-white/40">{s.language}</span>
                        <button
                          onClick={() => copy(s.code)}
                          className="text-xs text-white/40 transition-colors hover:text-white/70"
                        >
                          {copied ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                      <pre className="overflow-x-auto p-4 font-mono text-sm leading-relaxed text-code-text">
                        {s.code}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
              {i === step && i < steps.length - 1 && (
                <div className="border-t border-border px-5 py-3">
                  <button
                    onClick={() => setStep(step + 1)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
                  >
                    Next step
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </button>
                </div>
              )}
              {i === step && i === steps.length - 1 && (
                <div className="border-t border-border px-5 py-3">
                  <button
                    onClick={() => setConfirmed(true)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-green px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green/90"
                  >
                    I&apos;ve added the SDK
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
