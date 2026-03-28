import type { DelimiterConfig, DelimiterOptions, RateLimitReport } from './types'
import { instrument, restore } from './instrument'
import { detectProviderFromClient } from './providers'
import { parseHeaders, hasLimits, parseCredits, hasCredits } from './headers'
import { sendReport } from './reporter'
import { sendProviderHints } from './hints'

// Re-export types for consumers
export type { DelimiterOptions, RateLimitReport, RateLimits, UsageCredits } from './types'

let _config: DelimiterConfig | null = null

/**
 * The Delimiter SDK object.
 *
 * Usage:
 * ```ts
 * import { delimiter } from '@delimiter/sdk'
 * delimiter.init('dlm_your_project_key')
 * ```
 */
export const delimiter = {
  /**
   * Initialize Delimiter. Call once at app startup.
   * Patches `globalThis.fetch` and Node's `http/https.request` to
   * automatically monitor rate limits from AI provider APIs.
   */
  init(projectKey: string, options?: DelimiterOptions): void {
    if (!projectKey || typeof projectKey !== 'string') {
      console.warn('[delimiter] init() requires a project key. Get one at https://delimiter.app')
      return
    }

    _config = {
      projectKey,
      app: options?.app ?? 'default',
      endpoint: options?.endpoint ?? 'https://delimiter.app/api/report',
      enabled: options?.enabled ?? true,
      debug: options?.debug ?? false,
    }

    if (_config.debug) {
      console.log('[delimiter] initialized', { app: _config.app, endpoint: _config.endpoint })
    }

    if (_config.enabled) {
      instrument(_config)
      sendProviderHints(_config)
    }
  },

  /**
   * Wrap an AI provider client with a Proxy that monitors rate limits.
   * The returned client has identical types and API — only rate limit
   * headers are read from responses and reported.
   *
   * ```ts
   * const openai = delimiter.wrap(new OpenAI({ apiKey: '...' }))
   * ```
   */
  wrap<T extends object>(client: T): T {
    if (!_config) {
      console.warn('[delimiter] wrap() called before init(). Call delimiter.init() first.')
      return client
    }

    if (!_config.enabled) {
      return client
    }

    const config = _config
    const provider = detectProviderFromClient(client)

    return createDeepProxy(client, config, provider)
  },

  /**
   * Restore original `fetch` and `http/https.request` functions.
   * Useful for testing or cleanup.
   */
  destroy(): void {
    restore()
    _config = null
  },
}

/**
 * Create a deep proxy around an AI client.
 * Property access is proxied recursively. Method calls are wrapped
 * to intercept responses and extract rate limit headers.
 */
function createDeepProxy<T extends object>(target: T, config: DelimiterConfig, provider: string): T {
  // Cache proxied properties to avoid creating new proxies on every access
  const proxyCache = new WeakMap<object, object>()

  return new Proxy(target, {
    get(obj, prop, receiver) {
      const value: unknown = Reflect.get(obj, prop, receiver)

      if (value == null) return value

      // Wrap functions to intercept their return values
      if (typeof value === 'function') {
        const fn = value as (...a: unknown[]) => unknown
        return function (this: unknown, ...args: unknown[]) {
          try {
            const result = fn.apply(obj, args)

            // If the result is a Promise, attach a .then() to read headers
            if (result && typeof result === 'object' && typeof (result as { then?: unknown }).then === 'function') {
              return (result as Promise<unknown>).then((response: unknown) => {
                try {
                  interceptWrapResponse(config, provider, response, args)
                } catch {
                  // Never interfere
                }
                return response
              })
            }

            return result
          } catch (err) {
            throw err
          }
        }
      }

      // Recursively proxy nested objects (e.g., openai.chat.completions)
      if (typeof value === 'object') {
        const existing = proxyCache.get(value as object)
        if (existing) return existing

        const proxied = createDeepProxy(value as object, config, provider)
        proxyCache.set(value as object, proxied)
        return proxied
      }

      return value
    },
  })
}

/**
 * Attempt to extract rate limit headers from a wrap() response.
 * AI SDK responses sometimes expose the raw HTTP response or headers.
 */
function interceptWrapResponse(
  config: DelimiterConfig,
  provider: string,
  response: unknown,
  args: unknown[],
): void {
  if (!response || typeof response !== 'object') return

  const resp = response as Record<string, unknown>

  // Try to find headers on the response object
  // OpenAI SDK: response has response_headers or the raw response
  // Anthropic SDK: response may have headers from the raw HTTP response
  let headerGetter: ((name: string) => string | null) | null = null

  // Check for response_headers (some SDK versions)
  if (resp.response_headers && typeof resp.response_headers === 'object') {
    const headers = resp.response_headers as Record<string, string>
    headerGetter = (name: string) => headers[name] ?? headers[name.toLowerCase()] ?? null
  }

  // Check for rawResponse or _response with headers
  const rawResponse = (resp._response ?? resp.rawResponse ?? resp.httpResponse) as Record<string, unknown> | undefined
  if (!headerGetter && rawResponse && typeof rawResponse === 'object') {
    if (rawResponse.headers) {
      if (typeof (rawResponse.headers as { get?: unknown }).get === 'function') {
        headerGetter = (name: string) => (rawResponse.headers as { get: (n: string) => string | null }).get(name)
      } else if (typeof rawResponse.headers === 'object') {
        const headers = rawResponse.headers as Record<string, string>
        headerGetter = (name: string) => headers[name] ?? headers[name.toLowerCase()] ?? null
      }
    }
  }

  if (!headerGetter) return

  const limits = parseHeaders(provider, headerGetter)
  const credits = parseCredits(provider, headerGetter)
  if (!hasLimits(limits) && !hasCredits(credits)) return

  // Extract model from the first argument (usually the params object)
  let model: string | null = null
  if (args.length > 0 && args[0] && typeof args[0] === 'object') {
    const params = args[0] as Record<string, unknown>
    if (typeof params.model === 'string') {
      model = params.model
    }
  }

  // Also check the response for model field
  if (!model && typeof resp.model === 'string') {
    model = resp.model
  }

  sendReport(config, {
    app: config.app,
    provider,
    model,
    timestamp: new Date().toISOString(),
    limits,
    credits: hasCredits(credits) ? credits : null,
  })
}
