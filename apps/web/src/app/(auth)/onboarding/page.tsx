'use client'

import { useEffect, useState } from 'react'

type Step = 'loading' | 'plan' | 'form' | 'reviewing' | 'approved'

export default function Onboarding() {
  const [step, setStep] = useState<Step>('loading')
  const [githubUsername, setGithubUsername] = useState('')
  const [orgName, setOrgName] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => {
        if (!r.ok) {
          window.location.href = '/sign-in'
          return null
        }
        return r.json()
      })
      .then((data) => {
        if (!data) return
        if (data.onboardingComplete) {
          window.location.href = '/dashboard'
          return
        }
        setStep('plan')
      })
  }, [])

  const formValid =
    githubUsername.trim() !== '' &&
    orgName.trim() !== ''

  async function handleApply() {
    if (!formValid) return
    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/onboarding/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          githubUsername: githubUsername.trim(),
          orgName: orgName.trim(),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Something went wrong')
      }

      setStep('reviewing')

      // Fake review delay
      setTimeout(() => {
        setStep('approved')
      }, 2500)
    } catch (err: any) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  async function handleSelectPro() {
    window.location.href = '/api/checkout'
  }

  if (step === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-accent" />
      </div>
    )
  }

  if (step === 'reviewing') {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-sm text-center">
          <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-accent" />
          </div>
          <h1 className="text-lg font-semibold">Setting up your account</h1>
          <p className="mt-2 text-sm text-text-secondary">
            This usually takes just a moment...
          </p>
        </div>
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
            Welcome to Delimiter. Let&apos;s get your project set up.
          </p>
          <a
            href="/console"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-text-primary px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-text-primary/90"
          >
            Set up your project
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
            <h1 className="text-center text-lg font-semibold">Choose your plan</h1>
            <p className="mt-1 text-center text-sm text-text-secondary">
              Select a plan to get started with Delimiter.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-4">
              {/* Free plan */}
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

              {/* Pro plan */}
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

            <h1 className="text-lg font-semibold">Get started for free</h1>
            <p className="mt-1 text-sm text-text-secondary">
              Tell us a bit about yourself.
            </p>

            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">GitHub username</label>
                <input
                  type="text"
                  value={githubUsername}
                  onChange={(e) => setGithubUsername(e.target.value)}
                  placeholder="username"
                  className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm transition-colors focus:border-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">What are you building?</label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="Product or project name"
                  className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm transition-colors focus:border-accent focus:outline-none"
                />
              </div>

              <div className="rounded-lg border border-border/60 bg-surface/50 px-4 py-3">
                <p className="text-xs text-text-secondary">
                  <span className="font-medium text-text-primary">Free plan includes:</span>{' '}
                  1 project, 3,000 events/month, unlimited providers and API keys.
                </p>
              </div>

              {error && (
                <div className="rounded-lg bg-red/5 px-3.5 py-2.5 text-sm text-red">
                  {error}
                </div>
              )}

              <button
                onClick={handleApply}
                disabled={!formValid || submitting}
                className="shine-hover flex w-full items-center justify-center gap-2 rounded-lg bg-text-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-text-primary/90 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitting ? 'Setting up...' : 'Create account'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
