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

  const provider = request.nextUrl.searchParams.get('provider')
  const app = request.nextUrl.searchParams.get('app')
  const cursor = request.nextUrl.searchParams.get('cursor')
  const limit = 50

  const where: Record<string, unknown> = { projectId }
  if (provider) where.provider = provider
  if (app) where.app = app

  const reports = await db.rateLimitReport.findMany({
    where,
    orderBy: { timestamp: 'desc' },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    select: {
      id: true,
      app: true,
      provider: true,
      model: true,
      timestamp: true,
      limits: true,
    },
  })

  const hasMore = reports.length > limit
  const items = hasMore ? reports.slice(0, limit) : reports
  const nextCursor = hasMore ? items[items.length - 1].id : null

  return NextResponse.json({ items, nextCursor })
}
