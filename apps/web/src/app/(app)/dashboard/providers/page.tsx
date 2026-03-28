'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useApp } from '@/components/app/app-context'
import { HealthRing } from '@/components/app/health-ring'
import { UsageBar } from '@/components/app/usage-bar'

type ProviderDetail = {
  provider: string
  latest: { limits: Record<string, number | null>; model: string | null; timestamp: string } | null
  timeline: Array<{ time: string; requestsUsage: number | null; tokensUsage: number | null }>
  models: Array<{ model: string; count: number }>
  totalReports: number
}

type OverviewProvider = {
  provider: string
  overallUsage: number
}

export default function ProvidersPage() {
  const { activeProject } = useApp()
  const searchParams = useSearchParams()
  const selectedProvider = searchParams.get('provider')

  const [providers, setProviders] = useState<OverviewProvider[]>([])
  const [detail, setDetail] = useState<ProviderDetail | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch provider list
  useEffect(() => {
    if (!activeProject) return
    fetch(`/api/dashboard/overview?projectId=${activeProject.id}`)
      .then((r) => r.json())
      .then((data) => {
        setProviders(data.providers || [])
        setLoading(false)
      })
  }, [activeProject?.id])

  // Fetch provider detail
  useEffect(() => {
    if (!activeProject || !selectedProvider) { setDetail(null); return }
    fetch(`/api/dashboard/providers/${selectedProvider}?projectId=${activeProject.id}`)
      .then((r) => r.json())
      .then(setDetail)
  }, [activeProject?.id, selectedProvider])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-accent" />
      </div>
    )
  }

  if (providers.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center">
          <p className="text-sm text-text-secondary">No providers detected yet.</p>
          <p className="mt-1 text-xs text-text-tertiary">Providers will appear here once the SDK reports data.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col md:flex-row">
      {/* Provider list */}
      <div className={`shrink-0 border-b border-border bg-white p-3 md:w-52 md:border-b-0 md:border-r ${selectedProvider ? 'hidden md:block' : ''}`}>
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">
          Providers
        </div>
        <ul className="flex flex-wrap gap-1 md:flex-col md:gap-0 md:space-y-0.5">
          {providers.map((p) => {
            const isActive = selectedProvider === p.provider
            const color =
              p.overallUsage >= 80 ? 'bg-red' :
              p.overallUsage >= 50 ? 'bg-yellow' :
              'bg-green'

            return (
              <li key={p.provider}>
                <a
                  href={`/dashboard/providers?provider=${p.provider}`}
                  className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] transition-colors ${
                    isActive
                      ? 'bg-accent-light font-medium text-accent'
                      : 'text-text-secondary hover:bg-surface hover:text-text-primary'
                  }`}
                >
                  <div className={`h-2 w-2 rounded-full ${color}`} />
                  <span className="capitalize">{p.provider}</span>
                </a>
              </li>
            )
          })}
        </ul>
      </div>

      {/* Detail panel */}
      <div className="flex-1 p-4 md:p-8">
        {!selectedProvider ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-text-tertiary">Select a provider to view details</p>
          </div>
        ) : !detail ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-accent" />
          </div>
        ) : !detail.latest ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-text-tertiary">No data for {selectedProvider} yet</p>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <a href="/dashboard/providers" className="mb-2 inline-flex items-center gap-1 text-xs text-text-tertiary hover:text-text-primary md:hidden">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
                All providers
              </a>
              <div className="flex items-center gap-4">
                <h1 className="text-lg font-semibold capitalize">{detail.provider}</h1>
                <span className="text-xs text-text-tertiary">{detail.totalReports} reports in 24h</span>
              </div>
            </div>

            {/* Usage overview */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-xl border border-border bg-white p-5">
                <h2 className="mb-4 text-sm font-medium">Current Usage</h2>
                <div className="flex items-center gap-6">
                  <HealthRing
                    percentage={
                      detail.latest.limits.requests_limit && detail.latest.limits.requests_remaining != null
                        ? ((detail.latest.limits.requests_limit - detail.latest.limits.requests_remaining) / detail.latest.limits.requests_limit) * 100
                        : 0
                    }
                    size={80}
                  />
                  <div className="flex-1 space-y-3">
                    <UsageBar
                      label="Requests / min"
                      current={detail.latest.limits.requests_limit && detail.latest.limits.requests_remaining != null ? detail.latest.limits.requests_limit - detail.latest.limits.requests_remaining : null}
                      limit={detail.latest.limits.requests_limit ?? null}
                    />
                    <UsageBar
                      label="Tokens / min"
                      current={detail.latest.limits.tokens_limit && detail.latest.limits.tokens_remaining != null ? detail.latest.limits.tokens_limit - detail.latest.limits.tokens_remaining : null}
                      limit={detail.latest.limits.tokens_limit ?? null}
                    />
                  </div>
                </div>
                {detail.latest.limits.reset_requests_ms != null && (
                  <div className="mt-3 text-xs text-text-tertiary">
                    Requests reset in {Math.round(detail.latest.limits.reset_requests_ms / 1000)}s
                    {detail.latest.limits.reset_tokens_ms != null && (
                      <> · Tokens reset in {Math.round(detail.latest.limits.reset_tokens_ms / 1000)}s</>
                    )}
                  </div>
                )}
              </div>

              {/* Models */}
              <div className="rounded-xl border border-border bg-white p-5">
                <h2 className="mb-4 text-sm font-medium">Models</h2>
                {detail.models.length === 0 ? (
                  <p className="text-xs text-text-tertiary">No model data</p>
                ) : (
                  <div className="space-y-2">
                    {detail.models.map((m) => (
                      <div key={m.model} className="flex items-center justify-between text-sm">
                        <code className="font-mono text-xs">{m.model}</code>
                        <span className="text-xs text-text-tertiary">{m.count} calls</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div className="mt-6 rounded-xl border border-border bg-white p-5">
              <h2 className="mb-4 text-sm font-medium">24-hour Timeline</h2>
              <div className="flex h-24 items-end gap-px">
                {detail.timeline.map((bucket, i) => {
                  const val = bucket.requestsUsage ?? bucket.tokensUsage ?? 0
                  const color =
                    val >= 80 ? 'bg-red' :
                    val >= 50 ? 'bg-yellow' :
                    val > 0 ? 'bg-green' :
                    'bg-surface-elevated'
                  return (
                    <div
                      key={i}
                      className={`flex-1 rounded-t-sm transition-all ${color}`}
                      style={{ height: `${Math.max(val > 0 ? val : 2, 2)}%` }}
                      title={`${new Date(bucket.time).toLocaleTimeString()} — ${val > 0 ? `${Math.round(val)}%` : 'no data'}`}
                    />
                  )
                })}
              </div>
              <div className="mt-2 flex justify-between text-[10px] text-text-tertiary">
                <span>24h ago</span>
                <span>Now</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
