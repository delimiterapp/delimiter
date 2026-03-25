import type { DelimiterConfig, RateLimitReport } from './types'

/**
 * Store for the original unpatched fetch.
 * Set by instrument.ts before patching globalThis.fetch.
 * Used here to avoid infinite recursion (report POST triggering another report).
 */
let originalFetch: typeof globalThis.fetch | null = null

export function setOriginalFetch(fn: typeof globalThis.fetch): void {
  originalFetch = fn
}

/**
 * Send a rate limit report to the Delimiter API.
 * Fire-and-forget — never throws, never blocks, never retries.
 */
export function sendReport(config: DelimiterConfig, report: RateLimitReport): void {
  if (!config.enabled) return

  if (config.debug) {
    console.log('[delimiter]', JSON.stringify(report, null, 2))
  }

  try {
    // Use the original fetch to avoid our own instrumentation
    const fetchFn = originalFetch ?? globalThis.fetch
    if (!fetchFn) return

    fetchFn(config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.projectKey}`,
      },
      body: JSON.stringify(report),
    }).catch(() => {
      // Silently drop — fire-and-forget
    })
  } catch {
    // Silently drop — fire-and-forget
  }
}
