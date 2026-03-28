import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function GET(request: NextRequest, { params }: { params: Promise<{ name: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name: provider } = await params
  const projectId = request.nextUrl.searchParams.get('projectId')
  if (!projectId) return NextResponse.json({ error: 'Missing projectId' }, { status: 400 })

  const project = await db.project.findFirst({ where: { id: projectId, userId: session.userId } })
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Latest report
  const latest = await db.rateLimitReport.findFirst({
    where: { projectId, provider },
    orderBy: { timestamp: 'desc' },
  })

  // Timeline: reports from last 24 hours, bucketed by 15-min intervals
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const reports = await db.rateLimitReport.findMany({
    where: { projectId, provider, timestamp: { gte: since } },
    orderBy: { timestamp: 'asc' },
    select: { timestamp: true, limits: true, model: true, app: true },
  })

  // Build timeline buckets (96 x 15-min intervals)
  const buckets: Array<{ time: string; requestsUsage: number | null; tokensUsage: number | null }> = []
  const bucketSize = 15 * 60 * 1000
  const start = since.getTime()

  for (let i = 0; i < 96; i++) {
    const bucketStart = start + i * bucketSize
    const bucketEnd = bucketStart + bucketSize
    const bucket = reports.filter(
      (r) => r.timestamp.getTime() >= bucketStart && r.timestamp.getTime() < bucketEnd
    )

    if (bucket.length > 0) {
      const last = bucket[bucket.length - 1]
      const l = last.limits as Record<string, number | null>
      buckets.push({
        time: new Date(bucketStart).toISOString(),
        requestsUsage: l.requests_limit && l.requests_remaining != null
          ? ((l.requests_limit - l.requests_remaining) / l.requests_limit) * 100
          : null,
        tokensUsage: l.tokens_limit && l.tokens_remaining != null
          ? ((l.tokens_limit - l.tokens_remaining) / l.tokens_limit) * 100
          : null,
      })
    } else {
      buckets.push({ time: new Date(bucketStart).toISOString(), requestsUsage: null, tokensUsage: null })
    }
  }

  // Model breakdown
  const models = await db.rateLimitReport.groupBy({
    by: ['model'],
    where: { projectId, provider, timestamp: { gte: since } },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
  })

  return NextResponse.json({
    provider,
    latest: latest ? { limits: latest.limits, model: latest.model, timestamp: latest.timestamp } : null,
    timeline: buckets,
    models: models
      .filter((m) => m.model != null)
      .map((m) => ({ model: m.model!, count: m._count.id })),
    totalReports: reports.length,
  })
}
