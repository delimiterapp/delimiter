import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/session'
import { generateProjectKey } from '@/lib/project-key'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const projects = await db.project.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json({ projects })
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name } = await request.json()
  if (!name || typeof name !== 'string') {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }

  const project = await db.project.create({
    data: {
      userId: session.userId,
      name: name.trim(),
      key: generateProjectKey(),
    },
  })

  // Create default alert rule
  await db.alertRule.create({
    data: { projectId: project.id, provider: null, warnAt: 70, criticalAt: 90 },
  })

  return NextResponse.json({ project }, { status: 201 })
}
