'use client'

import { useEffect, useState } from 'react'
import { useApp } from '@/components/app/app-context'

type SupportedProvider = {
  id: string
  name: string
  keyType: string
  keyHint: string
  capabilities: string[]
}

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

function formatCurrency(n: number | null): string {
  if (n == null) return '—'
  return `$${n.toFixed(2)}`
}

export default function ConnectionsPage() {
  const { activeProject } = useApp()
  const [providers, setProviders] = useState<SupportedProvider[]>([])
  const [keys, setKeys] = useState<ProviderKeyInfo[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [loading, setLoading] = useState(true)

  // Modal state
  const [connectModal, setConnectModal] = useState<string | null>(null)
  const [apiKeyInput, setApiKeyInput] = useState('')
  const [connecting, setConnecting] = useState(false)
  const [connectError, setConnectError] = useState('')

  const [polling, setPolling] = useState<string | null>(null)
  const [disconnecting, setDisconnecting] = useState<string | null>(null)

  async function refresh() {
    if (!activeProject) return
    const res = await fetch(`/api/provider-keys?projectId=${activeProject.id}`)
    const data = await res.json()
    setProviders(data.supportedProviders ?? [])
    setKeys(data.keys ?? [])
    setConnections(data.connections ?? [])
  }

  useEffect(() => {
    if (!activeProject) return
    setLoading(true)
    refresh().finally(() => setLoading(false))
  }, [activeProject?.id])

  async function handleConnect() {
    if (!activeProject || !connectModal || !apiKeyInput.trim()) return
    setConnecting(true)
    setConnectError('')

    try {
      const res = await fetch('/api/provider-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: activeProject.id, provider: connectModal, apiKey: apiKeyInput.trim() }),
      })
      const data = await res.json()

      if (data.providerKey?.status === 'valid') {
        setConnectModal(null)
        setApiKeyInput('')
        await refresh()
      } else {
        setConnectError(data.error || 'Invalid key — check your key and try again')
      }
    } catch {
      setConnectError('Connection failed')
    } finally {
      setConnecting(false)
    }
  }

  async function handleDisconnect(providerId: string) {
    if (!activeProject) return
    setDisconnecting(providerId)
    await fetch('/api/provider-keys', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId: activeProject.id, provider: providerId }),
    })
    await refresh()
    setDisconnecting(null)
  }

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

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-accent" />
      </div>
    )
  }

  const keyMap = new Map(keys.map((k) => [k.provider, k]))
  const connMap = new Map(connections.map((c) => [c.provider, c]))

  return (
    <div className="p-4 md:p-8">
      <div className="mb-2">
        <h1 className="text-lg font-semibold">Connections</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Connect your AI provider accounts to monitor credit balances and spending.
        </p>
      </div>

      <div className="my-4 flex items-start gap-3 rounded-lg border border-accent/20 bg-accent-light px-3 py-2.5 md:my-6 md:px-4 md:py-3">
        <svg className="mt-0.5 h-4 w-4 shrink-0 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
        <div className="text-xs text-accent">
          <span className="font-medium">Encrypted at rest.</span> Your API keys are encrypted with AES-256-GCM and only decrypted server-side to fetch billing data.
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {providers.map((provider) => {
          const key = keyMap.get(provider.id)
          const conn = connMap.get(provider.id)
          const isConnected = key && key.status === 'valid'

          return (
            <div
              key={provider.id}
              className={`rounded-xl border bg-white p-5 transition-colors ${
                isConnected ? 'border-green/20' : 'border-border'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                  isConnected ? 'bg-green/10 text-green' : 'bg-surface text-text-secondary'
                }`}>
                  {isConnected ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  ) : provider.name[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{provider.name}</span>
                    {isConnected && (
                      <span className="rounded-full bg-green/10 px-2 py-0.5 text-[10px] font-medium text-green">Connected</span>
                    )}
                    {key?.status === 'invalid' && (
                      <span className="rounded-full bg-red/10 px-2 py-0.5 text-[10px] font-medium text-red">Invalid key</span>
                    )}
                  </div>
                  <div className="mt-0.5 text-xs text-text-tertiary">{provider.keyType}</div>
                </div>
              </div>

              {isConnected && conn && (
                <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border pt-3">
                  {conn.balance != null && (
                    <div>
                      <div className="text-[11px] font-medium text-text-tertiary">Balance</div>
                      <div className="text-sm font-semibold">{formatCurrency(conn.balance)}</div>
                    </div>
                  )}
                  {conn.periodSpend != null && (
                    <div>
                      <div className="text-[11px] font-medium text-text-tertiary">Period Spend</div>
                      <div className="text-sm font-semibold">{formatCurrency(conn.periodSpend)}</div>
                    </div>
                  )}
                  {conn.lastPolledAt && (
                    <div>
                      <div className="text-[11px] font-medium text-text-tertiary">Last Updated</div>
                      <div className="text-xs text-text-secondary">{new Date(conn.lastPolledAt).toLocaleString()}</div>
                    </div>
                  )}
                  {conn.lastError && (
                    <div className="w-full">
                      <div className="text-[11px] font-medium text-red">Error</div>
                      <div className="break-words text-xs text-red">{conn.lastError}</div>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                {isConnected ? (
                  <>
                    <button
                      onClick={() => handlePoll(provider.id)}
                      disabled={polling === provider.id}
                      className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-surface disabled:opacity-50"
                    >
                      {polling === provider.id ? 'Refreshing...' : 'Refresh'}
                    </button>
                    <button
                      onClick={() => handleDisconnect(provider.id)}
                      disabled={disconnecting === provider.id}
                      className="rounded-lg border border-red/30 px-3 py-1.5 text-xs font-medium text-red transition-colors hover:bg-red/5 disabled:opacity-50"
                    >
                      {disconnecting === provider.id ? 'Removing...' : 'Disconnect'}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => { setConnectModal(provider.id); setApiKeyInput(''); setConnectError('') }}
                    className="rounded-lg bg-accent px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-accent-hover"
                  >
                    Connect
                  </button>
                )}
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {provider.capabilities.includes('balance') && (
                  <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] font-medium text-text-tertiary">Credit balance</span>
                )}
                {provider.capabilities.includes('period_spend') && (
                  <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] font-medium text-text-tertiary">Period spend</span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Connect modal */}
      {connectModal && (
        <>
          <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setConnectModal(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-2xl border border-border bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
              {(() => {
                const p = providers.find((p) => p.id === connectModal)
                if (!p) return null
                return (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface text-sm font-bold text-text-secondary">
                        {p.name[0]}
                      </div>
                      <div>
                        <h2 className="text-base font-semibold">Connect {p.name}</h2>
                        <div className="text-xs text-text-tertiary">{p.keyType}</div>
                      </div>
                    </div>

                    <div className="mt-4 rounded-lg border border-border/60 bg-surface/50 px-3 py-2">
                      <p className="text-xs text-text-secondary">{p.keyHint}</p>
                    </div>

                    <div className="mt-4">
                      <input
                        type="password"
                        value={apiKeyInput}
                        onChange={(e) => setApiKeyInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && apiKeyInput.trim()) handleConnect() }}
                        placeholder={`Paste your ${p.keyType}`}
                        className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm transition-colors focus:border-accent focus:outline-none"
                        autoFocus
                      />
                    </div>

                    {connectError && (
                      <div className="mt-3 rounded-lg bg-red/5 px-3 py-2 text-xs text-red">{connectError}</div>
                    )}

                    <div className="mt-5 flex gap-3">
                      <button
                        onClick={() => setConnectModal(null)}
                        className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-surface"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleConnect}
                        disabled={!apiKeyInput.trim() || connecting}
                        className="shine-hover flex-1 rounded-lg bg-text-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-text-primary/90 disabled:opacity-40"
                      >
                        {connecting ? 'Validating...' : 'Connect'}
                      </button>
                    </div>
                  </>
                )
              })()}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
