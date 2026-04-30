'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useApp } from '@/components/app/app-context'
import { ProviderLogo } from '@/components/app/provider-logo'
import { getProvider } from '@/lib/provider-catalog'

type ConnectedProvider = {
  provider: string
  balance: number | null
  creditLimit: number | null
  periodSpend: number | null
  periodStart: string | null
  lastPolledAt: string | null
  source: 'billing-api'
}

type SpendData = {
  connectedProviders: ConnectedProvider[]
  creditAlerts: number
  hasData: boolean
}

function formatCurrency(value: number | null | undefined): string {
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

export default function SpendPage() {
  const { activeProject } = useApp()
  const [data, setData] = useState<SpendData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!activeProject) return
    setLoading(true)
    fetch(`/api/dashboard/spend?projectId=${activeProject.id}`)
      .then((response) => response.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [activeProject?.id])

  const connected = data?.connectedProviders ?? []
  const totalSpend = useMemo(
    () => connected.reduce((sum, provider) => sum + (provider.periodSpend ?? 0), 0),
    [connected],
  )
  const knownBalances = connected.filter((provider) => provider.balance != null)
  const totalBalance = knownBalances.reduce((sum, provider) => sum + (provider.balance ?? 0), 0)

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
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold">No spend data yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-text-secondary">
            Connect provider reporting credentials to sync spend, balances, and billing-period usage.
          </p>
          <Link
            href="/dashboard/connections"
            className="mt-6 inline-flex rounded-lg bg-text-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-text-primary/90"
          >
            Connect providers
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
          <p className="mt-1 text-sm text-text-secondary">Billing-period spend and balances from connected provider accounts.</p>
        </div>
        <Link href="/dashboard/connections" className="rounded-lg bg-text-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-text-primary/90">
          Add provider
        </Link>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-4">
        <div className="rounded-xl border border-border bg-white p-4">
          <div className="text-xs font-medium text-text-tertiary">Period Spend</div>
          <div className="mt-2 text-2xl font-semibold tracking-tight">{formatCurrency(totalSpend)}</div>
        </div>
        <div className="rounded-xl border border-border bg-white p-4">
          <div className="text-xs font-medium text-text-tertiary">Known Balance</div>
          <div className="mt-2 text-2xl font-semibold tracking-tight">{knownBalances.length ? formatCurrency(totalBalance) : '—'}</div>
        </div>
        <div className="rounded-xl border border-border bg-white p-4">
          <div className="text-xs font-medium text-text-tertiary">Connected Providers</div>
          <div className="mt-2 text-2xl font-semibold tracking-tight">{connected.length}</div>
        </div>
        <Link href="/dashboard/alerts" className="rounded-xl border border-border bg-white p-4 transition-colors hover:border-accent/30">
          <div className="text-xs font-medium text-text-tertiary">Spend Alerts 24h</div>
          <div className={`mt-2 text-2xl font-semibold tracking-tight ${(data.creditAlerts ?? 0) > 0 ? 'text-red' : ''}`}>
            {data.creditAlerts ?? 0}
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {connected.map((connection) => {
          const provider = getProvider(connection.provider)
          const risk = spendRisk(connection)
          const usedPct = connection.creditLimit && connection.balance != null
            ? Math.min(((connection.creditLimit - connection.balance) / connection.creditLimit) * 100, 100)
            : null

          return (
            <Link
              key={connection.provider}
              href={`/dashboard/connections/${connection.provider}`}
              className="rounded-xl border border-border bg-white p-5 transition-colors hover:border-accent/30"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <ProviderLogo providerId={connection.provider} />
                  <div>
                    <h2 className="text-sm font-semibold">{provider?.name ?? connection.provider}</h2>
                    <p className="mt-1 text-xs text-text-tertiary">
                      {connection.lastPolledAt ? `Synced ${new Date(connection.lastPolledAt).toLocaleString()}` : 'Ready for first sync'}
                    </p>
                  </div>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${risk.className}`}>{risk.label}</span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
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
            </Link>
          )
        })}
      </div>
    </div>
  )
}
