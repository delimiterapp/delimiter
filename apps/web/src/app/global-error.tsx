'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem', maxWidth: '32rem', margin: '0 auto' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Something went wrong</h2>
        <p style={{ color: '#6b7280', marginTop: '0.5rem', fontSize: '0.875rem' }}>
          {error.message || 'An unexpected error occurred.'}
        </p>
        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={reset}
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
              background: '#111827',
              color: '#fff',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
          <a
            href="/sign-in"
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
              color: '#6b7280',
              textDecoration: 'none',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
            }}
          >
            Back to sign in
          </a>
        </div>
      </body>
    </html>
  )
}
