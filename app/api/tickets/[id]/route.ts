import { auth } from '@/app/lib/auth'
import { prisma } from '@/app/lib/prisma'
import { COMMENT_INCLUDE } from '@/app/lib/comment-include'
import { createLog } from '@/app/lib/audit-log'
import { NextResponse } from 'next/server'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()

  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      createdBy: { select: { id: true, name: true, email: true } },
      subject: { select: { id: true, name: true } },
      employee: { select: { id: true, name: true } },
      comments: {
        orderBy: { createdAt: 'asc' },
        include: COMMENT_INCLUDE,
      },
      attachments: { select: { id: true, filename: true, size: true } },
    },
  })

  if (!ticket) {
    return NextResponse.json({ error: 'Chamado não encontrado' }, { status: 404 })
  }

  return NextResponse.json(ticket)
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

  const ticket = await prisma.ticket.findUnique({ where: { id } })
  if (!ticket) {
    return NextResponse.json({ error: 'Chamado não encontrado' }, { status: 404 })
  }

  await prisma.ticket.delete({ where: { id } })

  await createLog({
    session,
    action: 'DELETE',
    entityType: 'TICKET',
    entityId: ticket.id,
    entityLabel: `Chamado #${String(ticket.number).padStart(6, '0')} - ${ticket.title}`,
  })

  return NextResponse.json({ success: true })
}
