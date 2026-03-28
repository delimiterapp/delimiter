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

  return NextResponse.json({
    providers: providerData.filter(Boolean),
    apps: apps.map((a) => a.app),
    recentAlerts,
    hasData: providers.length > 0,
  })
}
