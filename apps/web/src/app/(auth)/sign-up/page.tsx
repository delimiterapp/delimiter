'use client'

import { useState } from 'react'
import { startRegistration } from '@simplewebauthn/browser'

export default function SignUp() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const optionsRes = await fetch('/api/auth/register/options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!optionsRes.ok) {
        const data = await optionsRes.json()
        throw new Error(data.error || 'Failed to start registration')
      }

      const options = await optionsRes.json()
      const credential = await startRegistration({ optionsJSON: options })

      const verifyRes = await fetch('/api/auth/register/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, credential }),
      })

      if (!verifyRes.ok) {
        const data = await verifyRes.json()
        throw new Error(data.error || 'Registration failed')
      }

      window.location.href = '/console'
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <a href="/" className="mb-10 flex justify-center">
          <img src="/logo.png" alt="delimiter" className="h-5" />
        </a>

        <div className="rounded-xl border border-border bg-white p-8">
          <h1 className="text-lg font-semibold">Create account</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Set up a passkey to sign in with Face ID or Touch ID.
          </p>

          <form onSubmit={handleRegister} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-primary">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm outline-none transition-colors placeholder:text-text-tertiary focus:border-accent focus:ring-1 focus:ring-accent"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red/5 px-3.5 py-2.5 text-sm text-red">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-text-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-text-primary/90 disabled:opacity-50"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.864 4.243A7.5 7.5 0 0119.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 004.5 10.5a48.667 48.667 0 00-1.26 8.568M5.742 6.364a7.465 7.465 0 00-.246 1.636m13.5-4.243a7.465 7.465 0 011.004 3.743 48.52 48.52 0 01-.643 4.68M5.742 6.364A48.374 48.374 0 018.906 3.75a48.09 48.09 0 012.594-.472m9 9.75a48.09 48.09 0 01-2.594.472M12 12.75a2.25 2.25 0 002.25-2.25A2.25 2.25 0 0012 8.25a2.25 2.25 0 00-2.25 2.25A2.25 2.25 0 0012 12.75z" />
              </svg>
              {loading ? 'Creating passkey...' : 'Create account with passkey'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-text-secondary">
            Already have an account?{' '}
            <a href="/sign-in" className="font-medium text-accent hover:text-accent-hover">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
