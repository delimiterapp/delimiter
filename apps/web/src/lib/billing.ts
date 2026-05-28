import { CostExplorerClient, GetCostAndUsageCommand } from '@aws-sdk/client-cost-explorer'
import { PROVIDER_CATALOG } from './provider-catalog'

export interface BillingSnapshot {
  balance: number | null
  creditLimit: number | null
  periodSpend: number | null
  periodStart: Date | null
}

export interface CreditBalanceContext {
  creditBalanceEntry: number
  creditBalanceAsOf: Date
}

async function fetchOpenAISpend(apiKey: string, sinceTs: number, untilTs: number): Promise<number> {
  if (sinceTs >= untilTs) return 0

  const headers = { Authorization: `Bearer ${apiKey}` }
  let spend = 0
  let url: string | null = `https://api.openai.com/v1/organization/costs?start_time=${sinceTs}&end_time=${untilTs}&bucket_width=1d&limit=30`

  while (url) {
    const res = await fetch(url, { headers })
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      throw new Error(`OpenAI API error: ${res.status} ${body}`.trim())
    }

    const page = await res.json() as {
      data?: { results?: { amount?: { value?: number } }[] }[]
      has_more?: boolean
      next_page?: string
    }

    if (page.data) {
      for (const bucket of page.data) {
        if (bucket.results) {
          for (const result of bucket.results) {
            spend += Number(result.amount?.value ?? 0)
          }
        }
      }
    }

    if (page.has_more && page.next_page) {
      const base = new URL(`https://api.openai.com/v1/organization/costs`)
      base.searchParams.set('start_time', String(sinceTs))
      base.searchParams.set('end_time', String(untilTs))
      base.searchParams.set('bucket_width', '1d')
      base.searchParams.set('limit', '30')
      base.searchParams.set('page', page.next_page)
      url = base.toString()
    } else {
      url = null
    }
  }

  return spend
}

async function pollOpenAI(apiKey: string, creditCtx?: CreditBalanceContext): Promise<BillingSnapshot> {
  const now = Math.floor(Date.now() / 1000)
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)
  const monthStart = Math.floor(startOfMonth.getTime() / 1000)

  let periodSpend: number | null = null
  try {
    periodSpend = await fetchOpenAISpend(apiKey, monthStart, now)
  } catch {
    // costs endpoint may require admin key
  }

  let balance: number | null = null
  let creditLimit: number | null = null
  if (creditCtx) {
    creditLimit = creditCtx.creditBalanceEntry
    if (periodSpend == null) {
      balance = creditCtx.creditBalanceEntry
    } else {
      const sinceTs = Math.floor(creditCtx.creditBalanceAsOf.getTime() / 1000)
      if (sinceTs >= monthStart && sinceTs < now) {
        balance = creditCtx.creditBalanceEntry - periodSpend
      } else if (sinceTs >= now) {
        balance = creditCtx.creditBalanceEntry
      } else {
        try {
          const spendSince = await fetchOpenAISpend(apiKey, sinceTs, now)
          balance = creditCtx.creditBalanceEntry - spendSince
        } catch {
          balance = creditCtx.creditBalanceEntry - periodSpend
        }
      }
    }
  }

  return {
    balance,
    creditLimit,
    periodSpend: periodSpend != null && Number.isFinite(periodSpend) ? periodSpend : null,
    periodStart: startOfMonth,
  }
}

async function fetchAnthropicSpend(apiKey: string, since: Date, until: Date): Promise<number> {
  if (since >= until) return 0

  const headers = { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' }
  let spend = 0
  let url: string | null = `https://api.anthropic.com/v1/organizations/cost_report?starting_at=${since.toISOString()}&ending_at=${until.toISOString()}&bucket_width=1d&limit=100`

  while (url) {
    const res = await fetch(url, { headers })
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      throw new Error(`Anthropic API error: ${res.status} ${body}`.trim())
    }

    const page = await res.json() as {
      data?: { results?: { amount?: string }[] }[]
      has_more?: boolean
      next_page?: string
    }

    if (page.data) {
      for (const bucket of page.data) {
        if (bucket.results) {
          for (const result of bucket.results) {
            spend += Number(result.amount ?? 0)
          }
        }
      }
    }

    if (page.has_more && page.next_page) {
      const base = new URL('https://api.anthropic.com/v1/organizations/cost_report')
      base.searchParams.set('starting_at', since.toISOString())
      base.searchParams.set('ending_at', until.toISOString())
      base.searchParams.set('bucket_width', '1d')
      base.searchParams.set('limit', '100')
      base.searchParams.set('page', page.next_page)
      url = base.toString()
    } else {
      url = null
    }
  }

  return spend
}

async function pollAnthropic(apiKey: string, creditCtx?: CreditBalanceContext): Promise<BillingSnapshot> {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  let periodSpend: number | null = null
  try {
    periodSpend = await fetchAnthropicSpend(apiKey, startOfMonth, now)
  } catch {
    // cost_report requires admin key — if the user's key lacks permission, continue with null
  }

  let balance: number | null = null
  let creditLimit: number | null = null
  if (creditCtx) {
    creditLimit = creditCtx.creditBalanceEntry
    if (periodSpend == null) {
      balance = creditCtx.creditBalanceEntry
    } else if (creditCtx.creditBalanceAsOf >= now) {
      balance = creditCtx.creditBalanceEntry
    } else if (creditCtx.creditBalanceAsOf >= startOfMonth) {
      balance = creditCtx.creditBalanceEntry - periodSpend
    } else {
      try {
        const spendSince = await fetchAnthropicSpend(apiKey, creditCtx.creditBalanceAsOf, now)
        balance = creditCtx.creditBalanceEntry - spendSince
      } catch {
        balance = creditCtx.creditBalanceEntry - periodSpend
      }
    }
  }

  return {
    balance,
    creditLimit,
    periodSpend: periodSpend != null && Number.isFinite(periodSpend) ? periodSpend : null,
    periodStart: startOfMonth,
  }
}

async function pollOpenRouter(apiKey: string, _creditCtx?: CreditBalanceContext): Promise<BillingSnapshot> {
  const res = await fetch('https://openrouter.ai/api/v1/credits', {
    headers: { Authorization: `Bearer ${apiKey}` },
  })
  if (!res.ok) throw new Error(`OpenRouter API error: ${res.status}`)

  const data = await res.json() as { data?: { total_credits?: number; total_usage?: number } }

  const totalCredits = data.data?.total_credits ?? null
  const totalUsage = data.data?.total_usage ?? null

  return {
    balance: totalCredits != null && totalUsage != null ? totalCredits - totalUsage : null,
    creditLimit: totalCredits,
    periodSpend: totalUsage,
    periodStart: null,
  }
}

async function pollXAI(apiKey: string, creditCtx?: CreditBalanceContext): Promise<BillingSnapshot> {
  const headers = { Authorization: `Bearer ${apiKey}` }
  let teamId: string | undefined

  // Try management key validation first
  const mgmtRes = await fetch('https://management-api.x.ai/auth/management-keys/validation', { headers })
  if (mgmtRes.ok) {
    const mgmt = await mgmtRes.json() as { teamId?: string; scopeId?: string }
    teamId = mgmt.teamId || mgmt.scopeId
  } else {
    // Fall back to regular API key validation
    const keyRes = await fetch('https://api.x.ai/v1/api-key', { headers })
    if (!keyRes.ok) {
      const body = await keyRes.json().catch(() => null) as { error?: string } | null
      throw new Error(body?.error || `xAI API error: ${keyRes.status}`)
    }
    const keyInfo = await keyRes.json() as { team_id?: string }
    teamId = keyInfo.team_id
  }

  let balance: number | null = null
  let creditLimit: number | null = null
  let periodSpend: number | null = null

  if (teamId) {
    try {
      const balanceRes = await fetch(
        `https://management-api.x.ai/v1/billing/teams/${teamId}/prepaid/balance`,
        { headers },
      )
      if (balanceRes.ok) {
        const balanceData = await balanceRes.json() as { total?: { val?: string }; changes?: { changeOrigin?: string; amount?: { val?: string } }[] }
        const cents = parseInt(balanceData.total?.val ?? '', 10)
        if (Number.isFinite(cents)) {
          balance = Math.abs(cents) / 100
          // Sum purchases as credit limit
          let totalPurchased = 0
          let totalSpent = 0
          for (const c of balanceData.changes ?? []) {
            const amt = parseInt(c.amount?.val ?? '0', 10)
            if (c.changeOrigin === 'PURCHASE') totalPurchased += Math.abs(amt)
            if (c.changeOrigin === 'SPEND') totalSpent += Math.abs(amt)
          }
          if (totalPurchased > 0) creditLimit = totalPurchased / 100
          if (totalSpent > 0) periodSpend = totalSpent / 100
        }
      }
    } catch {
      // Billing not accessible
    }
  }

  if (creditCtx) {
    creditLimit = creditCtx.creditBalanceEntry
    if (balance == null) balance = creditCtx.creditBalanceEntry
  }

  return {
    balance,
    creditLimit,
    periodSpend,
    periodStart: null,
  }
}

async function pollPendingProvider(apiKey: string, _creditCtx?: CreditBalanceContext): Promise<BillingSnapshot> {
  if (!apiKey.trim()) throw new Error('Credential is required')

  return {
    balance: null,
    creditLimit: null,
    periodSpend: null,
    periodStart: null,
  }
}

function parseAwsCredential(raw: string): { accessKeyId: string; secretAccessKey: string; region: string } {
  const parsed = JSON.parse(raw)
  if (!parsed.accessKeyId || !parsed.secretAccessKey) {
    throw new Error('Credential JSON must include accessKeyId and secretAccessKey')
  }
  return {
    accessKeyId: parsed.accessKeyId,
    secretAccessKey: parsed.secretAccessKey,
    region: parsed.region || 'us-east-1',
  }
}

async function pollBedrock(apiKey: string, creditCtx?: CreditBalanceContext): Promise<BillingSnapshot> {
  const creds = parseAwsCredential(apiKey)
  const credentials = { accessKeyId: creds.accessKeyId, secretAccessKey: creds.secretAccessKey }

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endDate = new Date(now)
  endDate.setDate(endDate.getDate() + 1)
  const monthPeriod = {
    Start: startOfMonth.toISOString().split('T')[0],
    End: endDate.toISOString().split('T')[0],
  }

  const ceClient = new CostExplorerClient({ region: 'us-east-1', credentials })

  // Bedrock usage appears under Marketplace entries like
  // "Claude Opus 4.6 (Amazon Bedrock Edition)", not "Amazon Bedrock".
  // Query RECORD_TYPE=Usage to get gross spend before credit offsets.
  const grossResponse = await ceClient.send(new GetCostAndUsageCommand({
    TimePeriod: monthPeriod,
    Granularity: 'MONTHLY',
    Metrics: ['UnblendedCost'],
    Filter: { Dimensions: { Key: 'RECORD_TYPE', Values: ['Usage'] } },
    GroupBy: [{ Type: 'DIMENSION', Key: 'SERVICE' }],
  }))

  let periodSpend = 0
  for (const result of grossResponse.ResultsByTime ?? []) {
    for (const group of result.Groups ?? []) {
      const service = ((group.Keys ?? [])[0] ?? '').toLowerCase()
      if (service.includes('bedrock')) {
        periodSpend += parseFloat(group.Metrics?.UnblendedCost?.Amount ?? '0')
      }
    }
  }

  // If user entered a credit balance, calculate remaining by querying
  // total credits consumed (all services) since that date.
  let balance: number | null = null
  let creditLimit: number | null = null
  if (creditCtx) {
    creditLimit = creditCtx.creditBalanceEntry
    const sinceDay = creditCtx.creditBalanceAsOf.toISOString().split('T')[0]
    const endDay = endDate.toISOString().split('T')[0]
    if (sinceDay >= endDay) {
      balance = creditCtx.creditBalanceEntry
    } else {
    const sincePeriod = { Start: sinceDay, End: endDay }
    try {
      const creditsResponse = await ceClient.send(new GetCostAndUsageCommand({
        TimePeriod: sincePeriod,
        Granularity: 'MONTHLY',
        Metrics: ['UnblendedCost'],
        Filter: { Dimensions: { Key: 'RECORD_TYPE', Values: ['Credit'] } },
      }))
      let creditsBurned = 0
      for (const result of creditsResponse.ResultsByTime ?? []) {
        creditsBurned += Math.abs(parseFloat(result.Total?.UnblendedCost?.Amount ?? '0'))
      }
      balance = creditCtx.creditBalanceEntry - creditsBurned
    } catch {
      balance = null
    }
    }
  }

  return {
    balance,
    creditLimit,
    periodSpend,
    periodStart: startOfMonth,
  }
}

async function pollSupabase(apiKey: string, creditCtx?: CreditBalanceContext): Promise<BillingSnapshot> {
  const headers = { Authorization: `Bearer ${apiKey}` }

  const orgsRes = await fetch('https://api.supabase.com/v1/organizations', { headers })
  if (!orgsRes.ok) {
    const body = await orgsRes.text().catch(() => '')
    throw new Error(`Supabase API error: ${orgsRes.status} ${body}`.trim())
  }

  const orgs = await orgsRes.json() as { id: string; slug: string }[]
  if (!orgs.length) throw new Error('No Supabase organizations found for this token')

  const orgSlug = orgs[0].slug
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  let periodSpend: number | null = null
  try {
    const usageRes = await fetch(
      `https://api.supabase.com/v1/organizations/${orgSlug}/billing/usage`,
      { headers },
    )
    if (usageRes.ok) {
      const usage = await usageRes.json() as { total_usage?: number; usages?: { usage?: number; cost?: number }[] }
      if (usage.total_usage != null) {
        periodSpend = usage.total_usage / 100
      } else if (usage.usages) {
        let total = 0
        for (const u of usage.usages) {
          total += u.cost ?? 0
        }
        periodSpend = total / 100
      }
    }
  } catch {
    // usage endpoint may not be accessible
  }

  let balance: number | null = null
  let creditLimit: number | null = null
  if (creditCtx) {
    creditLimit = creditCtx.creditBalanceEntry
    balance = periodSpend != null
      ? creditCtx.creditBalanceEntry - periodSpend
      : creditCtx.creditBalanceEntry
  }

  return {
    balance,
    creditLimit,
    periodSpend,
    periodStart: startOfMonth,
  }
}

const POLLERS: Record<string, (apiKey: string, creditCtx?: CreditBalanceContext) => Promise<BillingSnapshot>> = {
  openai: pollOpenAI,
  anthropic: pollAnthropic,
  openrouter: pollOpenRouter,
  xai: pollXAI,
  google: pollPendingProvider,
  bedrock: pollBedrock,
  supabase: pollSupabase,
  increase: pollPendingProvider,
  serper: pollPendingProvider,
  parallel: pollPendingProvider,
  neon: pollPendingProvider,
  vapi: pollPendingProvider,
  retell: pollPendingProvider,
  livekit: pollPendingProvider,
  pipecat: pollPendingProvider,
  stripe: pollPendingProvider,
  google_maps: pollPendingProvider,
  smooth: pollPendingProvider,
  digitalocean: pollPendingProvider,
  render: pollPendingProvider,
  elevenlabs: pollPendingProvider,
}

export const SUPPORTED_PROVIDERS = PROVIDER_CATALOG

export type SupportedProviderId = typeof SUPPORTED_PROVIDERS[number]['id']

export async function pollBillingData(provider: string, apiKey: string, creditCtx?: CreditBalanceContext): Promise<BillingSnapshot> {
  const poller = POLLERS[provider]
  if (!poller) throw new Error(`No billing poller for provider: ${provider}`)
  return poller(apiKey, creditCtx)
}
