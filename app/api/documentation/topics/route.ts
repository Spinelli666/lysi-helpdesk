import { auth } from '@/app/lib/auth'
import { prisma } from '@/app/lib/prisma'
import { createLog } from '@/app/lib/audit-log'
import { parseBody } from '@/app/lib/parse-body'
import { createDocumentationTopicSchema } from '@/app/lib/schemas'
import { requireAdmin } from '@/app/lib/require-admin'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await auth()

  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const topics = await prisma.documentationTopic.findMany({
    orderBy: { order: 'asc' },
    include: { subtopics: { orderBy: { order: 'asc' } } },
  })

  return NextResponse.json(topics)
}

export async function POST(req: Request) {
  const session = await auth()

  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const adminError = requireAdmin(session)
  if (adminError) return adminError

  const parsed = await parseBody(req, createDocumentationTopicSchema)
  if (parsed.error) return parsed.error

  const count = await prisma.documentationTopic.count()

  const topic = await prisma.documentationTopic.create({
    data: {
      title: parsed.data.title,
      order: count,
      updatedById: session.user.id,
      updatedByName: session.user.name,
    },
  })

  await createLog({
    session,
    action: 'CREATE',
    entityType: 'DOCUMENTATION',
    entityId: topic.id,
    entityLabel: topic.title,
  })

  return NextResponse.json({ ...topic, subtopics: [] })
}
