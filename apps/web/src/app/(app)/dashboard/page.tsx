'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useApp } from '@/components/app/app-context'
import { ProviderLogo } from '@/components/app/provider-logo'
import { capabilityLabel, getProvider, PROVIDER_CATALOG, PROVIDER_CATEGORIES, type ProviderCategory } from '@/lib/provider-catalog'

const Liveline = dynamic(() => import('liveline').then((m) => m.Liveline), {
  ssr: false,
  loading: () => <div className="h-[200px]" />,
})

type ConnectedProvider = {
  provider: string
  status: string
  balance: number | null
  creditLimit: number | null
  periodSpend: number | null
  lastPolledAt: string | null
  lastError: string | null
}

type SpendPoint = { time: number; value: number; provider: string }

type CreditSummary = {
  provider: string
  creditsRemaining: number
  creditsLimit: number | null
}

type OverviewData = {
  connectedProviders: ConnectedProvider[]
  totalPeriodSpend: number
  recentAlerts: number
  spendTimeline: SpendPoint[]
  creditSummary: CreditSummary[]
  hasData: boolean
}

function formatCurrency(value: number | null | undefined) {
  if (value == null) return '—'
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function spendRisk(provider: ConnectedProvider) {
  if (provider.balance != null && provider.balance <= 0) return { label: 'Blackout risk', className: 'bg-red/10 text-red' }
  if (provider.creditLimit && provider.balance != null) {
    const usedPct = ((provider.creditLimit - provider.balance) / provider.creditLimit) * 100
    if (usedPct >= 80) return { label: 'Low balance', className: 'bg-yellow/10 text-yellow' }
  }
  return { label: 'Healthy', className: 'bg-green/10 text-green' }
}

export default function SpendDashboard() {
  const { activeProject } = useApp()
  const [data, setData] = useState<OverviewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchOverview = (projectId: string) =>
    fetch(`/api/dashboard/overview?projectId=${projectId}`)
      .then((r) => r.json())
      .then((overview: OverviewData) => {
        setData(overview)
        return overview
      })

  useEffect(() => {
    if (!activeProject) return
    setLoading(true)
    fetchOverview(activeProject.id)
      .then((overview) => {
        const staleThreshold = Date.now() - 60 * 60 * 1000
        const stale = overview.connectedProviders.filter(
          (p) => p.lastPolledAt && new Date(p.lastPolledAt).getTime() < staleThreshold
        )
        if (stale.length > 0) {
          Promise.allSettled(
            stale.map((p) =>
              fetch('/api/connections/poll', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectId: activeProject.id, provider: p.provider }),
              })
            )
          ).then(() => fetchOverview(activeProject.id))
        }
      })
      .finally(() => setLoading(false))
  }, [activeProject?.id])

  const handleRefresh = () => {
    if (!activeProject || refreshing) return
    setRefreshing(true)
    const providers = data?.connectedProviders ?? []
    Promise.allSettled(
      providers.map((p) =>
        fetch('/api/connections/poll', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectId: activeProject.id, provider: p.provider }),
        })
      )
    )
      .then(() => fetchOverview(activeProject.id))
      .finally(() => setRefreshing(false))
  }

  const connected = data?.connectedProviders ?? []
  const errorCount = connected.filter((p) => p.status === 'error').length

  const totalRemainingCredits = useMemo(() => {
    const credits = data?.creditSummary ?? []
    if (credits.length === 0) return null
    return credits.reduce((sum, c) => sum + c.creditsRemaining, 0)
  }, [data])

  const totalTokenCredits = useMemo(() => {
    const credits = data?.creditSummary ?? []
    if (credits.length === 0) return null
    const aiCredits = credits.filter((c) => {
      const catalog = getProvider(c.provider)
      return catalog?.category === 'ai'
    })
    if (aiCredits.length === 0) return null
    return aiCredits.reduce((sum, c) => sum + c.creditsRemaining, 0)
  }, [data])

  const providerTimelines = useMemo(() => {
    const raw = data?.spendTimeline ?? []
    const byProvider = new Map<string, { time: number; value: number }[]>()
    for (const p of raw) {
      if (!byProvider.has(p.provider)) byProvider.set(p.provider, [])
      byProvider.get(p.provider)!.push({ time: p.time, value: p.value })
    }
    return byProvider
  }, [data])

  const [categoryFilter, setCategoryFilter] = useState<ProviderCategory | null>(null)

  const activeCategories = useMemo(() => {
    const cats = new Set<ProviderCategory>()
    for (const c of connected) {
      const catalog = getProvider(c.provider)
      if (catalog) cats.add(catalog.category)
    }
    return PROVIDER_CATEGORIES.filter((cat) => cats.has(cat.id))
  }, [connected])

  const filteredConnected = useMemo(() => {
    if (!categoryFilter) return connected
    return connected.filter((c) => {
      const catalog = getProvider(c.provider)
      return catalog?.category === categoryFilter
    })
  }, [connected, categoryFilter])

  const [spendWindow, setSpendWindow] = useState(604800)
  const spendWindowRef = useRef(spendWindow)
  spendWindowRef.current = spendWindow

  const { spendLive, currentSpend } = useMemo(() => {
    const raw = data?.spendTimeline ?? []
    if (raw.length === 0) return { spendLive: [], currentSpend: 0 }

    const byTime = new Map<number, number>()
    for (const p of raw) {
      byTime.set(p.time, (byTime.get(p.time) ?? 0) + p.value)
    }
    const points = Array.from(byTime.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([time, value]) => ({ time, value }))

    const now = Math.floor(Date.now() / 1000)
    const total = data?.totalPeriodSpend ?? points[points.length - 1]?.value ?? 0
    points.push({ time: now, value: total })

    return { spendLive: points, currentSpend: total }
  }, [data])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-accent" />
      </div>
    )
  }

  if (!data?.hasData && activeProject) {
    return (
      <div className="p-4 md:p-8">
        <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center text-center">
          <div className="mb-6 flex items-center gap-4">
            <ProviderLogo providerId="openai" size="lg" />
            <div className="h-px w-16 bg-border" />
            <img src="/icon.svg" alt="Delimiter" className="h-8 w-8" />
            <div className="h-px w-16 bg-border" />
            <ProviderLogo providerId="bedrock" size="lg" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Connect your first service</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-text-secondary">
            Delimiter monitors spend, usage, balances, and limits across AI providers, delivery APIs, financial services, and more.
            Add a dedicated read-only or reporting key to start syncing.
          </p>
          <div className="mt-8 grid w-full gap-3 sm:grid-cols-3">
            {PROVIDER_CATALOG.slice(0, 3).map((provider) => (
              <Link
                key={provider.id}
                href={`/dashboard/providers/${provider.id}`}
                className="rounded-xl border border-border bg-white p-4 text-left transition-colors hover:border-accent/30"
              >
                <ProviderLogo providerId={provider.id} />
                <div className="mt-3 text-sm font-medium">{provider.name}</div>
                <div className="mt-1 text-xs text-text-tertiary">{provider.capabilities.map(capabilityLabel).slice(0, 3).join(' · ')}</div>
              </Link>
            ))}
          </div>
          <Link
            href="/dashboard/providers"
            className="shine-hover mt-8 rounded-lg bg-text-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-text-primary/90"
          >
            View all services
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold">Spend</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Billing-period spend, balances, and limits across all connected services.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface hover:text-text-primary disabled:opacity-50"
          >
            <svg className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {refreshing ? 'Syncing...' : 'Refresh'}
          </button>
          <Link
            href="/dashboard/providers"
            className="rounded-lg bg-text-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-text-primary/90"
          >
            Add service
          </Link>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-5">
        <div className="rounded-xl border border-border bg-white p-4">
          <div className="text-xs font-medium text-text-tertiary">Period Spend</div>
          <div className="mt-2 text-2xl font-semibold tracking-tight">{formatCurrency(data?.totalPeriodSpend)}</div>
        </div>
        <div className="rounded-xl border border-border bg-white p-4">
          <div className="text-xs font-medium text-text-tertiary">Remaining Credits</div>
          <div className="mt-2 text-2xl font-semibold tracking-tight">{totalRemainingCredits != null ? formatCurrency(totalRemainingCredits) : '—'}</div>
        </div>
        <div className="rounded-xl border border-border bg-white p-4">
          <div className="text-xs font-medium text-text-tertiary">Token Credits</div>
          <div className="mt-2 text-2xl font-semibold tracking-tight">{totalTokenCredits != null ? formatCurrency(totalTokenCredits) : '—'}</div>
        </div>
        <div className="rounded-xl border border-border bg-white p-4">
          <div className="text-xs font-medium text-text-tertiary">Provider Errors</div>
          <div className={`mt-2 text-2xl font-semibold tracking-tight ${errorCount > 0 ? 'text-red' : ''}`}>{errorCount}</div>
        </div>
        <Link href="/dashboard/alerts" className="rounded-xl border border-border bg-white p-4 transition-colors hover:border-accent/30">
          <div className="text-xs font-medium text-text-tertiary">Alerts 24h</div>
          <div className={`mt-2 text-2xl font-semibold tracking-tight ${(data?.recentAlerts ?? 0) > 0 ? 'text-red' : ''}`}>
            {data?.recentAlerts ?? 0}
          </div>
        </Link>
      </div>

      {spendLive.length > 1 && (
        <div className="mb-6 rounded-xl border border-border bg-white p-5">
          <div className="mb-3 text-xs font-medium text-text-tertiary uppercase tracking-wide">Total Spend</div>
          <div className="h-[200px]">
            <Liveline
              data={spendLive}
              value={currentSpend}
              window={spendWindow}
              theme="light"
              color="#6366f1"
              grid
              badge={false}
              fill
              pulse
              momentum={false}
              scrub
              exaggerate
              formatValue={(v: number) => `$${v.toFixed(2)}`}
              formatTime={(t: number) => {
                const d = new Date(t * 1000)
                const w = spendWindowRef.current
                if (w <= 86400) return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
                return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
              }}
              windows={[
                { label: '1mo', secs: 2592000 },
                { label: '1w', secs: 604800 },
                { label: '1d', secs: 86400 },
                { label: '1h', secs: 3600 },
              ]}
              windowStyle="text"
              onWindowChange={(secs: number) => setSpendWindow(secs)}
              padding={{ top: 12, right: 60, bottom: 32, left: 12 }}
            />
          </div>
        </div>
      )}

      <div>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setCategoryFilter(null)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              categoryFilter === null
                ? 'bg-text-primary text-white'
                : 'bg-white border border-border text-text-secondary hover:bg-surface hover:text-text-primary'
            }`}
          >
            All
          </button>
          {activeCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(categoryFilter === cat.id ? null : cat.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                categoryFilter === cat.id
                  ? 'bg-text-primary text-white'
                  : 'bg-white border border-border text-text-secondary hover:bg-surface hover:text-text-primary'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filteredConnected.map((connection) => {
            const catalogProvider = getProvider(connection.provider)
            const timeline = providerTimelines.get(connection.provider) ?? []
            const risk = spendRisk(connection)
            const usedPct = connection.creditLimit && connection.balance != null
              ? Math.min(((connection.creditLimit - connection.balance) / connection.creditLimit) * 100, 100)
              : null

            return (
              <Link
                key={connection.provider}
                href={`/dashboard/providers/${connection.provider}`}
                className={`rounded-xl border bg-white p-5 transition-colors hover:border-accent/30 hover:shadow-sm ${
                  connection.status === 'error' ? 'border-red/25' : 'border-border'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <ProviderLogo providerId={connection.provider} />
                    <div>
                      <div className="text-sm font-semibold">{catalogProvider?.name ?? connection.provider}</div>
                      <div className="mt-1 text-[10px] text-text-tertiary">
                        {connection.lastPolledAt ? `Synced ${new Date(connection.lastPolledAt).toLocaleString()}` : 'Ready for first sync'}
                      </div>
                    </div>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${risk.className}`}>{risk.label}</span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-surface p-3">
                    <div className="text-[11px] font-medium text-text-tertiary">Period Spend</div>
                    <div className="mt-1 text-sm font-semibold">{formatCurrency(connection.periodSpend)}</div>
                  </div>
                  <div className="rounded-lg bg-surface p-3">
                    <div className="text-[11px] font-medium text-text-tertiary">Balance</div>
                    <div className="mt-1 text-sm font-semibold">{formatCurrency(connection.balance)}</div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-text-secondary">Credit usage</span>
                    <span className="text-text-tertiary">
                      {usedPct == null ? '—' : `${Math.round(usedPct)}% used`}
                    </span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-surface-elevated">
                    {usedPct != null && (
                      <div
                        className={`h-full rounded-full ${usedPct >= 90 ? 'bg-red' : usedPct >= 70 ? 'bg-yellow' : 'bg-green'}`}
                        style={{ width: `${usedPct}%` }}
                      />
                    )}
                  </div>
                </div>

                {timeline.length > 1 && (
                  <div className="mt-3 h-[32px]">
                    <Liveline
                      data={timeline}
                      value={connection.periodSpend ?? 0}
                      window={604800}
                      theme="light"
                      color={catalogProvider?.accent ?? '#6366f1'}
                      fill
                      pulse={false}
                      momentum={false}
                      scrub={false}
                      grid={false}
                      badge={false}
                      exaggerate
                      padding={{ top: 0, right: 4, bottom: 0, left: 4 }}
                    />
                  </div>
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
