'use client'

import { useState } from 'react'
import { startAuthentication } from '@simplewebauthn/browser'

export default function SignIn() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState<'signin' | 'signup' | null>(null)

  async function handleSignIn() {
    setError('')
    setLoading('signin')

    try {
      const optionsRes = await fetch('/api/auth/login/options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!optionsRes.ok) {
        const data = await optionsRes.json()
        throw new Error(data.error || 'Failed to start login')
      }

      const { challengeId, options } = await optionsRes.json()
      const credential = await startAuthentication({ optionsJSON: options })

      const verifyRes = await fetch('/api/auth/login/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeId, credential }),
      })

      if (!verifyRes.ok) {
        const data = await verifyRes.json()
        throw new Error(data.error || 'Login failed')
      }

      window.location.href = '/dashboard'
    } catch (err: any) {
      if (err.name === 'NotAllowedError') {
        setError('Passkey authentication was cancelled.')
      } else {
        setError(err.message || 'Something went wrong')
      }
    } finally {
      setLoading(null)
    }
  }

  async function handleCreateAccount() {
    setError('')
    setLoading('signup')

    try {
      const { startRegistration } = await import('@simplewebauthn/browser')

      const optionsRes = await fetch('/api/auth/register/options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!optionsRes.ok) {
        const data = await optionsRes.json()
        throw new Error(data.error || 'Failed to start registration')
      }

      const { challengeId, options } = await optionsRes.json()
      const credential = await startRegistration({ optionsJSON: options })

      const verifyRes = await fetch('/api/auth/register/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeId, credential }),
      })

      if (!verifyRes.ok) {
        const data = await verifyRes.json()
        throw new Error(data.error || 'Registration failed')
      }

      window.location.href = '/console'
    } catch (err: any) {
      if (err.name === 'NotAllowedError') {
        setError('Passkey creation was cancelled.')
      } else {
        setError(err.message || 'Something went wrong')
      }
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <a href="/" className="mb-10 flex justify-center">
          <img src="/logo.png" alt="delimiter" className="h-5" />
        </a>

        <div className="rounded-xl border border-border bg-white p-8">
          <h1 className="text-lg font-semibold">Welcome to Delimiter</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Sign in or create an account using your device&apos;s passkey.
          </p>

          <div className="mt-6 space-y-3">
            {error && (
              <div className="rounded-lg bg-red/5 px-3.5 py-2.5 text-sm text-red">
                {error}
              </div>
            )}

            <button
              onClick={handleSignIn}
              disabled={loading !== null}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-text-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-text-primary/90 disabled:opacity-50"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.864 4.243A7.5 7.5 0 0119.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 004.5 10.5a48.667 48.667 0 00-1.26 8.568M5.742 6.364a7.465 7.465 0 00-.246 1.636m13.5-4.243a7.465 7.465 0 011.004 3.743 48.52 48.52 0 01-.643 4.68M5.742 6.364A48.374 48.374 0 018.906 3.75a48.09 48.09 0 012.594-.472m9 9.75a48.09 48.09 0 01-2.594.472M12 12.75a2.25 2.25 0 002.25-2.25A2.25 2.25 0 0012 8.25a2.25 2.25 0 00-2.25 2.25A2.25 2.25 0 0012 12.75z" />
              </svg>
              {loading === 'signin' ? 'Authenticating...' : 'Sign in with passkey'}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2 text-text-tertiary">or</span>
              </div>
            </div>

            <button
              onClick={handleCreateAccount}
              disabled={loading !== null}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-surface disabled:opacity-50"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
              </svg>
              {loading === 'signup' ? 'Creating passkey...' : 'Create new account'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
