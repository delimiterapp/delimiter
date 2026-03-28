/** Options passed to `delimiter.init()` */
export interface DelimiterOptions {
  /** App name tag for multi-app monitoring. Defaults to `"default"`. */
  app?: string
  /** Custom reporting endpoint. Defaults to `"https://delimiter.app/api/report"`. */
  endpoint?: string
  /** Enable or disable reporting. Defaults to `true`. */
  enabled?: boolean
  /** Log reports to console. Defaults to `false`. */
  debug?: boolean
}

/** Internal resolved configuration */
export interface DelimiterConfig {
  projectKey: string
  app: string
  endpoint: string
  enabled: boolean
  debug: boolean
}

/** Normalized rate limit data from any provider */
export interface RateLimits {
  requests_limit: number | null
  requests_remaining: number | null
  tokens_limit: number | null
  tokens_remaining: number | null
  reset_requests_ms: number | null
  reset_tokens_ms: number | null
}

/** Credit/balance data extracted from provider response headers */
export interface UsageCredits {
  /** Total credit balance (e.g. $100.00) */
  credits_limit: number | null
  /** Remaining credit balance */
  credits_remaining: number | null
  /** Cost of this individual request (if reported by provider) */
  request_cost: number | null
}

/** The report payload sent to the Delimiter API */
export interface RateLimitReport {
  app: string
  provider: string
  model: string | null
  timestamp: string
  limits: RateLimits
  /** Credit/balance data — optional, only present when provider exposes it */
  credits?: UsageCredits | null
}

/** Header getter abstraction for both fetch Response and Node http headers */
export type HeaderGetter = (name: string) => string | null | undefined
