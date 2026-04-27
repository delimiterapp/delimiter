import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/session'
import { SUPPORTED_PROVIDERS } from '@/lib/billing'

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const projectId = request.nextUrl.searchParams.get('projectId')
  if (!projectId) return NextResponse.json({ error: 'Missing projectId' }, { status: 400 })

  const project = await db.project.findFirst({ where: { id: projectId, userId: session.userId } })
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const connections = await db.providerConnection.findMany({
    where: { projectId },
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json({ connections, supportedProviders: SUPPORTED_PROVIDERS })
}

export async function DELETE(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { projectId, provider } = await request.json()
  if (!projectId || !provider) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const project = await db.project.findFirst({ where: { id: projectId, userId: session.userId } })
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await db.providerKey.deleteMany({ where: { projectId, provider } })
  await db.providerConnection.deleteMany({ where: { projectId, provider } })

  return NextResponse.json({ ok: true })
}
