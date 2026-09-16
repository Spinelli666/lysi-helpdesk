import { auth } from '@/app/lib/auth'
import { prisma } from '@/app/lib/prisma'
import { createLog } from '@/app/lib/audit-log'
import { parseBody } from '@/app/lib/parse-body'
import { updateDocumentationSubtopicSchema } from '@/app/lib/schemas'
import { requireAdmin } from '@/app/lib/require-admin'
import { sanitizeCommentHtml } from '@/app/lib/sanitize-comment'
import { NextResponse } from 'next/server'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()

  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const adminError = requireAdmin(session)
  if (adminError) return adminError

  const parsed = await parseBody(req, updateDocumentationSubtopicSchema)
  if (parsed.error) return parsed.error

  const existing = await prisma.documentationSubtopic.findUnique({ where: { id }, include: { topic: true } })
  if (!existing) {
    return NextResponse.json({ error: 'Subtópico não encontrado' }, { status: 404 })
  }

  const subtopic = await prisma.documentationSubtopic.update({
    where: { id },
    data: {
      title: parsed.data.title,
      content: parsed.data.content !== undefined ? sanitizeCommentHtml(parsed.data.content) : undefined,
      order: parsed.data.order,
      updatedById: session.user.id,
      updatedByName: session.user.name,
    },
  })

  await createLog({
    session,
    action: 'UPDATE',
    entityType: 'DOCUMENTATION',
    entityId: subtopic.id,
    entityLabel: `${existing.topic.title} > ${subtopic.title}`,
  })

  return NextResponse.json(subtopic)
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()

  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const adminError = requireAdmin(session)
  if (adminError) return adminError

  const existing = await prisma.documentationSubtopic.findUnique({ where: { id }, include: { topic: true } })
  if (!existing) {
    return NextResponse.json({ error: 'Subtópico não encontrado' }, { status: 404 })
  }

  await prisma.documentationSubtopic.delete({ where: { id } })

  await createLog({
    session,
    action: 'DELETE',
    entityType: 'DOCUMENTATION',
    entityId: existing.id,
    entityLabel: `${existing.topic.title} > ${existing.title}`,
  })

  return NextResponse.json({ ok: true })
}
