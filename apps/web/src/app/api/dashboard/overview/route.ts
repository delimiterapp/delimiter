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

  // Batch: fetch latest report per provider using a single query with ordering,
  // then deduplicate in JS (Prisma doesn't support DISTINCT ON with ordering well)
  const [allReports, allCredits, apps, recentAlerts] = await Promise.all([
    // Get recent reports per provider (fetch enough to cover all providers)
    db.rateLimitReport.findMany({
      where: { projectId },
      orderBy: { timestamp: 'desc' },
      take: 200,
    }),
    // Get recent credits per provider
    db.usageCredit.findMany({
      where: { projectId },
      orderBy: { timestamp: 'desc' },
      take: 200,
    }),
    // Get distinct apps
    db.rateLimitReport.findMany({
      where: { projectId },
      distinct: ['app'],
      select: { app: true },
    }),
    // Get recent alert count
    db.alertEvent.count({
      where: {
        projectId,
        timestamp: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    }),
  ])

  // Deduplicate: pick latest report per provider (preferring ones with a model)
  const latestByProvider = new Map<string, typeof allReports[number]>()
  for (const report of allReports) {
    const existing = latestByProvider.get(report.provider)
    if (!existing) {
      latestByProvider.set(report.provider, report)
    } else if (!existing.model && report.model) {
      // Prefer report with a model
      latestByProvider.set(report.provider, report)
    }
  }

  const providerData = Array.from(latestByProvider.values()).map((latest) => {
    const limits = latest.limits as Record<string, number | null>
    const requestsUsage = limits.requests_limit && limits.requests_remaining != null
      ? ((limits.requests_limit - limits.requests_remaining) / limits.requests_limit) * 100
      : null
    const tokensUsage = limits.tokens_limit && limits.tokens_remaining != null
      ? ((limits.tokens_limit - limits.tokens_remaining) / limits.tokens_limit) * 100
      : null

    return {
      provider: latest.provider,
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

  // Deduplicate: latest credit per provider
  const latestCreditByProvider = new Map<string, typeof allCredits[number]>()
  for (const credit of allCredits) {
    if (!latestCreditByProvider.has(credit.provider)) {
      latestCreditByProvider.set(credit.provider, credit)
    }
  }

  const creditSummary = Array.from(latestCreditByProvider.values())
    .filter((c) => c.creditsRemaining != null)
    .map((latest) => ({
      provider: latest.provider,
      creditsRemaining: latest.creditsRemaining,
      creditsLimit: latest.creditsLimit,
    }))

  return NextResponse.json({
    providers: providerData,
    apps: apps.map((a) => a.app),
    recentAlerts,
    creditSummary,
    hasData: latestByProvider.size > 0,
  })
}
