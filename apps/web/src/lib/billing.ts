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

import { getPipedreamClient } from './pipedream'

export interface BillingSnapshot {
  balance: number | null
  creditLimit: number | null
  periodSpend: number | null
  periodStart: Date | null
}

/**
 * Extract a user-friendly error message from a Pipedream proxy error.
 * Pipedream SDK throws PipedreamError with raw status codes and response bodies.
 * We parse these to surface the upstream provider's actual error message.
 */
function extractProxyErrorMessage(err: unknown): string {
  if (!(err instanceof Error)) return 'Unknown error'

  // PipedreamError has a `body` property with the upstream response
  const pdErr = err as Error & { statusCode?: number; body?: unknown }

  if (pdErr.body && typeof pdErr.body === 'object') {
    const body = pdErr.body as Record<string, unknown>

    // Provider error format (Anthropic/OpenAI): { error: { type, message } }
    if (body.error && typeof body.error === 'object') {
      const nested = body.error as Record<string, unknown>
      if (typeof nested.message === 'string') {
        if (nested.type === 'authentication_error') {
          return `Authentication failed: ${nested.message}. Ensure you are using an Admin API Key (not a regular API key).`
        }
        return `${nested.type}: ${nested.message}`
      }
    }

    // Generic message field
    if (typeof body.message === 'string') return body.message
  }

  // Fall back to the raw Error message but clean up the PipedreamError format
  return err.message
}

/**
 * Call an external API via Pipedream Connect Proxy.
 * Pipedream injects the user's stored credentials automatically.
 */
async function proxyGet(
  externalUserId: string,
  accountId: string,
  url: string,
  headers?: Record<string, string>,
): Promise<unknown> {
  const pd = getPipedreamClient()
  try {
    const resp = await pd.proxy.get({
      externalUserId,
      accountId,
      url,
      headers: headers ?? {},
    })
    return resp
  } catch (err) {
    throw new Error(extractProxyErrorMessage(err))
  }
}

// ─── Provider-specific billing fetchers ──────────────────────────

/**
 * OpenAI: GET /v1/organization/costs
 * Uses Admin API Key (stored in Pipedream).
 * Returns daily cost buckets.
 */
async function pollOpenAI(externalUserId: string, accountId: string): Promise<BillingSnapshot> {
  const now = Math.floor(Date.now() / 1000)
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)
  const monthStart = Math.floor(startOfMonth.getTime() / 1000)

  const data = await proxyGet(
    externalUserId,
    accountId,
    `https://api.openai.com/v1/organization/costs?start_time=${monthStart}&end_time=${now}&bucket_width=1d`,
  ) as { data?: { results?: { amount?: { value?: number } }[] }[] }

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

  const data = await proxyGet(
    externalUserId,
    accountId,
    `https://api.anthropic.com/v1/organizations/cost_report?starting_at=${startOfMonth.toISOString()}&ending_at=${now.toISOString()}&bucket_width=1d`,
    { 'anthropic-version': '2023-06-01' },
  ) as { data?: { amount?: string }[] }

  let periodSpend = 0
  if (data.data) {
    for (const bucket of data.data) {
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
  const data = await proxyGet(
    externalUserId,
    accountId,
    'https://openrouter.ai/api/v1/credits',
  ) as { data?: { total_credits?: number; total_usage?: number } }

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
  const teamsData = await proxyGet(
    externalUserId,
    accountId,
    'https://management-api.x.ai/v1/teams',
  ) as { data?: { id?: string }[] }

  const teamId = teamsData.data?.[0]?.id
  if (!teamId) throw new Error('No xAI team found')

  const balanceData = await proxyGet(
    externalUserId,
    accountId,
    `https://management-api.x.ai/v1/billing/teams/${teamId}/credit-balance`,
  ) as { balance?: number }

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
