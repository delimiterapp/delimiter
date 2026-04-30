'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useApp } from '@/components/app/app-context'
import { ProviderLogo } from '@/components/app/provider-logo'
import { capabilityLabel, getProvider, PROVIDER_CATALOG } from '@/lib/provider-catalog'

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

type OverviewData = {
  connectedProviders: ConnectedProvider[]
  totalPeriodSpend: number
  recentAlerts: number
  spendTimeline: SpendPoint[]
  hasData: boolean
}

function formatCurrency(value: number | null | undefined) {
  if (value == null) return '—'
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function OverviewPage() {
  const { activeProject } = useApp()
  const [data, setData] = useState<OverviewData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!activeProject) return
    setLoading(true)
    fetch(`/api/dashboard/overview?projectId=${activeProject.id}`)
      .then((response) => response.json())
      .then((overview: OverviewData) => {
        setData(overview)

        // Auto-poll stale providers (last sync > 1 hour ago)
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
          ).then(() =>
            fetch(`/api/dashboard/overview?projectId=${activeProject.id}`)
              .then((r) => r.json())
              .then(setData)
          )
        }
      })
      .finally(() => setLoading(false))
  }, [activeProject?.id])

  const connected = data?.connectedProviders ?? []
  const connectedIds = useMemo(() => new Set(connected.map((provider) => provider.provider)), [connected])
  const nextProviders = PROVIDER_CATALOG.filter((provider) => !connectedIds.has(provider.id)).slice(0, 3)
  const connectedCount = connected.length
  const errorCount = connected.filter((provider) => provider.status === 'error').length

  // Per-provider spend timelines for sparklines
  const providerTimelines = useMemo(() => {
    const raw = data?.spendTimeline ?? []
    const byProvider = new Map<string, { time: number; value: number }[]>()
    for (const p of raw) {
      if (!byProvider.has(p.provider)) byProvider.set(p.provider, [])
      byProvider.get(p.provider)!.push({ time: p.time, value: p.value })
    }
    return byProvider
  }, [data])

  // Aggregate spend timeline: sum all providers into a single series
  const [spendWindow, setSpendWindow] = useState(604800)
  const spendWindowRef = useRef(spendWindow)
  spendWindowRef.current = spendWindow

  const { spendLive, currentSpend } = useMemo(() => {
    const raw = data?.spendTimeline ?? []
    if (raw.length === 0) return { spendLive: [], currentSpend: 0 }

    // Group by timestamp, sum across providers
    const byTime = new Map<number, number>()
    for (const p of raw) {
      byTime.set(p.time, (byTime.get(p.time) ?? 0) + p.value)
    }
    const points = Array.from(byTime.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([time, value]) => ({ time, value }))

    // Push a "now" point with total period spend
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
          <h1 className="text-2xl font-semibold tracking-tight">Connect your first AI provider</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-text-secondary">
            Delimiter monitors AI API spend, usage, balances, and configured rate limits from provider reporting APIs.
            Add a dedicated read-only or admin reporting key to start syncing.
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
            View all providers
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold">Overview</h1>
          <p className="mt-1 text-sm text-text-secondary">
            AI spend, usage, and configured limits across connected providers.
          </p>
        </div>
        <Link
          href="/dashboard/providers"
          className="rounded-lg bg-text-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-text-primary/90"
        >
          Add provider
        </Link>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-4">
        <div className="rounded-xl border border-border bg-white p-4">
          <div className="text-xs font-medium text-text-tertiary">Period Spend</div>
          <div className="mt-2 text-2xl font-semibold tracking-tight">{formatCurrency(data?.totalPeriodSpend)}</div>
        </div>
        <div className="rounded-xl border border-border bg-white p-4">
          <div className="text-xs font-medium text-text-tertiary">Connected Providers</div>
          <div className="mt-2 text-2xl font-semibold tracking-tight">{connectedCount}</div>
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
        <div className="mb-3 text-sm font-medium text-text-secondary">Providers</div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {PROVIDER_CATALOG.map((catalogProvider) => {
            const connection = connected.find((c) => c.provider === catalogProvider.id)
            const timeline = providerTimelines.get(catalogProvider.id) ?? []
            const isConnected = connection && connection.status !== 'error'
            const isError = connection?.status === 'error'

            return (
              <Link
                key={catalogProvider.id}
                href={`/dashboard/providers/${catalogProvider.id}`}
                className={`rounded-xl border bg-white p-4 transition-colors hover:border-accent/40 hover:shadow-sm ${
                  isError ? 'border-red/25' : isConnected ? 'border-border' : 'border-dashed border-border'
                }`}
              >
                <div className="flex items-start gap-3">
                  <ProviderLogo providerId={catalogProvider.id} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="truncate text-sm font-medium">{catalogProvider.name}</div>
                      {isConnected && (
                        <span className="rounded-full bg-green/10 px-2 py-0.5 text-[10px] font-medium text-green">Connected</span>
                      )}
                      {isError && (
                        <span className="rounded-full bg-red/10 px-2 py-0.5 text-[10px] font-medium text-red">Error</span>
                      )}
                    </div>
                  </div>
                </div>
                {connection ? (
                  <>
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-[11px] font-medium text-text-tertiary">Period Spend</div>
                        <div className="mt-0.5 text-sm font-semibold">{formatCurrency(connection.periodSpend)}</div>
                      </div>
                      <div>
                        <div className="text-[11px] font-medium text-text-tertiary">Balance</div>
                        <div className="mt-0.5 text-sm font-semibold">{formatCurrency(connection.balance)}</div>
                      </div>
                    </div>
                    {timeline.length > 1 && (
                      <div className="mt-3 h-[32px]">
                        <Liveline
                          data={timeline}
                          value={connection.periodSpend ?? 0}
                          window={604800}
                          theme="light"
                          color={catalogProvider.accent}
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
                    <div className="mt-2 text-[10px] text-text-tertiary">
                      {connection.lastPolledAt ? `Synced ${new Date(connection.lastPolledAt).toLocaleString()}` : 'Ready for first sync'}
                    </div>
                  </>
                ) : (
                  <p className="mt-3 text-xs text-text-tertiary">{catalogProvider.description}</p>
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
