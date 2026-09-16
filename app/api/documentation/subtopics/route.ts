import { auth } from '@/app/lib/auth'
import { prisma } from '@/app/lib/prisma'
import { createLog } from '@/app/lib/audit-log'
import { parseBody } from '@/app/lib/parse-body'
import { createDocumentationSubtopicSchema } from '@/app/lib/schemas'
import { requireAdmin } from '@/app/lib/require-admin'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const session = await auth()

  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const adminError = requireAdmin(session)
  if (adminError) return adminError

  const parsed = await parseBody(req, createDocumentationSubtopicSchema)
  if (parsed.error) return parsed.error

  const topic = await prisma.documentationTopic.findUnique({ where: { id: parsed.data.topicId } })
  if (!topic) {
    return NextResponse.json({ error: 'Tópico não encontrado' }, { status: 404 })
  }

  const count = await prisma.documentationSubtopic.count({ where: { topicId: topic.id } })

  const subtopic = await prisma.documentationSubtopic.create({
    data: {
      title: parsed.data.title,
      topicId: topic.id,
      order: count,
      updatedById: session.user.id,
      updatedByName: session.user.name,
    },
  })

  await createLog({
    session,
    action: 'CREATE',
    entityType: 'DOCUMENTATION',
    entityId: subtopic.id,
    entityLabel: `${topic.title} > ${subtopic.title}`,
  })

  return NextResponse.json(subtopic)
}
