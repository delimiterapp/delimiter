'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useApp } from '@/components/app/app-context'
import { ProviderLogo } from '@/components/app/provider-logo'
import { capabilityLabel, getProvider } from '@/lib/provider-catalog'

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
  periodStart: string | null
  creditBalanceEntry: number | null
  creditBalanceAsOf: string | null
}

function formatCurrency(value: number | null): string {
  if (value == null) return '—'
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function ProviderConnectionPage() {
  const { activeProject } = useApp()
  const params = useParams<{ provider: string }>()
  const providerId = params.provider
  const provider = getProvider(providerId)

  const [key, setKey] = useState<ProviderKeyInfo | null>(null)
  const [connection, setConnection] = useState<Connection | null>(null)
  const [credential, setCredential] = useState('')
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)
  const [polling, setPolling] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [error, setError] = useState('')
  const [policyCopied, setPolicyCopied] = useState(false)
  const [creditInput, setCreditInput] = useState('')
  const [savingCredit, setSavingCredit] = useState(false)

  const isAws = providerId === 'bedrock'
  const isConnected = key?.status === 'valid' && connection?.status === 'connected'

  async function refresh() {
    if (!activeProject || !provider) return
    const response = await fetch(`/api/provider-keys?projectId=${activeProject.id}`)
    const data = await response.json()
    setKey((data.keys ?? []).find((item: ProviderKeyInfo) => item.provider === provider.id) ?? null)
    setConnection((data.connections ?? []).find((item: Connection) => item.provider === provider.id) ?? null)
  }

  useEffect(() => {
    if (!activeProject || !provider) return
    setLoading(true)
    refresh().finally(() => setLoading(false))
  }, [activeProject?.id, provider?.id])

  async function handleConnect() {
    if (!activeProject || !provider || !credential.trim()) return
    setConnecting(true)
    setError('')

    try {
      const response = await fetch('/api/provider-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: activeProject.id,
          provider: provider.id,
          apiKey: credential.trim(),
        }),
      })
      const data = await response.json()

      if (!response.ok || data.providerKey?.status !== 'valid') {
        throw new Error(data.error || 'Could not connect provider')
      }

      setCredential('')
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed')
    } finally {
      setConnecting(false)
    }
  }

  async function handlePoll() {
    if (!activeProject || !provider) return
    setPolling(true)
    setError('')

    try {
      const response = await fetch('/api/connections/poll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: activeProject.id, provider: provider.id }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Sync failed')
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sync failed')
    } finally {
      setPolling(false)
    }
  }

  async function handleDisconnect() {
    if (!activeProject || !provider) return
    setRemoving(true)
    setError('')

    try {
      const response = await fetch('/api/provider-keys', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: activeProject.id, provider: provider.id }),
      })
      if (!response.ok) throw new Error('Could not disconnect provider')
      setKey(null)
      setConnection(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not disconnect provider')
    } finally {
      setRemoving(false)
    }
  }

  async function handleSaveCreditBalance() {
    if (!activeProject || !provider || !creditInput.trim()) return
    const value = parseFloat(creditInput.replace(/[^0-9.]/g, ''))
    if (!Number.isFinite(value) || value <= 0) return
    setSavingCredit(true)
    setError('')

    try {
      const response = await fetch('/api/connections/credit-balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: activeProject.id, provider: provider.id, creditBalance: value }),
      })
      if (!response.ok) throw new Error('Could not save credit balance')
      setCreditInput('')
      await refresh()
      await handlePoll()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save credit balance')
    } finally {
      setSavingCredit(false)
    }
  }

  const metricCards = useMemo(() => {
    if (!connection) return []
    if (isAws) {
      return [
        { label: 'Bedrock Spend', value: formatCurrency(connection.periodSpend) },
        { label: 'Credits Remaining', value: formatCurrency(connection.balance) },
        { label: 'Credits Applied', value: formatCurrency(connection.creditLimit) },
        { label: 'Last Sync', value: connection.lastPolledAt ? new Date(connection.lastPolledAt).toLocaleString() : 'Pending' },
      ]
    }
    return [
      { label: 'Period Spend', value: formatCurrency(connection.periodSpend) },
      { label: 'Balance', value: formatCurrency(connection.balance) },
      { label: 'Credit Limit', value: formatCurrency(connection.creditLimit) },
      { label: 'Last Sync', value: connection.lastPolledAt ? new Date(connection.lastPolledAt).toLocaleString() : 'Pending' },
    ]
  }, [connection, isAws])

  if (!provider) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-lg font-semibold">Provider not found</h1>
          <Link href="/dashboard/providers" className="mt-4 inline-flex rounded-lg bg-text-primary px-4 py-2 text-sm font-medium text-white">
            Back to providers
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-accent" />
      </div>
    )
  }

  return (
    <div className="min-h-full bg-surface">
      <div className="mx-auto max-w-5xl p-4 md:p-8">
        <nav className="mb-6 flex items-center gap-1.5 text-sm text-text-secondary">
          <Link href="/dashboard" className="transition-colors hover:text-text-primary">Dashboard</Link>
          <svg className="h-3.5 w-3.5 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
          <Link href="/dashboard/providers" className="transition-colors hover:text-text-primary">Providers</Link>
          <svg className="h-3.5 w-3.5 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
          <span className="font-medium text-text-primary">{provider.name}</span>
        </nav>

        <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
          <div className="border-b border-border bg-white px-6 py-10 text-center md:px-10">
            <div className="mx-auto flex max-w-md items-center justify-center gap-4">
              <div className="relative">
                <ProviderLogo providerId={provider.id} size="xl" />
                <div className="absolute inset-0 animate-ping rounded-xl border border-accent/20" />
              </div>
              <div className="flex flex-1 items-center gap-1">
                <div className="h-px flex-1 bg-border" />
                <div className="h-2 w-2 rounded-full bg-accent" />
                <div className="h-px flex-1 bg-border" />
              </div>
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-border bg-white shadow-sm">
                <img src="/icon.svg" alt="Delimiter" className="h-9 w-9" />
              </div>
            </div>
            <h1 className="mt-8 text-2xl font-semibold tracking-tight">Connect {provider.name}</h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-text-secondary">{provider.description}</p>
            <div className="mt-4 flex flex-wrap justify-center gap-1.5">
              {provider.capabilities.map((capability) => (
                <span key={capability} className="rounded-full bg-surface px-2.5 py-1 text-[11px] font-medium text-text-secondary">
                  {capabilityLabel(capability)}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-0 md:grid-cols-[1fr_360px]">
            <div className="p-6 md:p-8">
              {isConnected ? (
                <div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green/10 text-green">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-base font-semibold">{provider.name} is connected</h2>
                      <p className="mt-0.5 text-sm text-text-secondary">Delimiter will sync reporting data from this provider.</p>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {metricCards.map((card) => (
                      <div key={card.label} className="rounded-xl border border-border bg-surface/50 p-4">
                        <div className="text-xs font-medium text-text-tertiary">{card.label}</div>
                        <div className="mt-1 text-sm font-semibold">{card.value}</div>
                      </div>
                    ))}
                  </div>

                  {isAws && (
                    <div className="mt-5 rounded-xl border border-border bg-surface/50 p-4">
                      <div className="text-xs font-medium text-text-tertiary">
                        {connection?.creditBalanceEntry != null
                          ? `Credit balance set ${connection.creditBalanceAsOf ? new Date(connection.creditBalanceAsOf).toLocaleDateString() : ''} — ${formatCurrency(connection.creditBalanceEntry)}`
                          : 'Set your AWS credit balance to track remaining credits'}
                      </div>
                      <div className="mt-2 flex gap-2">
                        <input
                          type="text"
                          value={creditInput}
                          onChange={(event) => setCreditInput(event.target.value)}
                          placeholder={connection?.creditBalanceEntry != null ? 'Update balance' : 'e.g. 40530'}
                          className="flex-1 rounded-lg border border-border bg-white px-3 py-1.5 text-sm transition-colors focus:border-accent focus:outline-none"
                        />
                        <button
                          onClick={handleSaveCreditBalance}
                          disabled={!creditInput.trim() || savingCredit}
                          className="rounded-lg bg-text-primary px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-text-primary/90 disabled:opacity-40"
                        >
                          {savingCredit ? 'Saving...' : 'Set'}
                        </button>
                      </div>
                      <p className="mt-1.5 text-[11px] text-text-tertiary">
                        Check AWS Billing &gt; Credits for the total remaining. Delimiter tracks spend from this point forward.
                      </p>
                    </div>
                  )}

                  {provider.statusNote && !isAws && (
                    <div className="mt-5 rounded-lg border border-yellow/20 bg-yellow/5 px-4 py-3 text-xs leading-5 text-text-secondary">
                      {provider.statusNote}
                    </div>
                  )}

                  {connection?.lastError && (
                    <div className="mt-5 rounded-lg bg-red/5 px-4 py-3 text-xs leading-5 text-red">{connection.lastError}</div>
                  )}

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      onClick={handlePoll}
                      disabled={polling}
                      className="rounded-lg bg-text-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-text-primary/90 disabled:opacity-50"
                    >
                      {polling ? 'Syncing...' : 'Sync now'}
                    </button>
                    <button
                      onClick={handleDisconnect}
                      disabled={removing}
                      className="rounded-lg border border-red/30 px-4 py-2 text-sm font-medium text-red transition-colors hover:bg-red/5 disabled:opacity-50"
                    >
                      {removing ? 'Disconnecting...' : 'Disconnect'}
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="text-base font-semibold">Add monitoring credential</h2>
                  <p className="mt-1 text-sm leading-6 text-text-secondary">{provider.keyHint}</p>

                  <div className="mt-5">
                    <label className="mb-1.5 block text-sm font-medium">{provider.keyType}</label>
                    {isAws ? (
                      <textarea
                        value={credential}
                        onChange={(event) => setCredential(event.target.value)}
                        placeholder='Paste credential JSON: {"accessKeyId":"...","secretAccessKey":"...","region":"us-east-1"}'
                        rows={7}
                        className="w-full resize-none rounded-lg border border-border bg-white px-3.5 py-2.5 font-mono text-sm transition-colors focus:border-accent focus:outline-none"
                        autoFocus
                      />
                    ) : (
                      <input
                        type="password"
                        value={credential}
                        onChange={(event) => setCredential(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' && credential.trim()) handleConnect()
                        }}
                        placeholder={`Paste your ${provider.keyType}`}
                        className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm transition-colors focus:border-accent focus:outline-none"
                        autoFocus
                      />
                    )}
                  </div>

                  <div className="mt-4 rounded-lg border border-border/70 bg-surface/50 px-4 py-3 text-xs leading-5 text-text-secondary">
                    {provider.securityNote}
                  </div>

                  {error && <div className="mt-4 rounded-lg bg-red/5 px-4 py-3 text-xs text-red">{error}</div>}

                  <button
                    onClick={handleConnect}
                    disabled={!credential.trim() || connecting}
                    className="shine-hover mt-6 rounded-lg bg-text-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-text-primary/90 disabled:opacity-40"
                  >
                    {connecting ? 'Connecting...' : `Connect ${provider.name}`}
                  </button>
                </div>
              )}
            </div>

            <aside className="border-t border-border bg-surface/60 p-6 md:border-l md:border-t-0 md:p-8">
              <h2 className="text-sm font-semibold">Setup checklist</h2>
              <ol className="mt-4 space-y-3">
                {provider.setupSteps.map((step, index) => (
                  <li key={step} className="flex gap-3 text-sm leading-6 text-text-secondary">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold text-text-primary ring-1 ring-border">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>

              {provider.iamPolicy && (
                <div className="mt-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold">IAM Policy JSON</h2>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(provider.iamPolicy!)
                        setPolicyCopied(true)
                        setTimeout(() => setPolicyCopied(false), 2000)
                      }}
                      className="rounded-md px-2 py-1 text-xs font-medium text-text-secondary transition-colors hover:bg-white hover:text-text-primary"
                    >
                      {policyCopied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <pre className="mt-2 max-h-64 overflow-auto rounded-lg border border-border bg-white p-3 font-mono text-[11px] leading-5 text-text-secondary">
                    {provider.iamPolicy}
                  </pre>
                  <p className="mt-2 text-[11px] leading-4 text-text-tertiary">
                    Paste this into IAM &gt; Policies &gt; Create policy &gt; JSON editor. Name it <span className="font-medium text-text-secondary">DelimiterBedrockReadOnly</span>.
                  </p>
                </div>
              )}

              <div className="mt-6 rounded-xl border border-border bg-white p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">What Delimiter tracks</div>
                <div className="mt-3 space-y-2">
                  {provider.capabilities.map((capability) => (
                    <div key={capability} className="flex items-center gap-2 text-sm text-text-secondary">
                      <svg className="h-4 w-4 text-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                      {capabilityLabel(capability)}
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  )
}
