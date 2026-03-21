# @delimiter/sdk

Lightweight rate limit monitoring for AI APIs. Wraps your existing OpenAI and Anthropic clients, reads response headers, reports to [delimiter.app](https://delimiter.app).

Zero interference. Zero latency. Never touches your API keys.

## Install

```bash
npm install @delimiter/sdk
# or
pnpm add @delimiter/sdk
# or
yarn add @delimiter/sdk
```

## Quick Start

```javascript
import { delimiter } from '@delimiter/sdk'
import OpenAI from 'openai'

// 1. Initialize with your project key (from delimiter.app dashboard)
delimiter.init('dlm_your_project_key')

// 2. Wrap your AI client
const openai = delimiter.wrap(new OpenAI({ apiKey: process.env.OPENAI_KEY }))

// 3. Use it exactly as before
const response = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Hello' }]
})

// That's it. Your delimiter.app dashboard is now live.
```

## Multiple Providers

```javascript
import { delimiter } from '@delimiter/sdk'
import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'

delimiter.init('dlm_your_project_key')

const openai = delimiter.wrap(new OpenAI({ apiKey: process.env.OPENAI_KEY }))
const anthropic = delimiter.wrap(new Anthropic({ apiKey: process.env.ANTHROPIC_KEY }))

// Both report to the same dashboard
const chat = await openai.chat.completions.create({ model: 'gpt-4o', messages: [{ role: 'user', content: 'Hi' }] })
const message = await anthropic.messages.create({ model: 'claude-sonnet-4-20250514', max_tokens: 1024, messages: [{ role: 'user', content: 'Hi' }] })
```

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

### `delimiter.wrap(client)`

Wrap an AI provider client. Returns a proxied version of the same client with identical types and API.

```typescript
// TypeScript: return type matches input type
const openai: OpenAI = delimiter.wrap(new OpenAI({ apiKey: '...' }))
const anthropic: Anthropic = delimiter.wrap(new Anthropic({ apiKey: '...' }))
```

The wrapped client is a transparent proxy. All methods, properties, and types are preserved. The only difference: after each API response, Delimiter reads the rate limit headers and reports them asynchronously.

## What Gets Reported

After every API call, the SDK extracts rate limit headers and sends a report:

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

| Provider | Wrapper | Headers Parsed |
|----------|---------|----------------|
| **OpenAI** | `delimiter.wrap(new OpenAI(...))` | `x-ratelimit-limit-requests`, `x-ratelimit-remaining-requests`, `x-ratelimit-limit-tokens`, `x-ratelimit-remaining-tokens`, `x-ratelimit-reset-requests`, `x-ratelimit-reset-tokens` |
| **Anthropic** | `delimiter.wrap(new Anthropic(...))` | `anthropic-ratelimit-requests-limit`, `anthropic-ratelimit-requests-remaining`, `anthropic-ratelimit-tokens-limit`, `anthropic-ratelimit-tokens-remaining`, `anthropic-ratelimit-requests-reset`, `anthropic-ratelimit-tokens-reset` |

The SDK auto-detects the provider from the client instance. No configuration needed.

## Security

**The SDK never touches your API keys.**

You create your AI client with your own API key, stored however you want (env vars, Vault, AWS Secrets Manager). You pass the already-configured client to `delimiter.wrap()`. The SDK only sees response headers — rate limit numbers, not credentials.

**The SDK never modifies your requests or responses.**

The Proxy wrapper intercepts method returns, not method inputs. Your API calls are identical with or without Delimiter.

**The SDK never adds latency to your API calls.**

Header extraction happens synchronously (nanoseconds). Reporting is a background POST that fires after your response is already returned.

**The SDK never fails loudly.**

All reporting is wrapped in try/catch with silent failure. If Delimiter's backend is unreachable, the SDK does nothing. Your app continues working normally.

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

The SDK is written in TypeScript and ships type definitions. The wrapped client preserves the original client's types:

```typescript
import { delimiter } from '@delimiter/sdk'
import OpenAI from 'openai'

delimiter.init('dlm_key')

// openai is typed as OpenAI — full autocomplete, full type safety
const openai = delimiter.wrap(new OpenAI({ apiKey: process.env.OPENAI_KEY! }))

// All OpenAI types work as expected
const response: OpenAI.Chat.ChatCompletion = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Hello' }]
})
```

## How It Works Internally

1. `delimiter.wrap(client)` returns a deep [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) around your AI client
2. Property access (like `openai.chat.completions`) is proxied recursively
3. When a method is called (like `.create()`), the Proxy wraps the return value
4. If the return value is a Promise, the Proxy attaches a `.then()` handler
5. The handler reads rate limit headers from the response object
6. A fire-and-forget POST sends the parsed headers to the Delimiter API
7. The original response is returned to your code, unchanged

The Proxy pattern means the SDK works with any method on any provider client — no need to enumerate every API endpoint. If the provider adds new endpoints, the SDK wraps them automatically.

## Requirements

- Node.js 18+
- One of: `openai` (v4+), `@anthropic-ai/sdk` (v0.20+)

## License

[MIT](https://github.com/delimiterapp/delimiter/blob/main/LICENSE)
