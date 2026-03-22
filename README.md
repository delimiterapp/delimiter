# Delimiter

**Real-time AI rate limit monitoring for developers.**

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![npm](https://img.shields.io/npm/v/@delimiter/sdk.svg)](https://www.npmjs.com/package/@delimiter/sdk)

Delimiter is a lightweight SDK that monitors your AI API rate limits across every provider in one dashboard. Two lines of code. Zero maintenance. Never touches your API keys.

[delimiter.app](https://delimiter.app)

---

## The Problem

Every AI provider has rate limits. When you hit them, your app breaks — users get errors, production goes down.

Today there's no unified way to monitor rate limits across providers. OpenAI shows limits in their console. Anthropic shows theirs. You find out you've hit a limit when your app is already returning 429s.

Delimiter reads the rate limit headers that every AI API already returns on every response, aggregates them, and shows you — across all providers — how close you are to the edge.

## How It Works

```
Your App → AI Provider API → Response
                                 ↓
                       Delimiter reads rate-limit headers
                                 ↓
                       Async POST to delimiter.app
                                 ↓
                       Dashboard updates in real time
```

When you call `delimiter.init()`, the SDK hooks into Node's HTTP layer — `globalThis.fetch` and `http`/`https` modules. Every outbound request is checked against known AI provider domains (`api.openai.com`, `api.anthropic.com`, etc.). When a match is found, Delimiter reads the rate-limit headers from the response. Reporting is async and fire-and-forget. If Delimiter's backend is down, your app doesn't notice.

This means Delimiter works with any AI SDK, any framework (LangChain, Vercel AI SDK, LiteLLM), or raw `fetch()` calls.

## Quick Start

### 1. Sign in at [delimiter.app](https://delimiter.app)

Passkey auth — no passwords. Click, biometric confirms, you're in.

### 2. Copy your project key from the dashboard

### 3. Install the SDK

```bash
npm install @delimiter/sdk
```

### 4. Initialize Delimiter

```javascript
import { delimiter } from '@delimiter/sdk'

delimiter.init('dlm_your_project_key')

// That's it. All AI API calls are now automatically monitored.
const response = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Hello' }]
})
```

Your dashboard lights up. Add a new provider later? Just start using it — Delimiter detects it automatically.

## What You See

One screen. One glance.

**Provider Health Cards** — A row of cards, one per connected provider. Each shows a health ring: green (<50% of limit), yellow (50–80%), red (80%+). You see across all providers in one second.

**Usage Bars** — Click any provider card to expand. Requests per minute, tokens per minute, tokens per day — each as a progress bar showing current vs. limit.

**Timeline** — 24-hour usage chart across all providers. Spikes are visible immediately. Hover for exact numbers.

**Alert Log** — Every threshold crossing logged: timestamp, provider, which limit, which app, current value vs. limit.

**Multi-App Support** — Tag each SDK instance with an app name:

```javascript
delimiter.init('dlm_your_project_key', { app: 'my-production-app' })
```

Dashboard shows which app is consuming what percentage of your limits. You know exactly which app to throttle.

## What The SDK Never Does

- **Never reads, stores, or transmits your API keys.** API keys are in request headers. Delimiter only reads response headers — rate-limit numbers, not credentials.
- **Never modifies requests or responses.** Your API calls work exactly as before.
- **Never adds latency.** Reporting is async, fire-and-forget. The POST to Delimiter happens after your response is returned.
- **Never fails loudly.** If Delimiter's backend is down, your app keeps working normally.

## What Headers Delimiter Reads

Every major AI provider returns rate limit information in response headers. Delimiter parses these automatically.

**OpenAI:**
```
x-ratelimit-limit-requests: 10000
x-ratelimit-remaining-requests: 7342
x-ratelimit-limit-tokens: 2000000
x-ratelimit-remaining-tokens: 1456000
x-ratelimit-reset-requests: 43s
x-ratelimit-reset-tokens: 12s
```

**Anthropic:**
```
anthropic-ratelimit-requests-limit: 4000
anthropic-ratelimit-requests-remaining: 3201
anthropic-ratelimit-tokens-limit: 400000
anthropic-ratelimit-tokens-remaining: 312000
anthropic-ratelimit-requests-reset: 2025-01-15T14:24:00Z
anthropic-ratelimit-tokens-reset: 2025-01-15T14:23:15Z
```

The SDK normalizes these into a common format and reports them to the dashboard.

## Supported Providers

| Provider | Status | Header Support |
|----------|--------|----------------|
| OpenAI | ✅ Supported | Full headers on every response |
| Anthropic | ✅ Supported | Full headers on every response |
| Google Gemini | 🔜 Coming | Service Usage API |
| Mistral | 🔜 Coming | Partial headers |

## Alerts

Configure thresholds in the dashboard. Defaults: warn at 70%, critical at 90%.

Notification channels:
- **Email** — built in
- **Slack** — webhook URL
- **Webhook** — any HTTP endpoint

Alerts fire when any provider crosses your threshold. You get a message before your app starts returning 429s.

## Pricing

| Plan | Price | What You Get |
|------|-------|--------------|
| **Free** | $0 | 1 provider, 1 app, 1,000 reports/day, email alerts, 7-day history |
| **Pro** | $20/month | Unlimited providers & apps, unlimited reports, Slack + webhook alerts, 90-day history |

## Self-Hosting

Delimiter is MIT licensed. You can self-host the entire stack.

```bash
git clone https://github.com/delimiterapp/delimiter.git
cd delimiter
pnpm install

# Set up your Postgres database
cp apps/web/.env.example apps/web/.env
# Edit .env with your DATABASE_URL and other config

# Run migrations
pnpm --filter web db:push

# Start the dev server
pnpm dev
```

The SDK's reporting endpoint is configurable:

```javascript
delimiter.init('dlm_your_project_key', {
  endpoint: 'https://your-delimiter-instance.com/api/report'
})
```

## Architecture

```
delimiter/
├── packages/
│   └── sdk/                  # @delimiter/sdk — npm package
│       └── src/
│           ├── index.ts      # init() export
│           ├── types.ts      # TypeScript definitions
│           ├── instrument.ts # HTTP layer patching (fetch, http, https)
│           ├── providers.ts  # Domain-to-provider mapping
│           ├── headers.ts    # Header parsing per provider
│           └── reporter.ts   # Async fire-and-forget POST
└── apps/
    └── web/                  # Next.js — dashboard + API
        └── src/
            ├── app/          # App Router pages + API routes
            ├── components/   # Dashboard UI components
            └── lib/          # DB, auth, alerts
```

**Stack:** pnpm monorepo, Turborepo, TypeScript everywhere. SDK built with tsup (CJS + ESM). Web app is Next.js + Tailwind + Prisma + Postgres (Neon). Passkey auth via WebAuthn. Charts via Recharts.

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup.

## Contributing

Delimiter is open source under the MIT license. Contributions welcome.

```bash
git clone https://github.com/delimiterapp/delimiter.git
cd delimiter
pnpm install
pnpm dev
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## License

[MIT](LICENSE)
