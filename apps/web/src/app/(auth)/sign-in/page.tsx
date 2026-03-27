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
              className="shine-hover flex w-full items-center justify-center gap-2 rounded-lg bg-text-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-text-primary/90 disabled:opacity-50"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
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
              className="shine-hover-light flex w-full items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-surface disabled:opacity-50"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              {loading === 'signup' ? 'Creating passkey...' : 'Create new account'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
