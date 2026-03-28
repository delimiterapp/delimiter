import type { HeaderGetter, RateLimits, UsageCredits } from './types'

/** Parse a duration string like "43s", "1m30s", "2h" into milliseconds */
function parseDuration(str: string): number | null {
  if (!str) return null

  let totalMs = 0
  const hours = str.match(/(\d+(?:\.\d+)?)h/)
  const minutes = str.match(/(\d+(?:\.\d+)?)m(?!s)/)
  const seconds = str.match(/(\d+(?:\.\d+)?)s/)
  const ms = str.match(/(\d+(?:\.\d+)?)ms/)

  if (hours) totalMs += parseFloat(hours[1]) * 3600000
  if (minutes) totalMs += parseFloat(minutes[1]) * 60000
  if (seconds) totalMs += parseFloat(seconds[1]) * 1000
  if (ms) totalMs += parseFloat(ms[1])

  return totalMs > 0 ? Math.round(totalMs) : null
}

/** Parse an ISO 8601 timestamp into ms-from-now */
function parseISOToMs(iso: string): number | null {
  if (!iso) return null

  try {
    const resetTime = new Date(iso).getTime()
    const now = Date.now()
    const diff = resetTime - now
    return diff > 0 ? Math.round(diff) : 0
  } catch {
    return null
  }
}

/** Safely parse a header value as a number */
function num(value: string | null | undefined): number | null {
  if (value == null || value === '') return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

/** OpenAI-style headers (also used by Groq, DeepSeek, Together, Fireworks, Perplexity, etc.) */
function parseOpenAIHeaders(get: HeaderGetter): RateLimits {
  return {
    requests_limit: num(get('x-ratelimit-limit-requests')),
    requests_remaining: num(get('x-ratelimit-remaining-requests')),
    tokens_limit: num(get('x-ratelimit-limit-tokens')),
    tokens_remaining: num(get('x-ratelimit-remaining-tokens')),
    reset_requests_ms: parseDuration(get('x-ratelimit-reset-requests') ?? ''),
    reset_tokens_ms: parseDuration(get('x-ratelimit-reset-tokens') ?? ''),
  }
}

/** Anthropic-specific headers */
function parseAnthropicHeaders(get: HeaderGetter): RateLimits {
  return {
    requests_limit: num(get('anthropic-ratelimit-requests-limit')),
    requests_remaining: num(get('anthropic-ratelimit-requests-remaining')),
    tokens_limit: num(get('anthropic-ratelimit-tokens-limit')),
    tokens_remaining: num(get('anthropic-ratelimit-tokens-remaining')),
    reset_requests_ms: parseISOToMs(get('anthropic-ratelimit-requests-reset') ?? ''),
    reset_tokens_ms: parseISOToMs(get('anthropic-ratelimit-tokens-reset') ?? ''),
  }
}

/** Provider → parser mapping */
const PARSERS: Record<string, (get: HeaderGetter) => RateLimits> = {
  openai: parseOpenAIHeaders,
  anthropic: parseAnthropicHeaders,
  // These providers follow OpenAI's header convention
  groq: parseOpenAIHeaders,
  deepseek: parseOpenAIHeaders,
  together: parseOpenAIHeaders,
  fireworks: parseOpenAIHeaders,
  perplexity: parseOpenAIHeaders,
  xai: parseOpenAIHeaders,
  mistral: parseOpenAIHeaders,
  'azure-openai': parseOpenAIHeaders,
  openrouter: parseOpenAIHeaders,
}

/**
 * Parse rate limit headers from a response for the given provider.
 * Accepts a getter function that retrieves header values by name.
 */
export function parseHeaders(provider: string, get: HeaderGetter): RateLimits {
  const parser = PARSERS[provider] ?? parseOpenAIHeaders
  return parser(get)
}

/**
 * Check if the parsed limits contain any meaningful data.
 * Returns false if all fields are null (no rate limit headers found).
 */
export function hasLimits(limits: RateLimits): boolean {
  return Object.values(limits).some((v) => v !== null)
}

// ─── Credit / balance header parsing ─────────────────────────────────

/**
 * OpenRouter exposes credit balance via OpenAI-style headers:
 *   x-ratelimit-limit-credits, x-ratelimit-remaining-credits
 * Also reports per-request cost via x-request-cost or x-usage-cost.
 */
function parseOpenRouterCredits(get: HeaderGetter): UsageCredits {
  return {
    credits_limit: num(get('x-ratelimit-limit-credits')),
    credits_remaining: num(get('x-ratelimit-remaining-credits')),
    request_cost: num(get('x-request-cost')) ?? num(get('x-usage-cost')),
  }
}

/**
 * Generic credit parser — checks common header patterns across providers.
 * Many providers are starting to include cost/credit headers.
 */
function parseGenericCredits(get: HeaderGetter): UsageCredits {
  return {
    credits_limit: num(get('x-ratelimit-limit-credits')) ?? num(get('x-credits-limit')),
    credits_remaining: num(get('x-ratelimit-remaining-credits')) ?? num(get('x-credits-remaining')),
    request_cost: num(get('x-request-cost')) ?? num(get('x-usage-cost')) ?? num(get('x-cost')),
  }
}

/** Provider → credit parser mapping */
const CREDIT_PARSERS: Record<string, (get: HeaderGetter) => UsageCredits> = {
  openrouter: parseOpenRouterCredits,
}

/**
 * Parse credit/balance headers from a response for the given provider.
 */
export function parseCredits(provider: string, get: HeaderGetter): UsageCredits {
  const parser = CREDIT_PARSERS[provider] ?? parseGenericCredits
  return parser(get)
}

/**
 * Check if the parsed credits contain any meaningful data.
 */
export function hasCredits(credits: UsageCredits): boolean {
  return Object.values(credits).some((v) => v !== null)
}
