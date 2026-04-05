import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import type { Prisma } from '@prisma/client'

const FREE_EVENT_LIMIT = 3000

// Cooldown period: don't fire the same alert more than once per 5 minutes
const ALERT_COOLDOWN_MS = 5 * 60 * 1000

const ReportSchema = z.object({
  app: z.string().optional(),
  provider: z.string().min(1),
  model: z.string().optional(),
  timestamp: z.string().datetime().optional(),
  limits: z.object({}).passthrough(),
  credits: z.object({
    credits_limit: z.number().nullable().optional(),
    credits_remaining: z.number().nullable().optional(),
    request_cost: z.number().nullable().optional(),
  }).optional(),
})

// In-memory per-IP sliding window rate limiter
const ipRequestCounts = new Map<string, { count: number; resetAt: number }>()
const IP_RATE_LIMIT = 120    // requests per window
const IP_RATE_WINDOW = 60000 // 1 minute

function isIpRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = ipRequestCounts.get(ip)
  if (!entry || now >= entry.resetAt) {
    ipRequestCounts.set(ip, { count: 1, resetAt: now + IP_RATE_WINDOW })
    return false
  }
  entry.count++
  return entry.count > IP_RATE_LIMIT
}

// Periodically clean up stale IP entries to prevent memory growth
setInterval(() => {
  const now = Date.now()
  for (const [ip, entry] of ipRequestCounts) {
    if (now >= entry.resetAt) ipRequestCounts.delete(ip)
  }
}, IP_RATE_WINDOW)

async function checkAndFireAlert(
  projectId: string,
  provider: string,
  app: string,
  metric: string,
  threshold: number,
  current: number,
  limit: number,
  pct: number,
) {
  // Deduplicate: skip if an alert for same project+provider+metric+threshold was fired recently
  const cooldownCutoff = new Date(Date.now() - ALERT_COOLDOWN_MS)
  const existing = await db.alertEvent.findFirst({
    where: {
      projectId,
      provider,
      metric,
      threshold,
      timestamp: { gte: cooldownCutoff },
    },
    select: { id: true },
  })
  if (existing) return

  await db.alertEvent.create({
    data: { projectId, provider, app, metric, threshold, current, limit, percentage: pct },
  })
}

export async function POST(request: NextRequest) {
  try {
    // IP-level rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    if (isIpRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please slow down.' },
        { status: 429 }
      )
    }

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

    const rawBody = await request.json()
    const parsed = ReportSchema.safeParse(rawBody)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parsed.error.issues },
        { status: 400 }
      )
    }

    const { app, provider, model, timestamp, limits, credits } = parsed.data

    // Store the report
    const report = await db.rateLimitReport.create({
      data: {
        projectId: project.id,
        app: app || 'default',
        provider,
        model: model || null,
        timestamp: timestamp ? new Date(timestamp) : new Date(),
        limits: limits as Prisma.InputJsonValue,
      },
    })

    // Store credit/balance snapshot if present
    if (credits && (credits.credits_limit != null || credits.credits_remaining != null || credits.request_cost != null)) {
      await db.usageCredit.create({
        data: {
          projectId: project.id,
          provider,
          app: app || 'default',
          model: model || null,
          creditsLimit: credits.credits_limit ?? null,
          creditsRemaining: credits.credits_remaining ?? null,
          requestCost: credits.request_cost ?? null,
          timestamp: timestamp ? new Date(timestamp) : new Date(),
        },
      })
    }

    // Check alert rules
    const rules = await db.alertRule.findMany({
      where: {
        projectId: project.id,
        enabled: true,
        OR: [{ provider: null }, { provider }],
      },
    })

    const appName = app || 'default'

    for (const rule of rules) {
      const l = limits as Record<string, number | null>

      // Check requests usage
      if (l.requests_limit && l.requests_remaining != null) {
        const used = (l.requests_limit as number) - (l.requests_remaining as number)
        const pct = (used / (l.requests_limit as number)) * 100
        if (pct >= rule.criticalAt) {
          await checkAndFireAlert(project.id, provider, appName, 'requests', rule.criticalAt, used, l.requests_limit as number, pct)
        } else if (pct >= rule.warnAt) {
          await checkAndFireAlert(project.id, provider, appName, 'requests', rule.warnAt, used, l.requests_limit as number, pct)
        }
      }

      // Check tokens usage
      if (l.tokens_limit && l.tokens_remaining != null) {
        const used = (l.tokens_limit as number) - (l.tokens_remaining as number)
        const pct = (used / (l.tokens_limit as number)) * 100
        if (pct >= rule.criticalAt) {
          await checkAndFireAlert(project.id, provider, appName, 'tokens', rule.criticalAt, used, l.tokens_limit as number, pct)
        } else if (pct >= rule.warnAt) {
          await checkAndFireAlert(project.id, provider, appName, 'tokens', rule.warnAt, used, l.tokens_limit as number, pct)
        }
      }

      // Check credit balance — low balance is a blackout risk
      if (credits && credits.credits_limit && credits.credits_remaining != null) {
        const spent = credits.credits_limit - credits.credits_remaining
        const pct = (spent / credits.credits_limit) * 100
        if (pct >= rule.criticalAt) {
          await checkAndFireAlert(project.id, provider, appName, 'credits', rule.criticalAt, spent, credits.credits_limit, pct)
        } else if (pct >= rule.warnAt) {
          await checkAndFireAlert(project.id, provider, appName, 'credits', rule.warnAt, spent, credits.credits_limit, pct)
        }
      }
    }

    return NextResponse.json({ id: report.id })
  } catch (err) {
    console.error('Report ingestion error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
