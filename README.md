# Delimiter

**Sentry for AI apps. Prevent chat blackouts before they happen.**

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![npm](https://img.shields.io/npm/v/@delimiter/sdk.svg)](https://www.npmjs.com/package/@delimiter/sdk)

Delimiter monitors everything that can take your AI app offline — rate limit exhaustion, credit depletion, provider outages. Two lines of code. Never touches your API keys.

[delimiter.app](https://delimiter.app)

---

## The Problem

Your AI app goes dark for two reasons: you hit rate limits, or your credits run out. Both are silent killers — you find out when users are already seeing error screens.

Rate limits are scattered across provider dashboards. Credit balances live in separate billing consoles. There's no single place that tells you "your OpenAI balance hits zero in 12 hours" or "you're at 90% of your Anthropic request limit."

Delimiter monitors both — rate limits from SDK response headers, credit balances from provider billing APIs — and alerts you before blackouts happen.

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

GitHub OAuth — one click, you're in.

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

One dashboard. Two layers of protection.

### Rate Limits (via SDK)

**Provider Health Cards** — A row of cards, one per provider. Health ring: green (<50%), yellow (50–80%), red (80%+). All providers at a glance.

**Usage Bars** — Requests per minute, tokens per minute — each as a progress bar showing current vs. limit.

**Timeline** — 24-hour usage chart. Spikes visible immediately.

**Multi-App Support** — Tag each SDK instance with an app name:

```javascript
delimiter.init('dlm_your_project_key', { app: 'my-production-app' })
```

### Spend Monitoring (via Provider Connections)

Connect your provider accounts to monitor credit balances. Delimiter never stores your credentials — authentication is handled via Pipedream Connect.

**Balance Monitoring** — Remaining balance, period spend, burn rate per hour.

**Projected Depletion** — "Your OpenAI balance hits zero in 18 hours" with color-coded urgency.

**Blackout Alerts** — Alerts fire when balances cross warning/critical thresholds, same as rate limits. Balance running out = AI blackout.

Supported connections: **OpenAI**, **Anthropic**, **OpenRouter**, **xAI (Grok)**. More coming.

### Alerts

Every threshold crossing logged: timestamp, provider, metric (requests, tokens, or spend), current value vs. limit. Warn at 70%, critical at 90% (configurable).

## What The SDK Never Does

- **Never reads, stores, or transmits your API keys.** API keys are in request headers. Delimiter only reads response headers — rate-limit numbers, not credentials.
- **Never modifies requests or responses.** Your API calls work exactly as before.
- **Never adds latency.** Reporting is async, fire-and-forget. The POST to Delimiter happens after your response is returned.
- **Never fails loudly.** If Delimiter's backend is down, your app keeps working normally.

## Supported Providers

Delimiter auto-detects any AI provider at the network layer. No plugins, no per-provider config.

| Provider | Domain |
|----------|--------|
| OpenAI | `api.openai.com` |
| Anthropic | `api.anthropic.com` |
| Google Gemini | `generativelanguage.googleapis.com` |
| Mistral | `api.mistral.ai` |
| Cohere | `api.cohere.com` |
| Groq | `api.groq.com` |
| DeepSeek | `api.deepseek.com` |
| xAI | `api.x.ai` |
| Perplexity | `api.perplexity.ai` |
| Together AI | `api.together.xyz` |
| Fireworks AI | `api.fireworks.ai` |
| Replicate | `api.replicate.com` |
| Azure OpenAI | `*.openai.azure.com` |
| Amazon Bedrock | `bedrock-runtime.*.amazonaws.com` |
| OpenRouter | `openrouter.ai` |

...and any provider that speaks HTTP. The list grows with every SDK update — your code doesn't change.

## Two Tiers of Monitoring

| | SDK (Passive) | Provider Connections |
|---|---|---|
| **What it monitors** | Rate limits (requests, tokens) | Balances, spend |
| **How it works** | Reads HTTP response headers | Polls provider billing APIs |
| **Setup** | `delimiter.init('key')` — 2 lines | Click "Connect" in dashboard |
| **Credentials** | Never sees your API keys | Via Pipedream Connect (you authenticate directly with provider) |
| **Data freshness** | Real-time (every API call) | Polled (15–30 min intervals) |
| **Blackout type** | Rate limit exhaustion (429s) | Credit depletion (account suspended) |

## Pricing

**$20/month** per workspace — unlimited providers, apps, reports, and alerts.

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

**Stack:** pnpm monorepo, Turborepo, TypeScript everywhere. SDK built with tsup (CJS + ESM). Web app is Next.js + Tailwind + Prisma + Postgres (Neon). GitHub OAuth. Provider connections via Pipedream Connect.

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup.

## Contributing

Contributions welcome.

```bash
git clone https://github.com/delimiterapp/delimiter.git
cd delimiter
pnpm install
pnpm dev
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## License

[MIT](LICENSE)
