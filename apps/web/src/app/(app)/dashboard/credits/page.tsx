'use client'

import { useEffect, useState } from 'react'
import { useApp } from '@/components/app/app-context'
import { HealthRing } from '@/components/app/health-ring'

type CreditTimeline = { time: string; balance: number }

type ProviderCredit = {
  provider: string
  creditsLimit: number | null
  creditsRemaining: number | null
  lastRequestCost: number | null
  balanceUsedPct: number | null
  spend24h: number
  requests24h: number
  burnRatePerHour: number
  hoursUntilDepleted: number | null
  lastUpdated: string
  timeline: CreditTimeline[]
}

type CreditsData = {
  providers: ProviderCredit[]
  creditAlerts: number
  hasData: boolean
}

function formatCurrency(n: number | null): string {
  if (n == null) return '—'
  return `$${n.toFixed(2)}`
}

function formatDuration(hours: number | null): string {
  if (hours == null) return '—'
  if (hours < 1) return `${Math.round(hours * 60)}m`
  if (hours < 24) return `${Math.round(hours)}h`
  const days = Math.round(hours / 24)
  return `${days}d`
}

function BalanceBar({ used, total }: { used: number | null; total: number | null }) {
  const hasData = used != null && total != null && total > 0
  const pct = hasData ? (used / total) * 100 : 0

  const color =
    pct >= 90 ? 'bg-red' :
    pct >= 70 ? 'bg-yellow' :
    'bg-green'

  return (
    <div className="mt-2">
      <div className="flex justify-between text-xs">
        <span className="text-text-secondary">Balance</span>
        <span className="text-text-tertiary">
          {hasData
            ? `${formatCurrency(total - used)} remaining of ${formatCurrency(total)}`
            : '— / —'}
        </span>
      </div>
      <div className="mt-1 h-2 rounded-full bg-surface-elevated">
        {hasData && (
          <div
            className={`h-full rounded-full transition-all duration-500 ${color}`}
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        )}
      </div>
    </div>
  )
}

function SparklineChart({ data }: { data: CreditTimeline[] }) {
  if (data.length < 2) return null

  const values = data.map((d) => d.balance)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1

  const width = 280
  const height = 60
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - ((d.balance - min) / range) * (height - 4) - 2
    return `${x},${y}`
  })

  return (
    <div className="mt-3">
      <div className="text-[11px] font-medium text-text-tertiary mb-1">24h Balance Trend</div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-12" preserveAspectRatio="none">
        <polyline
          points={points.join(' ')}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}

function DepletionIndicator({ hours }: { hours: number | null }) {
  if (hours == null) return null

  const color =
    hours <= 24 ? 'bg-red/10 text-red' :
    hours <= 72 ? 'bg-yellow/10 text-yellow' :
    'bg-green/10 text-green'

  const label = hours <= 0 ? 'Depleted' : `~${formatDuration(hours)} remaining`

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${color}`}>
      {hours <= 24 && (
        <svg className="mr-1 h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      )}
      {label}
    </span>
  )
}

export default function CreditsPage() {
  const { activeProject } = useApp()
  const [data, setData] = useState<CreditsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!activeProject) return
    setLoading(true)
    fetch(`/api/dashboard/credits?projectId=${activeProject.id}`)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [activeProject?.id])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-accent" />
      </div>
    )
  }

  if (!data?.hasData) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="max-w-lg text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent-light">
            <svg className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold">No credit data yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-text-secondary">
            Credit balance tracking activates automatically when your AI provider includes
            balance or cost headers in API responses. Providers like OpenRouter expose this data by default.
          </p>
          <div className="mt-6 rounded-lg border border-border bg-surface p-4 text-left text-sm">
            <div className="font-medium text-text-primary mb-2">Supported providers</div>
            <ul className="space-y-1 text-text-secondary text-xs">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-green" />
                <span className="font-medium">OpenRouter</span> — credit balance + per-request cost
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-text-tertiary" />
                <span>More providers coming as they add cost headers</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Credits</h1>
        {data.creditAlerts > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-red/10 px-3 py-1.5 text-xs font-medium text-red">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            {data.creditAlerts} balance alert{data.creditAlerts > 1 ? 's' : ''} in 24h
          </span>
        )}
      </div>

      {/* Provider credit cards */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {data.providers.map((p) => {
          const spent = p.creditsLimit && p.creditsRemaining != null
            ? p.creditsLimit - p.creditsRemaining
            : null

          return (
            <div
              key={p.provider}
              className="rounded-xl border border-border bg-white p-5"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-sm font-medium capitalize">{p.provider}</span>
                  <div className="mt-0.5 text-xs text-text-tertiary">
                    Updated {new Date(p.lastUpdated).toLocaleString()}
                  </div>
                </div>
                <HealthRing percentage={p.balanceUsedPct} size={56} strokeWidth={5} />
              </div>

              {/* Balance bar */}
              <BalanceBar used={spent} total={p.creditsLimit} />

              {/* Stats grid */}
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-surface p-2.5">
                  <div className="text-[11px] font-medium text-text-tertiary">Remaining</div>
                  <div className="mt-0.5 text-sm font-semibold">{formatCurrency(p.creditsRemaining)}</div>
                </div>
                <div className="rounded-lg bg-surface p-2.5">
                  <div className="text-[11px] font-medium text-text-tertiary">24h Spend</div>
                  <div className="mt-0.5 text-sm font-semibold">{formatCurrency(p.spend24h)}</div>
                </div>
                <div className="rounded-lg bg-surface p-2.5">
                  <div className="text-[11px] font-medium text-text-tertiary">Burn Rate</div>
                  <div className="mt-0.5 text-sm font-semibold">
                    {p.burnRatePerHour > 0 ? `${formatCurrency(p.burnRatePerHour)}/hr` : '—'}
                  </div>
                </div>
              </div>

              {/* Depletion estimate + request stats */}
              <div className="mt-3 flex items-center justify-between">
                <DepletionIndicator hours={p.hoursUntilDepleted} />
                <span className="text-xs text-text-tertiary">
                  {p.requests24h > 0 ? `${p.requests24h.toLocaleString()} requests in 24h` : ''}
                  {p.lastRequestCost != null ? ` · last: ${formatCurrency(p.lastRequestCost)}` : ''}
                </span>
              </div>

              {/* Sparkline */}
              <SparklineChart data={p.timeline} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
