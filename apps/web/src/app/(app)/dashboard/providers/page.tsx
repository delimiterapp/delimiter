'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useApp } from '@/components/app/app-context'
import { ProviderLogo } from '@/components/app/provider-logo'
import { capabilityLabel, getProvider, PROVIDER_CATALOG, PROVIDER_CATEGORIES, type ProviderCategory } from '@/lib/provider-catalog'

type ProviderKeyInfo = {
  id: string
  provider: string
  label: string | null
  status: string
  lastValidatedAt: string | null
}

type Connection = {
  id: string
  provider: string
  status: string
  lastPolledAt: string | null
  lastError: string | null
  balance: number | null
  creditLimit: number | null
  periodSpend: number | null
}

function formatCurrency(value: number | null): string {
  if (value == null) return '—'
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function ConnectionsPage() {
  const { activeProject } = useApp()
  const [keys, setKeys] = useState<ProviderKeyInfo[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [loading, setLoading] = useState(true)
  const [polling, setPolling] = useState<string | null>(null)

  async function refresh() {
    if (!activeProject) return
    const response = await fetch(`/api/provider-keys?projectId=${activeProject.id}`)
    const data = await response.json()
    setKeys(data.keys ?? [])
    setConnections(data.connections ?? [])
  }

  useEffect(() => {
    if (!activeProject) return
    setLoading(true)
    refresh().finally(() => setLoading(false))
  }, [activeProject?.id])

  async function handlePoll(providerId: string) {
    if (!activeProject) return
    setPolling(providerId)
    await fetch('/api/connections/poll', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId: activeProject.id, provider: providerId }),
    })
    await refresh()
    setPolling(null)
  }

  const [categoryFilter, setCategoryFilter] = useState<ProviderCategory | null>(null)

  const keyMap = useMemo(() => new Map(keys.map((key) => [key.provider, key])), [keys])
  const connectionMap = useMemo(() => new Map(connections.map((connection) => [connection.provider, connection])), [connections])
  const connectedCount = connections.filter((connection) => connection.status === 'connected').length

  const filteredCatalog = useMemo(() => {
    if (!categoryFilter) return PROVIDER_CATALOG
    return PROVIDER_CATALOG.filter((p) => p.category === categoryFilter)
  }, [categoryFilter])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-accent" />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold">Services</h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-text-secondary">
            Connect reporting credentials to monitor spend, usage, balances, and limits across AI, delivery, financial, and infrastructure services.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-white px-3 py-2 text-xs text-text-secondary">
          <span className="font-medium text-text-primary">{connectedCount}</span> connected
        </div>
      </div>

      <div className="mb-6 flex items-start gap-3 rounded-xl border border-accent/20 bg-accent-light px-4 py-3">
        <svg className="mt-0.5 h-4 w-4 shrink-0 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
        </svg>
        <div className="text-xs leading-5 text-accent">
          <span className="font-medium">Use dedicated read-only or reporting keys where the provider supports them.</span> Credentials are encrypted at rest and used only for provider monitoring APIs.
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
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
        {PROVIDER_CATEGORIES.map((cat) => (
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
        {filteredCatalog.map((provider) => {
          const key = keyMap.get(provider.id)
          const connection = connectionMap.get(provider.id)
          const isConnected = key?.status === 'valid' && connection?.status === 'connected'
          const isError = key?.status === 'invalid' || connection?.status === 'error'

          return (
            <Link
              key={provider.id}
              href={`/dashboard/providers/${provider.id}`}
              className={`block rounded-xl border bg-white p-5 transition-colors hover:border-accent/40 hover:shadow-sm ${
                isError ? 'border-red/25' : isConnected ? 'border-green/25' : 'border-border'
              }`}
            >
              <div className="flex items-start gap-4">
                <ProviderLogo providerId={provider.id} size="lg" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-sm font-semibold">{provider.name}</h2>
                    {isConnected && (
                      <span className="rounded-full bg-green/10 px-2 py-0.5 text-[10px] font-medium text-green">Connected</span>
                    )}
                    {isError && (
                      <span className="rounded-full bg-red/10 px-2 py-0.5 text-[10px] font-medium text-red">Needs attention</span>
                    )}
                  </div>
                  <p className="mt-1 text-xs leading-5 text-text-secondary">{provider.description}</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {provider.capabilities.map((capability) => (
                  <span key={capability} className="rounded-full bg-surface px-2 py-0.5 text-[10px] font-medium text-text-tertiary">
                    {capabilityLabel(capability)}
                  </span>
                ))}
              </div>

              {connection && (
                <div className="mt-4 grid grid-cols-3 gap-3 border-t border-border pt-4">
                  <div>
                    <div className="text-[11px] font-medium text-text-tertiary">Spend</div>
                    <div className="mt-0.5 text-sm font-semibold">{formatCurrency(connection.periodSpend)}</div>
                  </div>
                  <div>
                    <div className="text-[11px] font-medium text-text-tertiary">Balance</div>
                    <div className="mt-0.5 text-sm font-semibold">{formatCurrency(connection.balance)}</div>
                  </div>
                  <div>
                    <div className="text-[11px] font-medium text-text-tertiary">Last Sync</div>
                    <div className="mt-0.5 truncate text-xs text-text-secondary">
                      {connection.lastPolledAt ? new Date(connection.lastPolledAt).toLocaleString() : 'Pending'}
                    </div>
                  </div>
                  {connection.lastError && (
                    <div className="col-span-3 rounded-lg bg-red/5 px-3 py-2 text-xs text-red">{connection.lastError}</div>
                  )}
                </div>
              )}

              {provider.statusNote && !connection?.periodSpend && !connection?.balance && (
                <div className="mt-4 rounded-lg bg-surface px-3 py-2 text-xs leading-5 text-text-secondary">
                  {provider.statusNote}
                </div>
              )}

              <div className="mt-5 flex flex-wrap gap-2">
                {isConnected ? (
                  <>
                    <span className="rounded-lg border border-border px-4 py-2 text-xs font-medium text-text-secondary">
                      Manage
                    </span>
                    <button
                      onClick={(e) => { e.preventDefault(); handlePoll(provider.id) }}
                      disabled={polling === provider.id}
                      className="rounded-lg border border-border px-4 py-2 text-xs font-medium text-text-secondary transition-colors hover:bg-surface disabled:opacity-50"
                    >
                      {polling === provider.id ? 'Syncing...' : 'Sync now'}
                    </button>
                  </>
                ) : (
                  <span className="rounded-lg bg-text-primary px-4 py-2 text-xs font-medium text-white">
                    Connect
                  </span>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
