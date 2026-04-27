import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/session'
import { encrypt } from '@/lib/crypto'
import { pollBillingData, SUPPORTED_PROVIDERS } from '@/lib/billing'

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const projectId = request.nextUrl.searchParams.get('projectId')
  if (!projectId) return NextResponse.json({ error: 'Missing projectId' }, { status: 400 })

  const project = await db.project.findFirst({ where: { id: projectId, userId: session.userId } })
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const keys = await db.providerKey.findMany({
    where: { projectId },
    select: { id: true, provider: true, label: true, status: true, lastValidatedAt: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  })

  const connections = await db.providerConnection.findMany({
    where: { projectId },
  })

  return NextResponse.json({ keys, connections, supportedProviders: SUPPORTED_PROVIDERS })
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { projectId, provider, apiKey, label } = await request.json()
  if (!projectId || !provider || !apiKey) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const project = await db.project.findFirst({ where: { id: projectId, userId: session.userId } })
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (!SUPPORTED_PROVIDERS.some((p) => p.id === provider)) {
    return NextResponse.json({ error: 'Unsupported provider' }, { status: 400 })
  }

  const encryptedKey = encrypt(apiKey)

  const providerKey = await db.providerKey.upsert({
    where: { projectId_provider: { projectId, provider } },
    create: { projectId, provider, encryptedKey, label: label || null, status: 'pending' },
    update: { encryptedKey, label: label || null, status: 'pending', lastValidatedAt: null },
  })

  try {
    const snapshot = await pollBillingData(provider, apiKey)

    await db.providerKey.update({
      where: { id: providerKey.id },
      data: { status: 'valid', lastValidatedAt: new Date() },
    })

    await db.providerConnection.upsert({
      where: { projectId_provider: { projectId, provider } },
      create: {
        projectId,
        provider,
        status: 'connected',
        balance: snapshot.balance,
        creditLimit: snapshot.creditLimit,
        periodSpend: snapshot.periodSpend,
        periodStart: snapshot.periodStart,
        lastPolledAt: new Date(),
      },
      update: {
        status: 'connected',
        balance: snapshot.balance,
        creditLimit: snapshot.creditLimit,
        periodSpend: snapshot.periodSpend,
        periodStart: snapshot.periodStart,
        lastPolledAt: new Date(),
        lastError: null,
      },
    })

    if (snapshot.balance != null || snapshot.periodSpend != null) {
      await db.usageCredit.create({
        data: {
          projectId,
          provider,
          app: 'billing-api',
          creditsLimit: snapshot.creditLimit,
          creditsRemaining: snapshot.balance,
        },
      })
    }

    return NextResponse.json({
      providerKey: { id: providerKey.id, provider, status: 'valid' },
      snapshot,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Validation failed'

    await db.providerKey.update({
      where: { id: providerKey.id },
      data: { status: 'invalid' },
    })

    return NextResponse.json({
      providerKey: { id: providerKey.id, provider, status: 'invalid' },
      error: message,
    }, { status: 422 })
  }
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
