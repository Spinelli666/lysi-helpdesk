import { auth } from '@/app/lib/auth'
import { prisma } from '@/app/lib/prisma'
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
    },
  })

  return NextResponse.json(tickets)
}

export async function POST(req: Request) {
  const session = await auth()

  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const body = await req.json()
  const { title, description, subjectId } = body

  if (!title?.trim() || !description?.trim() || !subjectId) {
    return NextResponse.json({ error: 'Preencha todos os campos.' }, { status: 400 })
  }

  const subject = await prisma.subject.findUnique({ where: { id: subjectId } })

  if (!subject || !subject.active) {
    return NextResponse.json({ error: 'Selecione um assunto válido.' }, { status: 400 })
  }

  const ticket = await prisma.ticket.create({
    data: {
      title,
      description,
      subjectId,
      createdById: session.user.id,
    },
    include: {
      createdBy: { select: { id: true, name: true } },
      subject: { select: { id: true, name: true } },
    },
  })

  return NextResponse.json(ticket, { status: 201 })
}
