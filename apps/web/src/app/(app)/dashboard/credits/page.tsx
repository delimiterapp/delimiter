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

type ConnectedProvider = {
  provider: string
  balance: number | null
  creditLimit: number | null
  periodSpend: number | null
  periodStart: string | null
  lastPolledAt: string | null
  source: 'billing-api'
}

type CreditsData = {
  providers: ProviderCredit[]
  connectedProviders: ConnectedProvider[]
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
            Credit balance monitoring works two ways: automatically from SDK response headers,
            or by connecting your provider accounts for billing API access.
          </p>
          <a
            href="/dashboard/connections"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
            </svg>
            Connect providers for balance monitoring
          </a>
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

      {/* Connected provider balances (from billing APIs) */}
      {data.connectedProviders && data.connectedProviders.length > 0 && (
        <div className="mb-6">
          <div className="mb-3 flex items-center gap-2">
            <h2 className="text-sm font-medium text-text-secondary">Connected Providers</h2>
            <span className="rounded-full bg-accent-light px-2 py-0.5 text-[10px] font-medium text-accent">
              via billing API
            </span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.connectedProviders.map((c) => {
              const pct = c.creditLimit && c.balance != null
                ? ((c.creditLimit - c.balance) / c.creditLimit) * 100
                : null
              const isLow = pct != null && pct >= 80
              const isDepleted = c.balance != null && c.balance <= 0

              return (
                <div
                  key={c.provider}
                  className={`rounded-xl border p-4 ${isDepleted ? 'border-red/30 bg-red/5' : isLow ? 'border-yellow/30 bg-yellow/5' : 'border-border bg-white'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium capitalize">{c.provider}</span>
                    {isDepleted && (
                      <span className="rounded-full bg-red/10 px-2 py-0.5 text-[10px] font-bold text-red">BLACKOUT RISK</span>
                    )}
                    {isLow && !isDepleted && (
                      <span className="rounded-full bg-yellow/10 px-2 py-0.5 text-[10px] font-bold text-yellow">LOW</span>
                    )}
                  </div>
                  <div className="mt-2">
                    {c.balance != null && (
                      <div className="text-lg font-bold">{formatCurrency(c.balance)}</div>
                    )}
                    {c.periodSpend != null && (
                      <div className="text-xs text-text-tertiary">
                        {formatCurrency(c.periodSpend)} spent this period
                      </div>
                    )}
                  </div>
                  {c.lastPolledAt && (
                    <div className="mt-2 text-[10px] text-text-tertiary">
                      Updated {new Date(c.lastPolledAt).toLocaleString()}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* SDK credit data (from response headers) */}
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
