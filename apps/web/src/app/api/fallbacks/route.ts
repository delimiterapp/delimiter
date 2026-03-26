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

  const chain = await db.fallbackChain.findUnique({ where: { projectId } })

  return NextResponse.json({ chain: chain || { chain: [], threshold: 80, enabled: false } })
}

export async function PUT(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { projectId, chain, threshold, enabled } = await request.json()
  if (!projectId) return NextResponse.json({ error: 'Missing projectId' }, { status: 400 })

  const project = await db.project.findFirst({ where: { id: projectId, userId: session.userId } })
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const result = await db.fallbackChain.upsert({
    where: { projectId },
    create: {
      projectId,
      chain: chain || [],
      threshold: threshold ?? 80,
      enabled: enabled ?? false,
    },
    update: {
      chain: chain || [],
      threshold: threshold ?? 80,
      enabled: enabled ?? false,
    },
  })

  return NextResponse.json({ chain: result })
}
