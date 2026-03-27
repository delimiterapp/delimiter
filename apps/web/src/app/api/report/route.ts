import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const FREE_EVENT_LIMIT = 3000

export async function POST(request: NextRequest) {
  try {
    const auth = request.headers.get('authorization')
    if (!auth?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const projectKey = auth.slice(7)
    const project = await db.project.findUnique({
      where: { key: projectKey },
      include: { user: { select: { plan: true, id: true } } },
    })
    if (!project) {
      return NextResponse.json({ error: 'Invalid project key' }, { status: 401 })
    }

    // Check event limits for free users
    if (project.user.plan === 'free' || project.user.plan === 'none') {
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const userProjects = await db.project.findMany({
        where: { userId: project.user.id },
        select: { id: true },
      })
      const projectIds = userProjects.map((p) => p.id)
      const eventCount = await db.rateLimitReport.count({
        where: {
          projectId: { in: projectIds },
          createdAt: { gte: startOfMonth },
        },
      })
      if (eventCount >= FREE_EVENT_LIMIT) {
        return NextResponse.json(
          { error: 'Monthly event limit reached. Upgrade to Pro for higher limits.', limit: FREE_EVENT_LIMIT, used: eventCount },
          { status: 429 }
        )
      }
    }

    const body = await request.json()
    const { app, provider, model, timestamp, limits } = body

    if (!provider || !limits) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Store the report
    const report = await db.rateLimitReport.create({
      data: {
        projectId: project.id,
        app: app || 'default',
        provider,
        model: model || null,
        timestamp: timestamp ? new Date(timestamp) : new Date(),
        limits,
      },
    })

    // Check alert rules
    const rules = await db.alertRule.findMany({
      where: {
        projectId: project.id,
        enabled: true,
        OR: [{ provider: null }, { provider }],
      },
    })

    for (const rule of rules) {
      const l = limits as Record<string, number | null>
      // Check requests usage
      if (l.requests_limit && l.requests_remaining != null) {
        const used = l.requests_limit - l.requests_remaining
        const pct = (used / l.requests_limit) * 100
        if (pct >= rule.criticalAt) {
          await db.alertEvent.create({
            data: {
              projectId: project.id,
              provider,
              app: app || 'default',
              metric: 'requests',
              threshold: rule.criticalAt,
              current: used,
              limit: l.requests_limit,
              percentage: pct,
            },
          })
        } else if (pct >= rule.warnAt) {
          await db.alertEvent.create({
            data: {
              projectId: project.id,
              provider,
              app: app || 'default',
              metric: 'requests',
              threshold: rule.warnAt,
              current: used,
              limit: l.requests_limit,
              percentage: pct,
            },
          })
        }
      }

      // Check tokens usage
      if (l.tokens_limit && l.tokens_remaining != null) {
        const used = l.tokens_limit - l.tokens_remaining
        const pct = (used / l.tokens_limit) * 100
        if (pct >= rule.criticalAt) {
          await db.alertEvent.create({
            data: {
              projectId: project.id,
              provider,
              app: app || 'default',
              metric: 'tokens',
              threshold: rule.criticalAt,
              current: used,
              limit: l.tokens_limit,
              percentage: pct,
            },
          })
        } else if (pct >= rule.warnAt) {
          await db.alertEvent.create({
            data: {
              projectId: project.id,
              provider,
              app: app || 'default',
              metric: 'tokens',
              threshold: rule.warnAt,
              current: used,
              limit: l.tokens_limit,
              percentage: pct,
            },
          })
        }
      }
    }

    return NextResponse.json({ id: report.id })
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
