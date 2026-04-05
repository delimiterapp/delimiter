import { describe, it, expect } from 'vitest'
import { parseHeaders, hasLimits, parseCredits, hasCredits } from '../headers'

function makeGetter(headers: Record<string, string>) {
  return (name: string) => headers[name] ?? null
}

describe('parseHeaders', () => {
  describe('OpenAI-style headers', () => {
    it('parses all rate limit fields', () => {
      const get = makeGetter({
        'x-ratelimit-limit-requests': '200',
        'x-ratelimit-remaining-requests': '150',
        'x-ratelimit-limit-tokens': '40000',
        'x-ratelimit-remaining-tokens': '35000',
        'x-ratelimit-reset-requests': '30s',
        'x-ratelimit-reset-tokens': '1m30s',
      })

      const limits = parseHeaders('openai', get)
      expect(limits.requests_limit).toBe(200)
      expect(limits.requests_remaining).toBe(150)
      expect(limits.tokens_limit).toBe(40000)
      expect(limits.tokens_remaining).toBe(35000)
      expect(limits.reset_requests_ms).toBe(30000)
      expect(limits.reset_tokens_ms).toBe(90000)
    })

    it('returns null for missing headers', () => {
      const limits = parseHeaders('openai', makeGetter({}))
      expect(limits.requests_limit).toBeNull()
      expect(limits.requests_remaining).toBeNull()
      expect(limits.tokens_limit).toBeNull()
      expect(limits.tokens_remaining).toBeNull()
      expect(limits.reset_requests_ms).toBeNull()
      expect(limits.reset_tokens_ms).toBeNull()
    })

    it('handles partial headers', () => {
      const get = makeGetter({
        'x-ratelimit-limit-requests': '100',
        'x-ratelimit-remaining-requests': '50',
      })

      const limits = parseHeaders('openai', get)
      expect(limits.requests_limit).toBe(100)
      expect(limits.requests_remaining).toBe(50)
      expect(limits.tokens_limit).toBeNull()
    })

    it('works for groq, deepseek, together, xai (OpenAI-compatible providers)', () => {
      const get = makeGetter({
        'x-ratelimit-limit-requests': '500',
        'x-ratelimit-remaining-requests': '499',
      })

      for (const provider of ['groq', 'deepseek', 'together', 'xai', 'fireworks', 'perplexity', 'mistral']) {
        const limits = parseHeaders(provider, get)
        expect(limits.requests_limit).toBe(500)
        expect(limits.requests_remaining).toBe(499)
      }
    })

    it('parses duration with hours', () => {
      const get = makeGetter({
        'x-ratelimit-reset-requests': '2h',
        'x-ratelimit-limit-requests': '100',
        'x-ratelimit-remaining-requests': '0',
      })
      const limits = parseHeaders('openai', get)
      expect(limits.reset_requests_ms).toBe(7200000)
    })

    it('parses compound durations like 1m30s', () => {
      const get = makeGetter({
        'x-ratelimit-reset-tokens': '2h30m15s',
      })
      const limits = parseHeaders('openai', get)
      expect(limits.reset_tokens_ms).toBe(2 * 3600000 + 30 * 60000 + 15 * 1000)
    })

    it('handles non-numeric header values gracefully', () => {
      const get = makeGetter({
        'x-ratelimit-limit-requests': 'not-a-number',
        'x-ratelimit-remaining-requests': '',
      })
      const limits = parseHeaders('openai', get)
      expect(limits.requests_limit).toBeNull()
      expect(limits.requests_remaining).toBeNull()
    })
  })

  describe('Anthropic-style headers', () => {
    it('parses all Anthropic rate limit fields', () => {
      const get = makeGetter({
        'anthropic-ratelimit-requests-limit': '1000',
        'anthropic-ratelimit-requests-remaining': '999',
        'anthropic-ratelimit-tokens-limit': '100000',
        'anthropic-ratelimit-tokens-remaining': '99000',
        'anthropic-ratelimit-requests-reset': '2030-01-01T00:00:00Z',
        'anthropic-ratelimit-tokens-reset': '2030-01-01T00:00:00Z',
      })

      const limits = parseHeaders('anthropic', get)
      expect(limits.requests_limit).toBe(1000)
      expect(limits.requests_remaining).toBe(999)
      expect(limits.tokens_limit).toBe(100000)
      expect(limits.tokens_remaining).toBe(99000)
      // Reset times should be positive (far future)
      expect(limits.reset_requests_ms).toBeGreaterThan(0)
      expect(limits.reset_tokens_ms).toBeGreaterThan(0)
    })

    it('handles past reset timestamps (returns 0)', () => {
      const get = makeGetter({
        'anthropic-ratelimit-requests-reset': '2020-01-01T00:00:00Z',
      })
      const limits = parseHeaders('anthropic', get)
      expect(limits.reset_requests_ms).toBe(0)
    })
  })

  describe('unknown provider', () => {
    it('falls back to OpenAI-style parsing', () => {
      const get = makeGetter({
        'x-ratelimit-limit-requests': '100',
        'x-ratelimit-remaining-requests': '50',
      })
      const limits = parseHeaders('some-new-provider', get)
      expect(limits.requests_limit).toBe(100)
      expect(limits.requests_remaining).toBe(50)
    })
  })
})

describe('hasLimits', () => {
  it('returns false when all fields are null', () => {
    expect(hasLimits({
      requests_limit: null,
      requests_remaining: null,
      tokens_limit: null,
      tokens_remaining: null,
      reset_requests_ms: null,
      reset_tokens_ms: null,
    })).toBe(false)
  })

  it('returns true when any field has a value', () => {
    expect(hasLimits({
      requests_limit: 100,
      requests_remaining: null,
      tokens_limit: null,
      tokens_remaining: null,
      reset_requests_ms: null,
      reset_tokens_ms: null,
    })).toBe(true)
  })

  it('returns true for zero values (0 is not null)', () => {
    expect(hasLimits({
      requests_limit: null,
      requests_remaining: 0,
      tokens_limit: null,
      tokens_remaining: null,
      reset_requests_ms: null,
      reset_tokens_ms: null,
    })).toBe(true)
  })
})

describe('parseCredits', () => {
  it('parses OpenRouter credit headers', () => {
    const get = makeGetter({
      'x-ratelimit-limit-credits': '100',
      'x-ratelimit-remaining-credits': '95.50',
      'x-request-cost': '0.003',
    })
    const credits = parseCredits('openrouter', get)
    expect(credits.credits_limit).toBe(100)
    expect(credits.credits_remaining).toBe(95.5)
    expect(credits.request_cost).toBe(0.003)
  })

  it('falls back to generic credit parsing for unknown providers', () => {
    const get = makeGetter({
      'x-credits-remaining': '42',
      'x-cost': '0.01',
    })
    const credits = parseCredits('some-provider', get)
    expect(credits.credits_remaining).toBe(42)
    expect(credits.request_cost).toBe(0.01)
  })
})

describe('hasCredits', () => {
  it('returns false when all fields are null', () => {
    expect(hasCredits({
      credits_limit: null,
      credits_remaining: null,
      request_cost: null,
    })).toBe(false)
  })

  it('returns true when any field has a value', () => {
    expect(hasCredits({
      credits_limit: null,
      credits_remaining: 50,
      request_cost: null,
    })).toBe(true)
  })
})
