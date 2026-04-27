'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useApp } from '@/components/app/app-context'
import { ProviderLogo } from '@/components/app/provider-logo'
import { capabilityLabel, getProvider, PROVIDER_CATALOG } from '@/lib/provider-catalog'

type ProviderKeyInfo = {
  provider: string
  status: string
  lastValidatedAt: string | null
}

type Connection = {
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
  return `$${value.toFixed(2)}`
}

export default function ProvidersPage() {
  const { activeProject } = useApp()
  const searchParams = useSearchParams()
  const selectedProviderId = searchParams.get('provider') ?? PROVIDER_CATALOG[0]?.id

  const [keys, setKeys] = useState<ProviderKeyInfo[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!activeProject) return
    setLoading(true)
    fetch(`/api/provider-keys?projectId=${activeProject.id}`)
      .then((response) => response.json())
      .then((data) => {
        setKeys(data.keys ?? [])
        setConnections(data.connections ?? [])
      })
      .finally(() => setLoading(false))
  }, [activeProject?.id])

  const keyMap = useMemo(() => new Map(keys.map((key) => [key.provider, key])), [keys])
  const connectionMap = useMemo(() => new Map(connections.map((connection) => [connection.provider, connection])), [connections])
  const selectedProvider = getProvider(selectedProviderId) ?? PROVIDER_CATALOG[0]
  const selectedKey = selectedProvider ? keyMap.get(selectedProvider.id) : null
  const selectedConnection = selectedProvider ? connectionMap.get(selectedProvider.id) : null

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-accent" />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col md:flex-row">
      <div className="shrink-0 border-b border-border bg-white p-3 md:w-64 md:border-b-0 md:border-r">
        <div className="mb-3 px-2 text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">Providers</div>
        <div className="space-y-1">
          {PROVIDER_CATALOG.map((provider) => {
            const connection = connectionMap.get(provider.id)
            const isConnected = connection?.status === 'connected'
            const isError = connection?.status === 'error' || keyMap.get(provider.id)?.status === 'invalid'
            const isActive = selectedProvider?.id === provider.id

            return (
              <Link
                key={provider.id}
                href={`/dashboard/providers?provider=${provider.id}`}
                className={`flex items-center gap-3 rounded-lg px-2.5 py-2 transition-colors ${
                  isActive ? 'bg-accent-light text-accent' : 'text-text-secondary hover:bg-surface hover:text-text-primary'
                }`}
              >
                <ProviderLogo providerId={provider.id} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{provider.name}</div>
                  <div className="text-[11px] text-text-tertiary">
                    {isError ? 'Needs attention' : isConnected ? 'Connected' : 'Not connected'}
                  </div>
                </div>
                <div className={`h-2 w-2 rounded-full ${isError ? 'bg-red' : isConnected ? 'bg-green' : 'bg-border'}`} />
              </Link>
            )
          })}
        </div>
      </div>

      <div className="flex-1 p-4 md:p-8">
        {!selectedProvider ? (
          <div className="flex h-full items-center justify-center text-sm text-text-tertiary">Select a provider</div>
        ) : (
          <div className="mx-auto max-w-4xl">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <ProviderLogo providerId={selectedProvider.id} size="lg" />
                <div>
                  <h1 className="text-lg font-semibold">{selectedProvider.name}</h1>
                  <p className="mt-1 max-w-2xl text-sm leading-6 text-text-secondary">{selectedProvider.description}</p>
                </div>
              </div>
              <Link
                href={`/dashboard/connections/${selectedProvider.id}`}
                className="rounded-lg bg-text-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-text-primary/90"
              >
                {selectedConnection?.status === 'connected' ? 'Manage connection' : 'Connect'}
              </Link>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-border bg-white p-4">
                <div className="text-xs font-medium text-text-tertiary">Status</div>
                <div className="mt-1 text-sm font-semibold">
                  {selectedConnection?.status === 'connected' ? 'Connected' : selectedKey?.status === 'invalid' ? 'Invalid key' : 'Not connected'}
                </div>
              </div>
              <div className="rounded-xl border border-border bg-white p-4">
                <div className="text-xs font-medium text-text-tertiary">Period Spend</div>
                <div className="mt-1 text-sm font-semibold">{formatCurrency(selectedConnection?.periodSpend ?? null)}</div>
              </div>
              <div className="rounded-xl border border-border bg-white p-4">
                <div className="text-xs font-medium text-text-tertiary">Balance</div>
                <div className="mt-1 text-sm font-semibold">{formatCurrency(selectedConnection?.balance ?? null)}</div>
              </div>
              <div className="rounded-xl border border-border bg-white p-4">
                <div className="text-xs font-medium text-text-tertiary">Last Sync</div>
                <div className="mt-1 truncate text-sm font-semibold">
                  {selectedConnection?.lastPolledAt ? new Date(selectedConnection.lastPolledAt).toLocaleString() : '—'}
                </div>
              </div>
            </div>

            {selectedConnection?.lastError && (
              <div className="mb-6 rounded-lg bg-red/5 px-4 py-3 text-sm text-red">{selectedConnection.lastError}</div>
            )}

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-border bg-white p-5">
                <h2 className="text-sm font-semibold">Supported signals</h2>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {selectedProvider.capabilities.map((capability) => (
                    <div key={capability} className="flex items-center gap-2 rounded-lg bg-surface px-3 py-2 text-sm text-text-secondary">
                      <svg className="h-4 w-4 text-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                      {capabilityLabel(capability)}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-white p-5">
                <h2 className="text-sm font-semibold">Rate limit model</h2>
                <p className="mt-3 text-sm leading-6 text-text-secondary">
                  Delimiter tracks configured provider limits and quota tiers from reporting APIs where available. Live per-minute remaining counters require request-path telemetry and are not shown as provider-account data.
                </p>
              </div>
            </div>

            {selectedProvider.statusNote && (
              <div className="mt-4 rounded-xl border border-yellow/20 bg-yellow/5 px-4 py-3 text-sm leading-6 text-text-secondary">
                {selectedProvider.statusNote}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
