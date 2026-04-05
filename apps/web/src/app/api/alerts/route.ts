import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/session'
import { z } from 'zod'

const AlertRuleSchema = z.object({
  projectId: z.string().min(1),
  provider: z.string().optional(),
  warnAt: z.number().int().min(1).max(99).optional(),
  criticalAt: z.number().int().min(1).max(99).optional(),
  enabled: z.boolean().optional(),
}).refine(
  (data) => {
    const warn = data.warnAt ?? 70
    const critical = data.criticalAt ?? 90
    return warn < critical
  },
  { message: 'warnAt must be less than criticalAt' }
)

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

  const rawBody = await request.json()
  const parsed = AlertRuleSchema.safeParse(rawBody)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid alert rule', details: parsed.error.issues },
      { status: 400 }
    )
  }

  const { projectId, provider, warnAt, criticalAt, enabled } = parsed.data
  const providerValue = provider ?? null

  const project = await db.project.findFirst({ where: { id: projectId, userId: session.userId } })
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const rule = await db.alertRule.upsert({
    where: { projectId_provider: { projectId, provider: providerValue as string } },
    create: {
      projectId,
      provider: providerValue,
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
