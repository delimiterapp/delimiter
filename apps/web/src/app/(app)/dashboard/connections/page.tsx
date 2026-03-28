'use client'

import { useEffect, useState } from 'react'
import { useApp } from '@/components/app/app-context'

type SupportedProvider = {
  id: string
  name: string
  pipedreamApp: string
  keyType: string
  keyHint: string
  capabilities: string[]
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

type ConnectionsData = {
  connections: Connection[]
  supportedProviders: SupportedProvider[]
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    connected: 'bg-green/10 text-green',
    error: 'bg-red/10 text-red',
    disconnected: 'bg-border text-text-tertiary',
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colors[status] || colors.disconnected}`}>
      {status}
    </span>
  )
}

function formatCurrency(n: number | null): string {
  if (n == null) return '—'
  return `$${n.toFixed(2)}`
}

export default function ConnectionsPage() {
  const { activeProject } = useApp()
  const [data, setData] = useState<ConnectionsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [polling, setPolling] = useState<string | null>(null)
  const [disconnecting, setDisconnecting] = useState<string | null>(null)
  const [connecting, setConnecting] = useState<string | null>(null)

  useEffect(() => {
    if (!activeProject) return
    setLoading(true)
    fetch(`/api/connections?projectId=${activeProject.id}`)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [activeProject?.id])

  async function connectProvider(_providerId: string) {
    // Pipedream Connect integration coming soon.
    // When ready, this will open Pipedream's embedded auth popup:
    // client.connectAccount({ app: provider.pipedreamApp })
  }

  async function disconnectProvider(providerId: string) {
    if (!activeProject) return
    setDisconnecting(providerId)

    await fetch('/api/connections', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId: activeProject.id,
        provider: providerId,
      }),
    })

    const res = await fetch(`/api/connections?projectId=${activeProject.id}`)
    const updated = await res.json()
    setData(updated)
    setDisconnecting(null)
  }

  async function pollProvider(providerId: string) {
    if (!activeProject) return
    setPolling(providerId)

    await fetch('/api/connections/poll', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId: activeProject.id,
        provider: providerId,
      }),
    })

    const res = await fetch(`/api/connections?projectId=${activeProject.id}`)
    const updated = await res.json()
    setData(updated)
    setPolling(null)
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-accent" />
      </div>
    )
  }

  const connectedMap = new Map(
    (data?.connections ?? []).map((c) => [c.provider, c])
  )

  return (
    <div className="p-8">
      <div className="mb-2">
        <h1 className="text-lg font-semibold">Connect Providers</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Connect your AI provider accounts to monitor credit balances and prevent blackouts from depleted funds.
          Delimiter never stores your credentials — authentication is handled securely via Pipedream Connect.
        </p>
      </div>

      {/* Trust banner */}
      <div className="my-6 flex items-start gap-3 rounded-lg border border-accent/20 bg-accent-light px-4 py-3">
        <svg className="mt-0.5 h-4 w-4 shrink-0 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
        <div className="text-xs text-accent">
          <span className="font-medium">Your keys stay with you.</span> When you connect a provider, you authenticate directly with them.
          Delimiter only receives read-only billing data — never your API keys or credentials.
        </div>
      </div>

      {/* Provider cards */}
      <div className="space-y-3">
        {(data?.supportedProviders ?? []).map((provider) => {
          const connection = connectedMap.get(provider.id)
          const isConnected = connection && connection.status !== 'disconnected'

          return (
            <div
              key={provider.id}
              className="rounded-xl border border-border bg-white p-5"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface text-sm font-bold capitalize text-text-secondary">
                    {provider.name[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{provider.name}</span>
                      {connection && <StatusBadge status={connection.status} />}
                    </div>
                    <div className="mt-0.5 text-xs text-text-tertiary">
                      {provider.keyType} — {provider.keyHint}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isConnected && (
                    <>
                      <button
                        onClick={() => pollProvider(provider.id)}
                        disabled={polling === provider.id}
                        className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-surface disabled:opacity-50"
                      >
                        {polling === provider.id ? 'Polling...' : 'Refresh'}
                      </button>
                      <button
                        onClick={() => disconnectProvider(provider.id)}
                        disabled={disconnecting === provider.id}
                        className="rounded-lg border border-red/30 px-3 py-1.5 text-xs font-medium text-red transition-colors hover:bg-red/5 disabled:opacity-50"
                      >
                        {disconnecting === provider.id ? 'Disconnecting...' : 'Disconnect'}
                      </button>
                    </>
                  )}
                  {!isConnected && (
                    <span className="rounded-lg bg-surface px-4 py-1.5 text-xs font-medium text-text-tertiary">
                      Coming soon
                    </span>
                  )}
                </div>
              </div>

              {/* Connection data */}
              {isConnected && connection && (
                <div className="mt-4 flex items-center gap-6 border-t border-border pt-4">
                  {connection.balance != null && (
                    <div>
                      <div className="text-[11px] font-medium text-text-tertiary">Balance</div>
                      <div className="text-sm font-semibold">{formatCurrency(connection.balance)}</div>
                    </div>
                  )}
                  {connection.periodSpend != null && (
                    <div>
                      <div className="text-[11px] font-medium text-text-tertiary">Period Spend</div>
                      <div className="text-sm font-semibold">{formatCurrency(connection.periodSpend)}</div>
                    </div>
                  )}
                  {connection.lastPolledAt && (
                    <div>
                      <div className="text-[11px] font-medium text-text-tertiary">Last Updated</div>
                      <div className="text-xs text-text-secondary">
                        {new Date(connection.lastPolledAt).toLocaleString()}
                      </div>
                    </div>
                  )}
                  {connection.lastError && (
                    <div className="flex-1">
                      <div className="text-[11px] font-medium text-red">Error</div>
                      <div className="text-xs text-red">{connection.lastError}</div>
                    </div>
                  )}
                  {!connection.lastPolledAt && !connection.lastError && (
                    <div className="text-xs text-text-tertiary">
                      Click Refresh to fetch billing data
                    </div>
                  )}
                </div>
              )}

              {/* Capabilities */}
              <div className="mt-3 flex gap-2">
                {provider.capabilities.includes('balance') && (
                  <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] font-medium text-text-tertiary">
                    Credit balance
                  </span>
                )}
                {provider.capabilities.includes('period_spend') && (
                  <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] font-medium text-text-tertiary">
                    Period spend
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
