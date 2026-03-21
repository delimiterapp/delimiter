'use client'

import { useEffect } from 'react'

export default function DocsHome() {
  useEffect(() => {
    window.location.replace('/docs/getting-started/core-concepts')
  }, [])

  return (
    <meta httpEquiv="refresh" content="0;url=/docs/getting-started/core-concepts" />
  )
}
