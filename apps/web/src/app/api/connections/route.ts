import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/session'
import { SUPPORTED_PROVIDERS } from '@/lib/billing'

/** GET /api/connections — list connected providers for a project */
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

  return NextResponse.json({
    connections,
    supportedProviders: SUPPORTED_PROVIDERS,
  })
}

/** POST /api/connections — register a new provider connection */
export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { projectId, provider, pipedreamAccountId } = await request.json()
  if (!projectId || !provider) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const project = await db.project.findFirst({ where: { id: projectId, userId: session.userId } })
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Validate provider
  if (!SUPPORTED_PROVIDERS.some((p) => p.id === provider)) {
    return NextResponse.json({ error: 'Unsupported provider' }, { status: 400 })
  }

  const connection = await db.providerConnection.upsert({
    where: { projectId_provider: { projectId, provider } },
    create: {
      projectId,
      provider,
      pipedreamAccountId: pipedreamAccountId || null,
      status: 'connected',
    },
    update: {
      pipedreamAccountId: pipedreamAccountId || null,
      status: 'connected',
      lastError: null,
    },
  })

  return NextResponse.json({ connection })
}

/** DELETE /api/connections — disconnect a provider */
export async function DELETE(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { projectId, provider } = await request.json()
  if (!projectId || !provider) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const project = await db.project.findFirst({ where: { id: projectId, userId: session.userId } })
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await db.providerConnection.deleteMany({
    where: { projectId, provider },
  })

  return NextResponse.json({ ok: true })
}
