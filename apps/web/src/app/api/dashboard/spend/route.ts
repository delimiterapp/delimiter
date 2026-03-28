import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const projectId = request.nextUrl.searchParams.get('projectId')
  if (!projectId) return NextResponse.json({ error: 'Missing projectId' }, { status: 400 })

  const project = await db.project.findFirst({ where: { id: projectId, userId: session.userId } })
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Get distinct providers that have credit data
  const providers = await db.usageCredit.findMany({
    where: { projectId },
    distinct: ['provider'],
    select: { provider: true },
  })

  const now = new Date()
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

  const providerCredits = await Promise.all(
    providers.map(async ({ provider }) => {
      // Latest credit snapshot
      const latest = await db.usageCredit.findFirst({
        where: { projectId, provider },
        orderBy: { timestamp: 'desc' },
      })
      if (!latest) return null

      // 24h spend: sum of request_cost over the last 24 hours
      const recentCosts = await db.usageCredit.aggregate({
        where: {
          projectId,
          provider,
          requestCost: { not: null },
          timestamp: { gte: twentyFourHoursAgo },
        },
        _sum: { requestCost: true },
        _count: true,
      })

      const spend24h = recentCosts._sum.requestCost ?? 0
      const requests24h = recentCosts._count

      // Calculate burn rate ($ per hour over 24h window)
      const burnRatePerHour = spend24h / 24

      // Projected depletion: hours until credits_remaining hits 0 at current burn rate
      let hoursUntilDepleted: number | null = null
      if (latest.creditsRemaining != null && burnRatePerHour > 0) {
        hoursUntilDepleted = latest.creditsRemaining / burnRatePerHour
      }

      // Balance percentage used
      let balanceUsedPct: number | null = null
      if (latest.creditsLimit && latest.creditsRemaining != null) {
        balanceUsedPct = ((latest.creditsLimit - latest.creditsRemaining) / latest.creditsLimit) * 100
      }

      // 24h timeline: 96 buckets (15-min intervals) of credit balance
      const timeline = await db.usageCredit.findMany({
        where: {
          projectId,
          provider,
          creditsRemaining: { not: null },
          timestamp: { gte: twentyFourHoursAgo },
        },
        orderBy: { timestamp: 'asc' },
        select: { creditsRemaining: true, timestamp: true },
      })

      // Bucket into 15-min intervals
      const buckets: { time: string; balance: number }[] = []
      const bucketSize = 15 * 60 * 1000
      for (let i = 0; i < 96; i++) {
        const bucketStart = new Date(twentyFourHoursAgo.getTime() + i * bucketSize)
        const bucketEnd = new Date(bucketStart.getTime() + bucketSize)
        const inBucket = timeline.filter(
          (t) => t.timestamp >= bucketStart && t.timestamp < bucketEnd
        )
        if (inBucket.length > 0) {
          const last = inBucket[inBucket.length - 1]
          buckets.push({
            time: bucketStart.toISOString(),
            balance: last.creditsRemaining!,
          })
        }
      }

      return {
        provider,
        creditsLimit: latest.creditsLimit,
        creditsRemaining: latest.creditsRemaining,
        lastRequestCost: latest.requestCost,
        balanceUsedPct,
        spend24h,
        requests24h,
        burnRatePerHour,
        hoursUntilDepleted,
        lastUpdated: latest.timestamp,
        timeline: buckets,
      }
    })
  )

  // Count credit-related alerts in last 24h
  const creditAlerts = await db.alertEvent.count({
    where: {
      projectId,
      metric: 'credits',
      timestamp: { gte: twentyFourHoursAgo },
    },
  })

  // Get connected provider billing data
  const connections = await db.providerConnection.findMany({
    where: { projectId, status: 'connected' },
  })
  const connectedProviders = connections.map((c) => ({
    provider: c.provider,
    balance: c.balance,
    creditLimit: c.creditLimit,
    periodSpend: c.periodSpend,
    periodStart: c.periodStart,
    lastPolledAt: c.lastPolledAt,
    source: 'billing-api' as const,
  }))

  return NextResponse.json({
    providers: providerCredits.filter(Boolean),
    connectedProviders,
    creditAlerts,
    hasData: providers.length > 0 || connections.length > 0,
  })
}
