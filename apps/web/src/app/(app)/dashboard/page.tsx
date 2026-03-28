'use client'

import { useEffect, useState } from 'react'
import { useApp } from '@/components/app/app-context'
import { HealthRing } from '@/components/app/health-ring'
import { UsageBar } from '@/components/app/usage-bar'
import Link from 'next/link'

type ProviderData = {
  provider: string
  model: string | null
  limits: Record<string, number | null>
  requestsUsage: number | null
  tokensUsage: number | null
  overallUsage: number | null
}

type CreditSummary = {
  provider: string
  creditsRemaining: number
  creditsLimit: number | null
}

type OverviewData = {
  providers: ProviderData[]
  apps: string[]
  recentAlerts: number
  creditSummary: CreditSummary[]
  hasData: boolean
}

export default function OverviewPage() {
  const { activeProject } = useApp()
  const [data, setData] = useState<OverviewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!activeProject) return
    setLoading(true)
    fetch(`/api/dashboard/overview?projectId=${activeProject.id}`)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [activeProject?.id])

  function copy(text: string) {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-accent" />
      </div>
    )
  }

  // Empty state — onboarding
  if (!data?.hasData && activeProject) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="max-w-lg text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent-light">
            <svg className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold">Waiting for first event</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-text-secondary">
            Initialize the Delimiter SDK and make an AI API call. Rate limit data will appear here automatically.
          </p>

          <div className="mx-auto mt-6 max-w-md">
            <div className="overflow-hidden rounded-lg border border-border bg-code-bg text-left">
              <div className="flex items-center justify-between border-b border-white/5 px-4 py-2">
                <span className="font-mono text-xs text-white/40">Quick start</span>
                <button
                  onClick={() => copy(`import { delimiter } from '@delimiter/sdk'\ndelimiter.init('${activeProject.key}')`)}
                  className="text-xs text-white/40 transition-colors hover:text-white/70"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <pre className="overflow-x-auto p-4 font-mono text-sm leading-relaxed text-code-text">
{`import { delimiter } from '@delimiter/sdk'
delimiter.init('${activeProject.key}')`}
              </pre>
            </div>
          </div>

          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-surface px-3 py-1.5 text-xs text-text-tertiary">
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-yellow" />
            Waiting for first event...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Overview</h1>
        {data && data.recentAlerts > 0 && (
          <Link
            href="/dashboard/alerts"
            className="inline-flex items-center gap-1.5 rounded-lg bg-red/10 px-3 py-1.5 text-xs font-medium text-red"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            {data.recentAlerts} alert{data.recentAlerts > 1 ? 's' : ''} in 24h
          </Link>
        )}
      </div>

      {/* Credit balance banner */}
      {data?.creditSummary && data.creditSummary.length > 0 && (
        <Link
          href="/dashboard/spend"
          className="mb-6 flex items-center gap-4 rounded-xl border border-border bg-white p-4 transition-colors hover:border-accent/20"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-light">
            <svg className="h-4.5 w-4.5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
            </svg>
          </div>
          <div className="flex flex-1 items-center gap-6">
            {data.creditSummary.map((c) => {
              const pct = c.creditsLimit ? ((c.creditsLimit - c.creditsRemaining) / c.creditsLimit) * 100 : null
              const isLow = pct != null && pct >= 80
              return (
                <div key={c.provider} className="flex items-center gap-2">
                  <span className="text-xs font-medium capitalize text-text-secondary">{c.provider}</span>
                  <span className={`text-sm font-semibold ${isLow ? 'text-red' : ''}`}>
                    ${c.creditsRemaining.toFixed(2)}
                  </span>
                  {isLow && (
                    <span className="rounded-full bg-red/10 px-1.5 py-0.5 text-[10px] font-medium text-red">Low</span>
                  )}
                </div>
              )
            })}
          </div>
          <svg className="h-4 w-4 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </Link>
      )}

      {/* Provider health cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data?.providers.map((p) => {
          const limits = p.limits
          const reqUsed = limits.requests_limit && limits.requests_remaining != null
            ? limits.requests_limit - limits.requests_remaining
            : null

          const tokUsed = limits.tokens_limit && limits.tokens_remaining != null
            ? limits.tokens_limit - limits.tokens_remaining
            : null

          return (
            <Link
              key={p.provider}
              href={`/dashboard/providers?provider=${p.provider}`}
              className="group rounded-xl border border-border bg-white p-5 transition-colors hover:border-accent/20"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-sm font-medium capitalize">{p.provider}</span>
                  {p.model && (
                    <div className="mt-0.5 text-xs text-text-tertiary">{p.model}</div>
                  )}
                </div>
                <HealthRing percentage={p.overallUsage} size={56} strokeWidth={5} />
              </div>
              <div className="mt-4 space-y-2">
                <UsageBar
                  label="Requests / min"
                  current={reqUsed}
                  limit={limits.requests_limit ?? null}
                />
                <UsageBar
                  label="Tokens / min"
                  current={tokUsed}
                  limit={limits.tokens_limit ?? null}
                />
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
