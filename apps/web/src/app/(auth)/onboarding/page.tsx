'use client'

import { useEffect, useState } from 'react'

type Step = 'loading' | 'plan' | 'form' | 'path-choice' | 'sdk-setup' | 'api-key-setup' | 'approved'

type SupportedProvider = {
  id: string
  name: string
  keyType: string
  keyHint: string
  capabilities: string[]
}

export default function Onboarding() {
  const [step, setStep] = useState<Step>('loading')
  const [orgName, setOrgName] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [userName, setUserName] = useState('')
  const [projectKey, setProjectKey] = useState('')
  const [projectId, setProjectId] = useState('')

  // API key setup state
  const [providers, setProviders] = useState<SupportedProvider[]>([])
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null)
  const [apiKeyInput, setApiKeyInput] = useState('')
  const [connectingProvider, setConnectingProvider] = useState(false)
  const [connectResult, setConnectResult] = useState<{ status: 'valid' | 'invalid'; message: string } | null>(null)
  const [connectedProviders, setConnectedProviders] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => {
        if (!r.ok) { window.location.href = '/sign-in'; return null }
        return r.json()
      })
      .then((data) => {
        if (!data) return
        if (data.onboardingComplete) { window.location.href = '/dashboard'; return }
        setUserName(data.user.name || data.user.githubUsername || '')
        if (data.projects?.[0]) {
          setProjectKey(data.projects[0].key)
          setProjectId(data.projects[0].id)
        }
        setStep('plan')
      })
  }, [])

  async function handleApply() {
    if (!orgName.trim()) return
    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/onboarding/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgName: orgName.trim() }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Something went wrong')
      }
      setStep('path-choice')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleSelectPro() {
    window.location.href = '/api/checkout'
  }

  async function handleComplete() {
    await fetch('/api/onboarding/complete', { method: 'POST' })
    setStep('approved')
  }

  async function handleConnectKey() {
    if (!selectedProvider || !apiKeyInput.trim() || !projectId) return
    setConnectingProvider(true)
    setConnectResult(null)

    try {
      const res = await fetch('/api/provider-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, provider: selectedProvider, apiKey: apiKeyInput.trim() }),
      })
      const data = await res.json()

      if (data.providerKey?.status === 'valid') {
        const spend = data.snapshot?.periodSpend
        const balance = data.snapshot?.balance
        const msg = balance != null ? `$${balance.toFixed(2)} remaining` : spend != null ? `$${spend.toFixed(2)} spent this period` : 'Connected'
        setConnectResult({ status: 'valid', message: msg })
        setConnectedProviders((prev) => new Set(prev).add(selectedProvider))
        setApiKeyInput('')
      } else {
        setConnectResult({ status: 'invalid', message: data.error || 'Invalid key' })
      }
    } catch {
      setConnectResult({ status: 'invalid', message: 'Connection failed' })
    } finally {
      setConnectingProvider(false)
    }
  }

  useEffect(() => {
    if (step === 'api-key-setup') {
      fetch(`/api/provider-keys?projectId=${projectId}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.supportedProviders) setProviders(data.supportedProviders)
        })
    }
  }, [step, projectId])

  if (step === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-accent" />
      </div>
    )
  }

  if (step === 'approved') {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-sm text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-green/10">
            <svg className="h-7 w-7 text-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h1 className="text-xl font-bold">You&apos;re in.</h1>
          <p className="mt-2 text-sm text-text-secondary">
            Welcome to Delimiter{userName ? `, ${userName}` : ''}. Your dashboard is ready.
          </p>
          <a
            href="/dashboard"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-text-primary px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-text-primary/90"
          >
            Go to dashboard
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-lg">
        <a href="/" className="mb-10 flex justify-center">
          <img src="/logo.png" alt="delimiter" className="h-5" />
        </a>

        {step === 'plan' && (
          <div>
            <h1 className="text-center text-lg font-semibold">
              {userName ? `Welcome, ${userName}` : 'Choose your plan'}
            </h1>
            <p className="mt-1 text-center text-sm text-text-secondary">
              Select a plan to get started with Delimiter.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <button
                onClick={() => setStep('form')}
                className="shine-hover-light group rounded-xl border border-border/60 bg-white p-5 text-left transition-all hover:border-accent/50 hover:shadow-sm"
              >
                <div className="text-2xl font-bold text-text-secondary">$0</div>
                <div className="mt-1 font-semibold">Free</div>
                <div className="mt-0.5 text-xs text-text-secondary">For solo developers</div>
                <ul className="mt-4 space-y-2">
                  {['1 project', '3,000 events/mo', 'Unlimited providers', 'Unlimited API keys', 'Community support'].map((f) => (
                    <li key={f} className="flex items-center gap-1.5 text-xs text-text-secondary">
                      <svg className="h-3 w-3 shrink-0 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex items-center gap-1 text-sm font-medium text-accent opacity-0 transition-opacity group-hover:opacity-100">
                  Get started
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </div>
              </button>

              <button
                onClick={handleSelectPro}
                className="shine-hover-light group rounded-xl border border-accent/30 bg-white p-5 text-left transition-all hover:border-accent hover:shadow-sm"
              >
                <div className="text-2xl font-bold">$20</div>
                <div className="mt-1 font-semibold">Pro</div>
                <div className="mt-0.5 text-xs text-text-secondary">Per workspace/month</div>
                <ul className="mt-4 space-y-2">
                  {['Unlimited projects', '50,000 events/mo', 'Unlimited providers', 'Fallback chains', 'Alerts & webhooks', 'Priority support'].map((f) => (
                    <li key={f} className="flex items-center gap-1.5 text-xs text-text-secondary">
                      <svg className="h-3 w-3 shrink-0 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex items-center gap-1 text-sm font-medium text-accent opacity-0 transition-opacity group-hover:opacity-100">
                  Subscribe
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </div>
              </button>
            </div>
          </div>
        )}

        {step === 'form' && (
          <div className="mx-auto max-w-md">
            <button
              onClick={() => setStep('plan')}
              className="mb-6 flex items-center gap-1 text-sm text-text-secondary transition-colors hover:text-text-primary"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Back
            </button>

            <h1 className="text-lg font-semibold">One last thing</h1>
            <p className="mt-1 text-sm text-text-secondary">
              What are you building? This helps us understand your use case.
            </p>

            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Product or project name</label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && orgName.trim()) handleApply() }}
                  placeholder="e.g. My AI App"
                  className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm transition-colors focus:border-accent focus:outline-none"
                  autoFocus
                />
              </div>

              {error && (
                <div className="rounded-lg bg-red/5 px-3.5 py-2.5 text-sm text-red">{error}</div>
              )}

              <button
                onClick={handleApply}
                disabled={!orgName.trim() || submitting}
                className="shine-hover flex w-full items-center justify-center gap-2 rounded-lg bg-text-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-text-primary/90 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitting ? 'Setting up...' : 'Continue'}
              </button>
            </div>
          </div>
        )}

        {step === 'path-choice' && (
          <div>
            <h1 className="text-center text-lg font-semibold">How will you use Delimiter?</h1>
            <p className="mt-1 text-center text-sm text-text-secondary">
              Choose your setup path. You can always use both later.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <button
                onClick={() => setStep('sdk-setup')}
                className="shine-hover-light group rounded-xl border border-border/60 bg-white p-5 text-left transition-all hover:border-accent/50 hover:shadow-sm"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-surface">
                  <svg className="h-5 w-5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                  </svg>
                </div>
                <div className="font-semibold">I have an AI app</div>
                <p className="mt-1 text-xs text-text-secondary">
                  Add the SDK to your app and monitor rate limits automatically.
                </p>
                <div className="mt-4 flex items-center gap-1 text-sm font-medium text-accent opacity-0 transition-opacity group-hover:opacity-100">
                  SDK setup
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </div>
              </button>

              <button
                onClick={() => setStep('api-key-setup')}
                className="shine-hover-light group rounded-xl border border-border/60 bg-white p-5 text-left transition-all hover:border-accent/50 hover:shadow-sm"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-surface">
                  <svg className="h-5 w-5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                  </svg>
                </div>
                <div className="font-semibold">I monitor AI APIs</div>
                <p className="mt-1 text-xs text-text-secondary">
                  Connect your API keys to track spending and balances in one place.
                </p>
                <div className="mt-4 flex items-center gap-1 text-sm font-medium text-accent opacity-0 transition-opacity group-hover:opacity-100">
                  Connect keys
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </div>
              </button>
            </div>

            <button
              onClick={handleComplete}
              className="mt-6 flex w-full items-center justify-center text-xs text-text-tertiary transition-colors hover:text-text-secondary"
            >
              Skip for now
            </button>
          </div>
        )}

        {step === 'sdk-setup' && (
          <div className="mx-auto max-w-md">
            <button
              onClick={() => setStep('path-choice')}
              className="mb-6 flex items-center gap-1 text-sm text-text-secondary transition-colors hover:text-text-primary"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Back
            </button>

            <h1 className="text-lg font-semibold">Add the SDK</h1>
            <p className="mt-1 text-sm text-text-secondary">
              Two lines of code. All AI API calls are monitored automatically.
            </p>

            <div className="mt-6 space-y-4">
              <div className="overflow-hidden rounded-lg border border-border bg-code-bg">
                <div className="border-b border-white/5 px-4 py-2">
                  <span className="font-mono text-xs text-white/40">1. Install</span>
                </div>
                <pre className="overflow-x-auto p-4 font-mono text-sm text-code-text">
                  npm install @delimiter/sdk
                </pre>
              </div>

              <div className="overflow-hidden rounded-lg border border-border bg-code-bg">
                <div className="border-b border-white/5 px-4 py-2">
                  <span className="font-mono text-xs text-white/40">2. Initialize</span>
                </div>
                <pre className="overflow-x-auto p-4 font-mono text-sm leading-relaxed text-code-text">
{`import { delimiter } from '@delimiter/sdk'
delimiter.init('${projectKey}')`}
                </pre>
              </div>

              <div className="rounded-lg border border-border/60 bg-surface/50 px-4 py-3">
                <p className="text-xs text-text-secondary">
                  The SDK intercepts outgoing HTTP calls to AI providers and reports rate limit headers back to your dashboard. No code changes needed beyond init.
                </p>
              </div>
            </div>

            <button
              onClick={handleComplete}
              className="shine-hover mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-text-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-text-primary/90"
            >
              I&apos;ve added the SDK
            </button>
            <button
              onClick={handleComplete}
              className="mt-3 flex w-full items-center justify-center text-xs text-text-tertiary transition-colors hover:text-text-secondary"
            >
              Skip for now
            </button>
          </div>
        )}

        {step === 'api-key-setup' && (
          <div className="mx-auto max-w-md">
            <button
              onClick={() => { setStep('path-choice'); setSelectedProvider(null); setConnectResult(null) }}
              className="mb-6 flex items-center gap-1 text-sm text-text-secondary transition-colors hover:text-text-primary"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Back
            </button>

            <h1 className="text-lg font-semibold">Connect your providers</h1>
            <p className="mt-1 text-sm text-text-secondary">
              Add API keys to track spending and balances. Keys are encrypted at rest.
            </p>

            <div className="mt-6 space-y-3">
              {providers.map((p) => {
                const isConnected = connectedProviders.has(p.id)
                const isSelected = selectedProvider === p.id

                return (
                  <div key={p.id}>
                    <button
                      onClick={() => {
                        if (isConnected) return
                        setSelectedProvider(isSelected ? null : p.id)
                        setApiKeyInput('')
                        setConnectResult(null)
                      }}
                      className={`w-full rounded-xl border bg-white p-4 text-left transition-all ${
                        isConnected ? 'border-green/30 bg-green/5' : isSelected ? 'border-accent/50' : 'border-border/60 hover:border-accent/30'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                          isConnected ? 'bg-green/10 text-green' : 'bg-surface text-text-secondary'
                        }`}>
                          {isConnected ? (
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          ) : p.name[0]}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium">{p.name}</div>
                          <div className="text-xs text-text-tertiary">{p.keyType}</div>
                        </div>
                        {isConnected && (
                          <span className="rounded-full bg-green/10 px-2 py-0.5 text-xs font-medium text-green">Connected</span>
                        )}
                      </div>
                    </button>

                    {isSelected && !isConnected && (
                      <div className="mt-2 rounded-lg border border-border/60 bg-surface/50 p-4">
                        <div className="mb-2 text-xs text-text-tertiary">{p.keyHint}</div>
                        <div className="flex gap-2">
                          <input
                            type="password"
                            value={apiKeyInput}
                            onChange={(e) => setApiKeyInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter' && apiKeyInput.trim()) handleConnectKey() }}
                            placeholder={`Paste your ${p.keyType}`}
                            className="min-w-0 flex-1 rounded-lg border border-border bg-white px-3 py-2 text-sm transition-colors focus:border-accent focus:outline-none"
                            autoFocus
                          />
                          <button
                            onClick={handleConnectKey}
                            disabled={!apiKeyInput.trim() || connectingProvider}
                            className="shrink-0 rounded-lg bg-text-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-text-primary/90 disabled:opacity-40"
                          >
                            {connectingProvider ? 'Validating...' : 'Connect'}
                          </button>
                        </div>
                        {connectResult && (
                          <div className={`mt-2 rounded-lg px-3 py-2 text-xs ${
                            connectResult.status === 'valid' ? 'bg-green/5 text-green' : 'bg-red/5 text-red'
                          }`}>
                            {connectResult.status === 'valid' ? `Connected — ${connectResult.message}` : connectResult.message}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {connectedProviders.size > 0 && (
              <button
                onClick={handleComplete}
                className="shine-hover mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-text-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-text-primary/90"
              >
                Continue to dashboard
              </button>
            )}
            <button
              onClick={handleComplete}
              className="mt-3 flex w-full items-center justify-center text-xs text-text-tertiary transition-colors hover:text-text-secondary"
            >
              {connectedProviders.size > 0 ? 'Skip remaining' : 'Skip for now'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
