import type { DelimiterConfig } from './types'
import { detectProvider } from './providers'
import { parseHeaders, hasLimits } from './headers'
import { sendReport, setOriginalFetch } from './reporter'

// Store originals for restore()
let _originalFetch: typeof globalThis.fetch | null = null
let _originalHttpRequest: typeof import('node:http').request | null = null
let _originalHttpsRequest: typeof import('node:https').request | null = null
let _patched = false

/**
 * Extract model name from a JSON request body string.
 */
function extractModel(body: string | null): string | null {
  if (!body) return null
  try {
    const parsed = JSON.parse(body)
    return typeof parsed.model === 'string' ? parsed.model : null
  } catch {
    return null
  }
}

/**
 * Build a header getter from a fetch Response.
 */
function fetchHeaderGetter(response: Response): (name: string) => string | null {
  return (name: string) => response.headers.get(name)
}

/**
 * Build a header getter from Node.js http.IncomingMessage headers.
 */
function nodeHeaderGetter(headers: Record<string, string | string[] | undefined>): (name: string) => string | null {
  return (name: string) => {
    const val = headers[name.toLowerCase()]
    if (val == null) return null
    return Array.isArray(val) ? val[0] : val
  }
}

/**
 * Patch globalThis.fetch to intercept AI provider responses.
 */
function patchFetch(config: DelimiterConfig): void {
  if (typeof globalThis.fetch !== 'function') return

  _originalFetch = globalThis.fetch
  setOriginalFetch(_originalFetch)

  globalThis.fetch = function delimiterFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url
    const provider = detectProvider(url)

    if (!provider) {
      return _originalFetch!.call(globalThis, input, init)
    }

    // Extract model from request body (read-only — never modify)
    let bodyStr: string | null = null
    if (init?.body) {
      if (typeof init.body === 'string') {
        bodyStr = init.body
      } else if (init.body instanceof ArrayBuffer || ArrayBuffer.isView(init.body)) {
        try {
          bodyStr = new TextDecoder().decode(init.body as ArrayBuffer)
        } catch {
          // Can't decode — skip model extraction
        }
      }
    }
    const model = extractModel(bodyStr)

    return _originalFetch!.call(globalThis, input, init).then((response: Response) => {
      try {
        const limits = parseHeaders(provider, fetchHeaderGetter(response))
        if (hasLimits(limits)) {
          sendReport(config, {
            app: config.app,
            provider,
            model,
            timestamp: new Date().toISOString(),
            limits,
          })
        }
      } catch {
        // Never interfere with the response
      }
      return response
    })
  }
}

/**
 * Patch Node.js http/https.request to intercept AI provider responses.
 */
function patchNodeHttp(config: DelimiterConfig): void {
  let http: typeof import('node:http')
  let https: typeof import('node:https')

  try {
    http = require('node:http')
    https = require('node:https')
  } catch {
    // Not in Node.js — skip
    return
  }

  _originalHttpRequest = http.request
  _originalHttpsRequest = https.request

  function wrapRequest(
    original: typeof http.request,
    protocol: string,
  ): typeof http.request {
    return function delimiterRequest(this: unknown, ...args: unknown[]) {
      // Parse args to extract the URL/options
      const req = original.apply(http, args as Parameters<typeof http.request>)

      let url: string | null = null
      const firstArg = args[0]

      if (typeof firstArg === 'string') {
        url = firstArg
      } else if (firstArg instanceof URL) {
        url = firstArg.toString()
      } else if (firstArg && typeof firstArg === 'object') {
        const opts = firstArg as { hostname?: string; host?: string; path?: string; port?: number | string }
        const host = opts.hostname || opts.host || ''
        const port = opts.port ? `:${opts.port}` : ''
        const path = opts.path || '/'
        url = `${protocol}//${host}${port}${path}`
      }

      const provider = url ? detectProvider(url) : null
      if (!provider) return req

      // Capture request body chunks for model extraction
      const bodyChunks: Buffer[] = []
      const originalWrite = req.write
      const originalEnd = req.end

      req.write = function (this: typeof req, ...writeArgs: unknown[]) {
        const chunk = writeArgs[0]
        if (chunk) {
          if (typeof chunk === 'string') {
            bodyChunks.push(Buffer.from(chunk))
          } else if (Buffer.isBuffer(chunk)) {
            bodyChunks.push(chunk)
          }
        }
        return originalWrite.apply(this, writeArgs as Parameters<typeof originalWrite>)
      } as typeof req.write

      req.end = function (this: typeof req, ...endArgs: unknown[]) {
        const chunk = endArgs[0]
        if (chunk) {
          if (typeof chunk === 'string') {
            bodyChunks.push(Buffer.from(chunk))
          } else if (Buffer.isBuffer(chunk)) {
            bodyChunks.push(chunk)
          }
        }

        // Listen for the response to extract headers
        req.on('response', (res) => {
          try {
            const bodyStr = bodyChunks.length > 0 ? Buffer.concat(bodyChunks).toString('utf-8') : null
            const model = extractModel(bodyStr)
            const limits = parseHeaders(provider, nodeHeaderGetter(res.headers))
            if (hasLimits(limits)) {
              sendReport(config, {
                app: config.app,
                provider,
                model,
                timestamp: new Date().toISOString(),
                limits,
              })
            }
          } catch {
            // Never interfere with the response
          }
        })

        return originalEnd.apply(this, endArgs as Parameters<typeof originalEnd>)
      } as typeof req.end

      return req
    } as typeof http.request
  }

  http.request = wrapRequest(_originalHttpRequest, 'http:')
  https.request = wrapRequest(_originalHttpsRequest, 'https:')
}

/**
 * Instrument fetch and Node http/https to monitor AI provider rate limits.
 */
export function instrument(config: DelimiterConfig): void {
  if (_patched) return
  _patched = true

  patchFetch(config)
  patchNodeHttp(config)
}

/**
 * Restore original fetch and http/https.request functions.
 */
export function restore(): void {
  if (!_patched) return

  if (_originalFetch) {
    globalThis.fetch = _originalFetch
    _originalFetch = null
  }

  try {
    const http = require('node:http')
    const https = require('node:https')
    if (_originalHttpRequest) http.request = _originalHttpRequest
    if (_originalHttpsRequest) https.request = _originalHttpsRequest
  } catch {
    // Not in Node.js
  }

  _originalHttpRequest = null
  _originalHttpsRequest = null
  _patched = false
}
