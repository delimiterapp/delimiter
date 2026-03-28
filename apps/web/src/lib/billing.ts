/**
 * Billing data polling service.
 *
 * Fetches credit/balance data from AI provider billing APIs via
 * Pipedream Connect Proxy. Delimiter never stores or sees provider
 * credentials — Pipedream handles credential injection.
 *
 * Each provider has a different billing API shape. This module
 * normalizes them into a common BillingSnapshot.
 */

export interface BillingSnapshot {
  balance: number | null
  creditLimit: number | null
  periodSpend: number | null
  periodStart: Date | null
}

const PIPEDREAM_PROJECT_ID = process.env.PIPEDREAM_PROJECT_ID!
const PIPEDREAM_PROJECT_TOKEN = process.env.PIPEDREAM_PROJECT_TOKEN!
const PIPEDREAM_PROXY_BASE = 'https://api.pipedream.com/v1/connect'

/**
 * Call an external API via Pipedream Connect Proxy.
 * Pipedream injects the user's stored credentials automatically.
 */
async function pipedreamProxy(
  externalUserId: string,
  accountId: string,
  url: string,
  headers?: Record<string, string>,
): Promise<Response> {
  const res = await fetch(`${PIPEDREAM_PROXY_BASE}/${PIPEDREAM_PROJECT_ID}/proxy/${accountId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${PIPEDREAM_PROJECT_TOKEN}`,
      'Content-Type': 'application/json',
      'x-pd-external-user-id': externalUserId,
    },
    body: JSON.stringify({
      method: 'GET',
      url,
      headers: headers ?? {},
    }),
  })
  return res
}

// ─── Provider-specific billing fetchers ──────────────────────────

/**
 * OpenAI: GET /v1/organization/costs
 * Uses Admin API Key (stored in Pipedream).
 * Returns daily cost buckets.
 */
async function pollOpenAI(externalUserId: string, accountId: string): Promise<BillingSnapshot> {
  const now = Math.floor(Date.now() / 1000)
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)
  const monthStart = Math.floor(startOfMonth.getTime() / 1000)

  const res = await pipedreamProxy(
    externalUserId,
    accountId,
    `https://api.openai.com/v1/organization/costs?start_time=${monthStart}&end_time=${now}&bucket_width=1d`,
  )

  if (!res.ok) throw new Error(`OpenAI billing API returned ${res.status}`)
  const data = await res.json()

  // Sum up costs for the current billing period
  let periodSpend = 0
  if (data.data) {
    for (const bucket of data.data) {
      if (bucket.results) {
        for (const result of bucket.results) {
          periodSpend += result.amount?.value ?? 0
        }
      }
    }
  }

  // OpenAI uses prepaid credits — no direct "balance" endpoint.
  // Spend is the primary signal; balance tracked via credit grants.
  return {
    balance: null,
    creditLimit: null,
    periodSpend: periodSpend / 100, // OpenAI returns cents
    periodStart: startOfMonth,
  }
}

/**
 * Anthropic: GET /v1/organizations/cost_report
 * Uses Admin API Key (stored in Pipedream).
 */
async function pollAnthropic(externalUserId: string, accountId: string): Promise<BillingSnapshot> {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const res = await pipedreamProxy(
    externalUserId,
    accountId,
    `https://api.anthropic.com/v1/organizations/cost_report?starting_at=${startOfMonth.toISOString()}&ending_at=${now.toISOString()}&bucket_width=1d`,
    { 'anthropic-version': '2023-06-01' },
  )

  if (!res.ok) throw new Error(`Anthropic billing API returned ${res.status}`)
  const data = await res.json()

  let periodSpend = 0
  if (data.data) {
    for (const bucket of data.data) {
      // Anthropic returns amounts in USD cents as decimal strings
      periodSpend += parseFloat(bucket.amount ?? '0')
    }
  }

  return {
    balance: null,
    creditLimit: null,
    periodSpend: periodSpend / 100,
    periodStart: startOfMonth,
  }
}

/**
 * OpenRouter: GET /api/v1/credits
 * Has actual credit balance endpoint.
 */
async function pollOpenRouter(externalUserId: string, accountId: string): Promise<BillingSnapshot> {
  const res = await pipedreamProxy(
    externalUserId,
    accountId,
    'https://openrouter.ai/api/v1/credits',
  )

  if (!res.ok) throw new Error(`OpenRouter credits API returned ${res.status}`)
  const data = await res.json()

  const totalCredits = data.data?.total_credits ?? null
  const totalUsage = data.data?.total_usage ?? null

  return {
    balance: totalCredits != null && totalUsage != null ? totalCredits - totalUsage : null,
    creditLimit: totalCredits,
    periodSpend: totalUsage,
    periodStart: null,
  }
}

/**
 * xAI: GET /v1/billing/teams/{team_id}/credit-balance
 * Uses Management API Key (read-only).
 */
async function pollXAI(externalUserId: string, accountId: string): Promise<BillingSnapshot> {
  // First get team info
  const teamsRes = await pipedreamProxy(
    externalUserId,
    accountId,
    'https://management-api.x.ai/v1/teams',
  )

  if (!teamsRes.ok) throw new Error(`xAI teams API returned ${teamsRes.status}`)
  const teamsData = await teamsRes.json()
  const teamId = teamsData.data?.[0]?.id
  if (!teamId) throw new Error('No xAI team found')

  const balanceRes = await pipedreamProxy(
    externalUserId,
    accountId,
    `https://management-api.x.ai/v1/billing/teams/${teamId}/credit-balance`,
  )

  if (!balanceRes.ok) throw new Error(`xAI balance API returned ${balanceRes.status}`)
  const balanceData = await balanceRes.json()

  // xAI returns balance in USD cents
  return {
    balance: balanceData.balance != null ? balanceData.balance / 100 : null,
    creditLimit: null,
    periodSpend: null,
    periodStart: null,
  }
}

// ─── Provider registry ───────────────────────────────────────────

const POLLERS: Record<string, (userId: string, accountId: string) => Promise<BillingSnapshot>> = {
  openai: pollOpenAI,
  anthropic: pollAnthropic,
  openrouter: pollOpenRouter,
  xai: pollXAI,
}

/** Providers that support billing API connections */
export const SUPPORTED_PROVIDERS = [
  {
    id: 'openai',
    name: 'OpenAI',
    pipedreamApp: 'openai',
    keyType: 'Admin API Key',
    keyHint: 'Generate at platform.openai.com/settings/organization/admin-keys',
    capabilities: ['period_spend'],
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    pipedreamApp: 'anthropic',
    keyType: 'Admin API Key',
    keyHint: 'Generate in Claude Console under Organization Settings',
    capabilities: ['period_spend'],
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    pipedreamApp: 'openrouter',
    keyType: 'API Key',
    keyHint: 'Available at openrouter.ai/settings/keys',
    capabilities: ['balance', 'period_spend'],
  },
  {
    id: 'xai',
    name: 'xAI (Grok)',
    pipedreamApp: 'x-ai',
    keyType: 'Management Key (Read-only)',
    keyHint: 'Generate at console.x.ai with Read permission',
    capabilities: ['balance'],
  },
] as const

export type SupportedProviderId = typeof SUPPORTED_PROVIDERS[number]['id']

/**
 * Poll billing data for a connected provider.
 * Returns a normalized BillingSnapshot.
 */
export async function pollBillingData(
  provider: string,
  externalUserId: string,
  pipedreamAccountId: string,
): Promise<BillingSnapshot> {
  const poller = POLLERS[provider]
  if (!poller) throw new Error(`No billing poller for provider: ${provider}`)
  return poller(externalUserId, pipedreamAccountId)
}
