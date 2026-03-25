import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/session'
import { generateProjectKey } from '@/lib/project-key'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const project = await db.project.findFirst({ where: { id, userId: session.userId } })
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await request.json()
  const updates: Record<string, unknown> = {}

  if (body.name && typeof body.name === 'string') updates.name = body.name.trim()
  if (body.rotateKey === true) updates.key = generateProjectKey()

  const updated = await db.project.update({ where: { id }, data: updates })
  return NextResponse.json({ project: updated })
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const project = await db.project.findFirst({ where: { id, userId: session.userId } })
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await db.project.delete({ where: { id } })
  return NextResponse.json({ deleted: true })
}
