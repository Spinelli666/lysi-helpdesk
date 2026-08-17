import { auth } from '@/app/lib/auth'
import { prisma } from '@/app/lib/prisma'
import { createLog } from '@/app/lib/audit-log'
import { parseBody } from '@/app/lib/parse-body'
import { createSubjectSchema } from '@/app/lib/schemas'
import { requireAdmin } from '@/app/lib/require-admin'
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

  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const adminError = requireAdmin(session)
  if (adminError) return adminError

  const parsed = await parseBody(req, createSubjectSchema)
  if (parsed.error) return parsed.error
  const { name } = parsed.data

  const exists = await prisma.subject.findUnique({ where: { name } })
  if (exists) {
    return NextResponse.json({ error: 'Assunto já existe' }, { status: 400 })
  }

  const subject = await prisma.subject.create({ data: { name } })

  await createLog({
    session,
    action: 'CREATE',
    entityType: 'SUBJECT',
    entityId: subject.id,
    entityLabel: `Assunto ${subject.name}`,
  })

  return NextResponse.json(subject, { status: 201 })
}
