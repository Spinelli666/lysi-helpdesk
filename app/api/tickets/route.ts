import { auth } from '@/app/lib/auth'
import { prisma } from '@/app/lib/prisma'
import { createLog } from '@/app/lib/audit-log'
import { parseBody } from '@/app/lib/parse-body'
import { createTicketSchema } from '@/app/lib/schemas'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await auth()

  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const tickets = await prisma.ticket.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      createdBy: { select: { id: true, name: true } },
      subject: { select: { id: true, name: true } },
      employee: { select: { id: true, name: true } },
    },
  })

  return NextResponse.json(tickets)
}

export async function POST(req: Request) {
  const session = await auth()

  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const parsed = await parseBody(req, createTicketSchema)
  if (parsed.error) return parsed.error
  const { title, description, subjectId, employeeId } = parsed.data

  const subject = await prisma.subject.findUnique({ where: { id: subjectId } })

  if (!subject || !subject.active) {
    return NextResponse.json({ error: 'Selecione um assunto válido.' }, { status: 400 })
  }

  const employee = await prisma.employee.findUnique({ where: { id: employeeId } })

  if (!employee || !employee.active) {
    return NextResponse.json({ error: 'Selecione um funcionário válido.' }, { status: 400 })
  }

  const ticket = await prisma.ticket.create({
    data: {
      title,
      description,
      subjectId,
      employeeId,
      createdById: session.user.id,
    },
    include: {
      createdBy: { select: { id: true, name: true } },
      subject: { select: { id: true, name: true } },
      employee: { select: { id: true, name: true } },
    },
  })

  await createLog({
    session,
    action: 'CREATE',
    entityType: 'TICKET',
    entityId: ticket.id,
    entityLabel: `Chamado #${String(ticket.number).padStart(6, '0')} - ${ticket.title}`,
  })

  return NextResponse.json(ticket, { status: 201 })
}
