# Delimiter — UX Specification

The entire product is one flow: landing → sign in → dashboard. No nav maze, no settings labyrinth, no separate dev console. The dashboard IS the product.

---

## Developer Journey

```
1. Find Delimiter (GitHub, Twitter, HN)
2. Go to delimiter.app
3. Landing page — understand what it does in 5 seconds
4. Click "Sign in" — passkey triggers
5. Dashboard — empty state, shows SDK install snippet with their project key
6. Copy snippet, add to their app
7. First report hits — dashboard lights up
8. They're monitoring their rate limits across all providers
```

---

## Screen 1: Landing Page

**URL:** `delimiter.app` (unauthenticated)

### Layout

Dark background. Minimal. Developer aesthetic.

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  ◈ Delimiter                          [Sign in]     │
│                                                     │
│                                                     │
│       Know your AI rate limits                      │
│       before your app does.                         │
│                                                     │
│       Three lines of code. Every provider.          │
│       One dashboard.                                │
│                                                     │
│                                                     │
│       ┌─────────────────────────────────────┐       │
│       │ import { delimiter } from '@deli... │       │
│       │ delimiter.init('dlm_...')           │       │
│       │ const openai = delimiter.wrap(ne... │       │
│       └─────────────────────────────────────┘       │
│                                                     │
│       [Get started]                                 │
│                                                     │
│                                                     │
│  ── What it does ──────────────────────────────     │
│                                                     │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│   │  Wraps   │  │  Reads   │  │  Shows   │         │
│   │ your AI  │  │ response │  │ limits   │         │
│   │ clients  │  │ headers  │  │ in one   │         │
│   │          │  │          │  │ dashboard│         │
│   └──────────┘  └──────────┘  └──────────┘         │
│                                                     │
│   Your code → AI Provider → Response                │
│                                  ↓                  │
│                        Delimiter reads headers      │
│                                  ↓                  │
│                        Dashboard updates live       │
│                                                     │
│                                                     │
│  ── What it never does ────────────────────────     │
│                                                     │
│   ✗ Never touches your API keys                     │
│   ✗ Never modifies requests or responses            │
│   ✗ Never adds latency (async, fire-and-forget)     │
│   ✗ Never fails loudly (transparent if we're down)  │
│                                                     │
│                                                     │
│  ── Supported providers ───────────────────────     │
│                                                     │
│   [OpenAI logo]  [Anthropic logo]  + more coming    │
│                                                     │
│                                                     │
│  ── Pricing ───────────────────────────────────     │
│                                                     │
│   $20/mo: Unlimited everything                      │
│                                                     │
│                                                     │
│  GitHub · delimiter.app                             │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Copy

**Hero:**
- Headline: "Know your AI rate limits before your app does."
- Subhead: "Three lines of code. Every provider. One dashboard."
- CTA: "Get started"

**How it works (three cards):**
1. "Wrap your AI clients" — "Delimiter wraps your OpenAI and Anthropic SDKs with a lightweight Proxy. No code changes beyond three lines."
2. "We read the headers" — "Every AI API response includes rate limit headers. Delimiter extracts them silently after each call."
3. "See everything in one place" — "Real-time dashboard shows usage across all providers. Green, yellow, red. One glance."

**What it never does:**
- "Never touches your API keys — you create your client, we just wrap it"
- "Never modifies requests or responses — your calls work identically"
- "Never adds latency — reporting is async, fire-and-forget"
- "Never fails loudly — if we're down, your app doesn't notice"

**Pricing:**
- $20/month per workspace — unlimited providers, apps, reports, and alerts

---

## Screen 2: Sign In

**Trigger:** Click "Sign in" or "Get started" on landing page.

No separate page. Modal or inline expansion. Passkey flow:

```
┌──────────────────────────────────┐
│                                  │
│  Sign in to Delimiter            │
│                                  │
│  ┌────────────────────────────┐  │
│  │ Email                      │  │
│  └────────────────────────────┘  │
│                                  │
│  [Continue with passkey]         │
│                                  │
│  First time? We'll create your   │
│  account and set up a passkey.   │
│                                  │
└──────────────────────────────────┘
```

### Flow

1. User enters email
2. Click "Continue with passkey"
3. **If account exists:** Browser triggers passkey authentication (Touch ID, Windows Hello, etc.)
4. **If new account:** Browser triggers passkey creation, account is created automatically
5. Redirect to dashboard

No "sign up" vs "sign in" distinction. One flow. Enter email, passkey handles the rest. New users are created automatically on first passkey registration.

---

## Screen 3: Dashboard — Empty State

**URL:** `delimiter.app/dashboard` (authenticated, no data yet)

**This is the most important screen.** First thing a new user sees. It needs to:
1. Give them their project API key
2. Show the exact code to install
3. Make it dead obvious what to do next
4. Feel exciting, not empty

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  ◈ Delimiter                    user@email   [⚙]   │
│                                                     │
│ ─────────────────────────────────────────────────── │
│                                                     │
│                                                     │
│            ┌─────────────────────────┐              │
│            │                         │              │
│            │    ◈ Almost there.      │              │
│            │                         │              │
│            │    Add the SDK to your  │              │
│            │    app and your rate    │              │
│            │    limits will appear   │              │
│            │    here in real time.   │              │
│            │                         │              │
│            └─────────────────────────┘              │
│                                                     │
│                                                     │
│   Step 1 · Install                                  │
│   ┌─────────────────────────────────────────────┐   │
│   │ npm install @delimiter/sdk              [⎘] │   │
│   └─────────────────────────────────────────────┘   │
│                                                     │
│   Step 2 · Add to your app                          │
│   ┌─────────────────────────────────────────────┐   │
│   │ import { delimiter } from '@delimiter/sdk'  │   │
│   │                                             │   │
│   │ delimiter.init('dlm_cKj9x2mP4...')          │   │
│   │                                             │   │
│   │ // Wrap your AI clients                     │   │
│   │ const openai = delimiter.wrap(              │   │
│   │   new OpenAI({ apiKey: process.env.OPE... })│   │
│   │ )                                       [⎘] │   │
│   └─────────────────────────────────────────────┘   │
│                                                     │
│   Step 3 · Make an API call                         │
│                                                     │
│   Use your wrapped client normally. The moment      │
│   your first API call completes, this dashboard     │
│   will light up.                                    │
│                                                     │
│                                                     │
│   ┌─────────────────────────────────────────────┐   │
│   │ Your project key: dlm_cKj9x2mP4...   [⎘]  │   │
│   └─────────────────────────────────────────────┘   │
│                                                     │
│   Waiting for first report...  ◌                    │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Key Details

- **Project key is pre-filled** in the code snippet. User copies and it works immediately.
- **Copy buttons** [⎘] on every code block.
- **"Waiting for first report..."** with a subtle pulsing animation. When the first report arrives, this transitions to the live dashboard.
- The snippet shows their actual `dlm_` key, not a placeholder.
- **Settings gear** [⚙] in the header links to alert configuration.

### The Magic Moment

When the first SDK report hits `/api/report`:
1. The "Waiting for first report..." text fades out
2. The empty state smoothly transitions away
3. Provider health cards animate in
4. The health ring fills to the current usage level
5. The timeline starts with its first data point

This transition should feel alive. The dashboard goes from empty to monitoring in real time. No page refresh needed — SSE pushes the update.

---

## Screen 4: Dashboard — Live State

**URL:** `delimiter.app/dashboard` (authenticated, data flowing)

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  ◈ Delimiter                    user@email   [⚙]   │
│                                                     │
│ ─────────────────────────────────────────────────── │
│                                                     │
│  ┌──────────────┐  ┌──────────────┐                 │
│  │   ╭─────╮    │  │   ╭─────╮    │                 │
│  │   │     │    │  │   │     │    │                 │
│  │   │ 34% │    │  │   │ 71% │    │                 │
│  │   │     │    │  │   │     │    │                 │
│  │   ╰─────╯    │  │   ╰─────╯    │                 │
│  │   OpenAI     │  │  Anthropic   │                 │
│  │  3.4K / 10K  │  │  2.8K / 4K   │                 │
│  │   RPM        │  │   RPM        │                 │
│  └──────────────┘  └──────────────┘                 │
│                                                     │
│  ── OpenAI (expanded) ─────────────────────────     │
│                                                     │
│  Requests/min   ████████░░░░░░░░░░░░  3,421 / 10K  │
│  Tokens/min     █████████████░░░░░░░  1.3M / 2M    │
│  Tokens/day     ███░░░░░░░░░░░░░░░░░  12M / 150M   │
│                                                     │
│  ── Usage Timeline (24h) ──────────────────────     │
│                                                     │
│  RPM                                                │
│  10K ┤                                              │
│      │                    ╭──╮                       │
│   5K ┤    ╭──╮           │  │                       │
│      │───╯  ╰───────────╯  ╰──────                 │
│    0 ┼──────────────────────────────                │
│      12am    6am    12pm    6pm   now               │
│                                                     │
│  [OpenAI ●] [Anthropic ●] [All apps ▾]             │
│                                                     │
│  ── Recent Alerts ─────────────────────────────     │
│                                                     │
│  14:23  OpenAI   RPM 70% threshold   7,021 / 10K   │
│  09:41  Anthropic TPM 50% threshold  201K / 400K   │
│  03:12  OpenAI   RPM 90% threshold   9,102 / 10K   │
│                                                     │
│  ── Your SDK ──────────────────────────────────     │
│                                                     │
│  Project key: dlm_cKj9x2mP4...             [⎘]     │
│  Apps reporting: my-prod-app, staging                │
│  Providers detected: OpenAI, Anthropic              │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Provider Health Cards

- **Health ring:** SVG donut chart. Percentage = highest usage ratio across RPM/TPM for that provider.
  - Green: < 50%
  - Yellow: 50–80%
  - Red: 80%+
- **Numbers below ring:** Current RPM / RPM limit (or whichever metric is highest usage)
- **Click to expand:** Shows all metrics as progress bars
- Cards appear/disappear automatically as providers are detected from SDK traffic

### Usage Bars (Expanded Provider)

- Requests per minute: current / limit
- Tokens per minute: current / limit
- Tokens per day: current / limit
- Color matches health status (green/yellow/red gradient)
- Updates in real time via SSE

### Timeline Chart

- Default: 24 hours
- X-axis: time. Y-axis: usage (requests or tokens)
- One line per provider, color-coded
- Hover tooltip: exact numbers at that timestamp
- Toggle controls: provider filter, app filter, time range (1h, 6h, 24h, 7d)

### Alert Log

- Reverse chronological
- Each row: timestamp, provider, metric, threshold crossed, current/limit
- Subtle color coding: yellow for warning, red for critical

### SDK Info (Bottom)

- Project key with copy button (always accessible, never hidden)
- List of apps currently reporting
- List of detected providers
- Link to SDK docs

---

## Screen 5: Settings

**URL:** `delimiter.app/settings` (accessed via ⚙ gear icon)

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  ◈ Delimiter                    user@email   [⚙]   │
│                                                     │
│  ← Back to dashboard                                │
│                                                     │
│  ── Alert Thresholds ──────────────────────────     │
│                                                     │
│  Warning threshold     [70] %                       │
│  Critical threshold    [90] %                       │
│                                                     │
│  ── Notifications ─────────────────────────────     │
│                                                     │
│  ☑ Email: user@email.com                            │
│  ☐ Slack: [Enter webhook URL]                       │
│  ☐ Webhook: [Enter URL]                             │
│                                                     │
│  ── Project ───────────────────────────────────     │
│                                                     │
│  Project key: dlm_cKj9x2mP4...             [⎘]     │
│  [Regenerate key]                                   │
│                                                     │
│  ── Account ───────────────────────────────────     │
│                                                     │
│  Email: user@email.com                              │
│  Passkeys: 1 registered                             │
│  [Add another passkey]                              │
│                                                     │
│  ── Plan ──────────────────────────────────────     │
│                                                     │
│  Plan: $20/month                                    │
│  Status: Active                                     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Sections

1. **Alert Thresholds** — Two number inputs. Simple.
2. **Notifications** — Email (default, uses account email), Slack (webhook URL), generic webhook (URL). Checkboxes to enable/disable each.
3. **Project** — API key display + copy + regenerate. Regenerating invalidates the old key immediately.
4. **Account** — Email display, passkey management (add additional passkeys for other devices).
5. **Plan** — Current plan, usage meter, upgrade CTA. Upgrade links to Whop checkout.

---

## Design Principles

1. **Dark mode only (V1).** Developer tool. Dark is expected. Light mode can come later.
2. **Data density over whitespace.** Developers want information, not marketing space. Pack the dashboard with useful data.
3. **Color means something.** Green = safe. Yellow = watch it. Red = act now. Don't use these colors decoratively.
4. **No loading spinners on the dashboard.** SSE keeps it live. Data is always current.
5. **Copy buttons everywhere.** API key, install command, code snippets. One click to clipboard.
6. **Zero navigation depth.** Dashboard is one page. Settings is one page. That's it.

## Color Palette

```
Background:       #0a0a0a (near-black)
Surface:          #141414 (cards, code blocks)
Surface elevated: #1a1a1a (hover states, modals)
Border:           #262626 (subtle dividers)
Text primary:     #fafafa (white-ish)
Text secondary:   #a1a1a1 (muted)
Text tertiary:    #525252 (very muted)

Green:            #22c55e (safe, <50%)
Yellow:           #eab308 (warning, 50-80%)
Red:              #ef4444 (critical, 80%+)

Accent:           #3b82f6 (links, buttons, interactive)
Accent hover:     #2563eb

Code background:  #111111
Code text:        #e5e5e5
```

## Typography

- **Font:** System font stack (Inter if loading a web font is acceptable)
- **Monospace:** JetBrains Mono or system monospace for code, API keys, numbers
- **Dashboard numbers:** Monospace, slightly larger. Numbers should feel precise and technical.

## Responsive

V1 targets desktop. Developers monitor rate limits on their workstations. Mobile can come in V2 but is not a priority. The dashboard should work at 1024px+ width.
