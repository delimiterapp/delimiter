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

  const rules = await db.alertRule.findMany({
    where: { projectId },
    orderBy: { provider: 'asc' },
  })

  return NextResponse.json({ rules })
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { projectId, provider, warnAt, criticalAt, enabled } = await request.json()
  if (!projectId) return NextResponse.json({ error: 'Missing projectId' }, { status: 400 })

  const project = await db.project.findFirst({ where: { id: projectId, userId: session.userId } })
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const rule = await db.alertRule.upsert({
    where: { projectId_provider: { projectId, provider: provider || null } },
    create: {
      projectId,
      provider: provider || null,
      warnAt: warnAt ?? 70,
      criticalAt: criticalAt ?? 90,
      enabled: enabled ?? true,
    },
    update: {
      warnAt: warnAt ?? 70,
      criticalAt: criticalAt ?? 90,
      enabled: enabled ?? true,
    },
  })

  return NextResponse.json({ rule })
}
