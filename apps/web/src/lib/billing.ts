import { CostExplorerClient, GetCostAndUsageCommand } from '@aws-sdk/client-cost-explorer'
import { BudgetsClient, DescribeBudgetsCommand } from '@aws-sdk/client-budgets'
import { STSClient, GetCallerIdentityCommand } from '@aws-sdk/client-sts'
import { PROVIDER_CATALOG } from './provider-catalog'

export interface BillingSnapshot {
  balance: number | null
  creditLimit: number | null
  periodSpend: number | null
  periodStart: Date | null
}

async function pollOpenAI(apiKey: string): Promise<BillingSnapshot> {
  const now = Math.floor(Date.now() / 1000)
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)
  const monthStart = Math.floor(startOfMonth.getTime() / 1000)

  const res = await fetch(
    `https://api.openai.com/v1/organization/costs?start_time=${monthStart}&end_time=${now}&bucket_width=1d`,
    { headers: { Authorization: `Bearer ${apiKey}` } },
  )
  if (!res.ok) throw new Error(`OpenAI API error: ${res.status}`)

  const data = await res.json() as { data?: { results?: { amount?: { value?: number } }[] }[] }

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
    periodSpend: periodSpend / 100,
    periodStart: startOfMonth,
  }
}

async function pollAnthropic(apiKey: string): Promise<BillingSnapshot> {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const res = await fetch(
    `https://api.anthropic.com/v1/organizations/cost_report?starting_at=${startOfMonth.toISOString()}&ending_at=${now.toISOString()}&bucket_width=1d`,
    { headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' } },
  )
  if (!res.ok) throw new Error(`Anthropic API error: ${res.status}`)

  const data = await res.json() as { data?: { amount?: string }[] }

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

async function pollBedrock(apiKey: string): Promise<BillingSnapshot> {
  const creds = parseAwsCredential(apiKey)
  const credentials = { accessKeyId: creds.accessKeyId, secretAccessKey: creds.secretAccessKey }

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endDate = new Date(now)
  endDate.setDate(endDate.getDate() + 1)

  // Cost Explorer is global — always us-east-1
  const ceClient = new CostExplorerClient({ region: 'us-east-1', credentials })
  const ceResponse = await ceClient.send(new GetCostAndUsageCommand({
    TimePeriod: {
      Start: startOfMonth.toISOString().split('T')[0],
      End: endDate.toISOString().split('T')[0],
    },
    Granularity: 'MONTHLY',
    Metrics: ['UnblendedCost'],
    Filter: {
      Dimensions: { Key: 'SERVICE', Values: ['Amazon Bedrock'] },
    },
  }))

  let periodSpend = 0
  for (const result of ceResponse.ResultsByTime ?? []) {
    periodSpend += parseFloat(result.Total?.UnblendedCost?.Amount ?? '0')
  }

  let creditLimit: number | null = null
  try {
    const stsClient = new STSClient({ region: 'us-east-1', credentials })
    const identity = await stsClient.send(new GetCallerIdentityCommand({}))
    const accountId = identity.Account
    if (accountId) {
      const budgetsClient = new BudgetsClient({ region: 'us-east-1', credentials })
      const budgetsResponse = await budgetsClient.send(new DescribeBudgetsCommand({
        AccountId: accountId,
      }))
      for (const budget of budgetsResponse.Budgets ?? []) {
        if (budget.BudgetLimit?.Amount) {
          const limit = parseFloat(budget.BudgetLimit.Amount)
          if (creditLimit === null || limit > creditLimit) creditLimit = limit
        }
      }
    }
  } catch {
    // Budgets access may not be configured — non-fatal
  }

  return {
    balance: creditLimit != null ? creditLimit - periodSpend : null,
    creditLimit,
    periodSpend,
    periodStart: startOfMonth,
  }
}

const POLLERS: Record<string, (apiKey: string) => Promise<BillingSnapshot>> = {
  openai: pollOpenAI,
  anthropic: pollAnthropic,
  openrouter: pollOpenRouter,
  xai: pollXAI,
  google: pollPendingProvider,
  bedrock: pollBedrock,
}

export const SUPPORTED_PROVIDERS = PROVIDER_CATALOG

export type SupportedProviderId = typeof SUPPORTED_PROVIDERS[number]['id']

export async function pollBillingData(provider: string, apiKey: string): Promise<BillingSnapshot> {
  const poller = POLLERS[provider]
  if (!poller) throw new Error(`No billing poller for provider: ${provider}`)
  return poller(apiKey)
}
