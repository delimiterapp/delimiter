# @delimiter/sdk

Lightweight rate limit monitoring for AI APIs. Initialize once, monitor everything — [delimiter.app](https://delimiter.app).

Zero interference. Zero latency. Zero maintenance. Never touches your API keys.

## Install

```bash
npm install @delimiter/sdk
# or
pnpm add @delimiter/sdk
# or
yarn add @delimiter/sdk
```

No peer dependencies. Works with any AI provider SDK, any framework, or raw `fetch()` calls.

## Quick Start

```javascript
import { delimiter } from '@delimiter/sdk'

// Initialize once at app startup
delimiter.init('dlm_your_project_key')

// Use your AI clients as normal — Delimiter monitors automatically
const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY })

const response = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Hello' }]
})

// That's it. Your delimiter.app dashboard is now live.
```

## Multiple Providers

No extra setup needed. Use as many providers as you want — Delimiter detects them all.

```javascript
import { delimiter } from '@delimiter/sdk'
import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'

delimiter.init('dlm_your_project_key')

const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY })
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_KEY })

// Both are automatically monitored — no wrapping needed
const chat = await openai.chat.completions.create({ model: 'gpt-4o', messages: [{ role: 'user', content: 'Hi' }] })
const message = await anthropic.messages.create({ model: 'claude-sonnet-4-20250514', max_tokens: 1024, messages: [{ role: 'user', content: 'Hi' }] })
```

Add Anthropic 6 months from now? Just start using it. Delimiter detects it automatically — no code changes.

## Multi-App Tagging

If you run multiple apps against the same AI provider accounts, tag them:

```javascript
delimiter.init('dlm_your_project_key', { app: 'my-production-app' })
```

Your dashboard will show which app is consuming what percentage of your rate limits. Useful for identifying which service to throttle when you're approaching limits.

## Configuration

### `delimiter.init(projectKey, options?)`

Initialize the SDK. Call once at app startup.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `projectKey` | `string` | Yes | Your project API key from delimiter.app. Starts with `dlm_`. |
| `options.app` | `string` | No | App name tag. Defaults to `"default"`. |
| `options.endpoint` | `string` | No | Custom reporting endpoint. Defaults to `https://delimiter.app/api/report`. Use this for self-hosted instances. |
| `options.enabled` | `boolean` | No | Enable/disable reporting. Defaults to `true`. Set to `false` in test environments. |
| `options.debug` | `boolean` | No | Log reports to console. Defaults to `false`. |

## What Gets Reported

After every AI API call, the SDK extracts rate limit headers and sends a report:

```json
{
  "app": "my-production-app",
  "provider": "openai",
  "model": "gpt-4o",
  "timestamp": "2025-01-15T14:23:01.456Z",
  "limits": {
    "requests_limit": 10000,
    "requests_remaining": 7342,
    "tokens_limit": 2000000,
    "tokens_remaining": 1456000,
    "reset_requests_ms": 43000,
    "reset_tokens_ms": 12000
  }
}
```

This is sent as an async fire-and-forget POST. It never blocks your API call. If the report fails to send, it's silently dropped.

## Supported Providers

| Provider | Domain | Headers Parsed |
|----------|--------|----------------|
| **OpenAI** | `api.openai.com` | `x-ratelimit-limit-requests`, `x-ratelimit-remaining-requests`, `x-ratelimit-limit-tokens`, `x-ratelimit-remaining-tokens`, `x-ratelimit-reset-requests`, `x-ratelimit-reset-tokens` |
| **Anthropic** | `api.anthropic.com` | `anthropic-ratelimit-requests-limit`, `anthropic-ratelimit-requests-remaining`, `anthropic-ratelimit-tokens-limit`, `anthropic-ratelimit-tokens-remaining`, `anthropic-ratelimit-requests-reset`, `anthropic-ratelimit-tokens-reset` |

The SDK auto-detects providers by domain. Works with official SDKs, LangChain, Vercel AI SDK, LiteLLM, or raw `fetch()` calls.

## Security

**The SDK never touches your API keys.**

API keys are sent in request headers. Delimiter only reads response headers — rate limit numbers, not credentials. Your keys never leave your environment.

**The SDK never modifies your requests or responses.**

The HTTP instrumentation is read-only on responses. Your API calls are identical with or without Delimiter.

**The SDK never adds latency to your API calls.**

Header extraction happens synchronously (nanoseconds). Reporting is a background POST that fires after your response is already returned.

**The SDK never fails loudly.**

All reporting is wrapped in try/catch with silent failure. If Delimiter's backend is unreachable, the SDK does nothing. Your app continues working normally.

## How It Works Internally

1. `delimiter.init()` patches `globalThis.fetch` and Node's `http.request`/`https.request`
2. On every outbound request, the SDK checks the URL against known AI provider domains
3. Non-matching requests pass through with zero overhead
4. For matching requests, the SDK reads rate-limit headers from the response
5. A fire-and-forget POST sends the parsed headers to the Delimiter API
6. The original response is returned to your code, unchanged

This is the same auto-instrumentation technique used by Datadog, Sentry, and New Relic. It works with any HTTP client or framework because it sits at the network layer.

## Environments

```javascript
// Production — reporting enabled (default)
delimiter.init('dlm_key')

// Testing — disable reporting
delimiter.init('dlm_key', { enabled: false })

// Development — enable debug logging
delimiter.init('dlm_key', { debug: true })

// Self-hosted — custom endpoint
delimiter.init('dlm_key', { endpoint: 'https://my-delimiter.example.com/api/report' })
```

## TypeScript

The SDK is written in TypeScript and ships type definitions. Since Delimiter works at the network layer, your AI client types are completely unaffected — no wrapping, no type changes, no generics to worry about.

## Requirements

- Node.js 18+

## License

[MIT](https://github.com/delimiterapp/delimiter/blob/main/LICENSE)
