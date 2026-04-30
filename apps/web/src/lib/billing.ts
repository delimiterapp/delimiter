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

async function pollOpenAI(apiKey: string): Promise<BillingSnapshot> {
  const now = Math.floor(Date.now() / 1000)
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)
  const monthStart = Math.floor(startOfMonth.getTime() / 1000)

  const headers = { Authorization: `Bearer ${apiKey}` }
  let periodSpend = 0
  let url: string | null = `https://api.openai.com/v1/organization/costs?start_time=${monthStart}&end_time=${now}&bucket_width=1d&limit=30`

  while (url) {
    const res = await fetch(url, { headers })
    if (!res.ok) throw new Error(`OpenAI API error: ${res.status}`)

    const page = await res.json() as {
      data?: { results?: { amount?: { value?: number } }[] }[]
      has_more?: boolean
      next_page?: string
    }

    if (page.data) {
      for (const bucket of page.data) {
        if (bucket.results) {
          for (const result of bucket.results) {
            periodSpend += Number(result.amount?.value ?? 0)
          }
        }
      }
    }

    if (page.has_more && page.next_page) {
      const base = new URL(`https://api.openai.com/v1/organization/costs`)
      base.searchParams.set('start_time', String(monthStart))
      base.searchParams.set('end_time', String(now))
      base.searchParams.set('bucket_width', '1d')
      base.searchParams.set('limit', '30')
      base.searchParams.set('page', page.next_page)
      url = base.toString()
    } else {
      url = null
    }
  }

  return {
    balance: null,
    creditLimit: null,
    periodSpend: Number.isFinite(periodSpend) ? periodSpend : null,
    periodStart: startOfMonth,
  }
}

async function pollAnthropic(apiKey: string): Promise<BillingSnapshot> {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const headers = { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' }
  let periodSpend = 0
  let url: string | null = `https://api.anthropic.com/v1/organizations/cost_report?starting_at=${startOfMonth.toISOString()}&ending_at=${now.toISOString()}&bucket_width=1d&limit=100`

  while (url) {
    const res = await fetch(url, { headers })
    if (!res.ok) throw new Error(`Anthropic API error: ${res.status}`)

    const page = await res.json() as {
      data?: { results?: { amount?: string }[] }[]
      has_more?: boolean
      next_page?: string
    }

    if (page.data) {
      for (const bucket of page.data) {
        if (bucket.results) {
          for (const result of bucket.results) {
            periodSpend += Number(result.amount ?? 0)
          }
        }
      }
    }

    if (page.has_more && page.next_page) {
      const base = new URL('https://api.anthropic.com/v1/organizations/cost_report')
      base.searchParams.set('starting_at', startOfMonth.toISOString())
      base.searchParams.set('ending_at', now.toISOString())
      base.searchParams.set('bucket_width', '1d')
      base.searchParams.set('limit', '100')
      base.searchParams.set('page', page.next_page)
      url = base.toString()
    } else {
      url = null
    }
  }

  return {
    balance: null,
    creditLimit: null,
    periodSpend: Number.isFinite(periodSpend) ? periodSpend : null,
    periodStart: startOfMonth,
  }
}

async function pollOpenRouter(apiKey: string): Promise<BillingSnapshot> {
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

async function pollXAI(apiKey: string): Promise<BillingSnapshot> {
  const teamsRes = await fetch('https://management-api.x.ai/v1/teams', {
    headers: { Authorization: `Bearer ${apiKey}` },
  })
  if (!teamsRes.ok) throw new Error(`xAI API error: ${teamsRes.status}`)

  const teamsData = await teamsRes.json() as { data?: { id?: string }[] }
  const teamId = teamsData.data?.[0]?.id
  if (!teamId) throw new Error('No xAI team found')

  const balanceRes = await fetch(
    `https://management-api.x.ai/v1/billing/teams/${teamId}/credit-balance`,
    { headers: { Authorization: `Bearer ${apiKey}` } },
  )
  if (!balanceRes.ok) throw new Error(`xAI billing error: ${balanceRes.status}`)

  const balanceData = await balanceRes.json() as { balance?: number }

  return {
    balance: balanceData.balance != null ? balanceData.balance / 100 : null,
    creditLimit: null,
    periodSpend: null,
    periodStart: null,
  }
}

async function pollPendingProvider(apiKey: string): Promise<BillingSnapshot> {
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
    const sincePeriod = {
      Start: creditCtx.creditBalanceAsOf.toISOString().split('T')[0],
      End: endDate.toISOString().split('T')[0],
    }
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
}

export const SUPPORTED_PROVIDERS = PROVIDER_CATALOG

export type SupportedProviderId = typeof SUPPORTED_PROVIDERS[number]['id']

export async function pollBillingData(provider: string, apiKey: string, creditCtx?: CreditBalanceContext): Promise<BillingSnapshot> {
  const poller = POLLERS[provider]
  if (!poller) throw new Error(`No billing poller for provider: ${provider}`)
  return poller(apiKey, creditCtx)
}
