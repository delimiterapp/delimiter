import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const projectId = request.nextUrl.searchParams.get('projectId')
  if (!projectId) return NextResponse.json({ error: 'Missing projectId' }, { status: 400 })

  // Verify ownership
  const project = await db.project.findFirst({ where: { id: projectId, userId: session.userId } })
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Get distinct providers
  const providers = await db.rateLimitReport.findMany({
    where: { projectId },
    distinct: ['provider'],
    select: { provider: true },
  })

  // Get latest report per provider
  const providerData = await Promise.all(
    providers.map(async ({ provider }) => {
      // Prefer the latest report with real rate limit data; fall back to any report
      const latest = await db.rateLimitReport.findFirst({
        where: {
          projectId,
          provider,
          NOT: { model: null },
        },
        orderBy: { timestamp: 'desc' },
      }) ?? await db.rateLimitReport.findFirst({
        where: { projectId, provider },
        orderBy: { timestamp: 'desc' },
      })
      if (!latest) return null

      const limits = latest.limits as Record<string, number | null>
      const requestsUsage = limits.requests_limit && limits.requests_remaining != null
        ? ((limits.requests_limit - limits.requests_remaining) / limits.requests_limit) * 100
        : null
      const tokensUsage = limits.tokens_limit && limits.tokens_remaining != null
        ? ((limits.tokens_limit - limits.tokens_remaining) / limits.tokens_limit) * 100
        : null

      return {
        provider,
        model: latest.model,
        timestamp: latest.timestamp,
        limits,
        requestsUsage,
        tokensUsage,
        overallUsage: requestsUsage != null || tokensUsage != null
          ? Math.max(requestsUsage ?? 0, tokensUsage ?? 0)
          : null,
      }
    })
  )

  // Get distinct apps
  const apps = await db.rateLimitReport.findMany({
    where: { projectId },
    distinct: ['app'],
    select: { app: true },
  })

  // Get recent alert count
  const recentAlerts = await db.alertEvent.count({
    where: {
      projectId,
      timestamp: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    },
  })

  // Get latest credit snapshot per provider
  const creditProviders = await db.usageCredit.findMany({
    where: { projectId },
    distinct: ['provider'],
    select: { provider: true },
  })
  const creditSummary = await Promise.all(
    creditProviders.map(async ({ provider }) => {
      const latest = await db.usageCredit.findFirst({
        where: { projectId, provider },
        orderBy: { timestamp: 'desc' },
      })
      if (!latest || latest.creditsRemaining == null) return null
      return {
        provider,
        creditsRemaining: latest.creditsRemaining,
        creditsLimit: latest.creditsLimit,
      }
    })
  )

  const connections = await db.providerConnection.findMany({
    where: { projectId },
    orderBy: { createdAt: 'asc' },
  })

  const connectedProviders = connections.map((connection) => ({
    provider: connection.provider,
    status: connection.status,
    balance: connection.balance,
    creditLimit: connection.creditLimit,
    periodSpend: connection.periodSpend,
    periodStart: connection.periodStart,
    lastPolledAt: connection.lastPolledAt,
    lastError: connection.lastError,
  }))

  const totalPeriodSpend = connections.reduce((sum, connection) => sum + (connection.periodSpend ?? 0), 0)

  // Spend timeline: periodSpend snapshots from connection poll history
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const spendSnapshots = await db.usageCredit.findMany({
    where: {
      projectId,
      timestamp: { gte: thirtyDaysAgo },
    },
    orderBy: { timestamp: 'asc' },
    select: { provider: true, creditsRemaining: true, creditsLimit: true, timestamp: true },
  })

  const spendTimeline: { time: number; value: number; provider: string }[] = []
  for (const snap of spendSnapshots) {
    if (snap.creditsLimit != null && snap.creditsRemaining != null) {
      spendTimeline.push({
        time: Math.floor(snap.timestamp.getTime() / 1000),
        value: snap.creditsLimit - snap.creditsRemaining,
        provider: snap.provider,
      })
    }
  }

  return NextResponse.json({
    providers: providerData.filter(Boolean),
    apps: apps.map((a) => a.app),
    recentAlerts,
    creditSummary: creditSummary.filter(Boolean),
    connectedProviders,
    totalPeriodSpend,
    spendTimeline,
    hasData: connections.length > 0,
  })
}
