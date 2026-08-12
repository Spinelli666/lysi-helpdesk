import { auth } from '@/app/lib/auth'
import { prisma } from '@/app/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await auth()

  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const subjects = await prisma.subject.findMany({
    where: { active: true },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json(subjects)
}

export async function POST(req: Request) {
  const session = await auth()

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const body = await req.json()
  const { name } = body

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })
  }

  const exists = await prisma.subject.findUnique({ where: { name } })
  if (exists) {
    return NextResponse.json({ error: 'Assunto já existe' }, { status: 400 })
  }

  const subject = await prisma.subject.create({ data: { name } })

  return NextResponse.json(subject, { status: 201 })
}
