import { auth } from '@/app/lib/auth'
import { prisma } from '@/app/lib/prisma'
import { createLog, diffFields } from '@/app/lib/audit-log'
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

  const body = await req.json()
  const { name, active } = body

  const existing = await prisma.subject.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: 'Assunto não encontrado' }, { status: 404 })
  }

  const subject = await prisma.subject.update({
    where: { id },
    data: { name, active },
  })

  const changes = diffFields(existing, { name, active }, ['name', 'active'])

  if (Object.keys(changes).length > 0) {
    await createLog({
      session,
      action: Object.keys(changes).length === 1 && 'active' in changes ? 'TOGGLE' : 'UPDATE',
      entityType: 'SUBJECT',
      entityId: subject.id,
      entityLabel: `Assunto ${subject.name}`,
      changes,
    })
  }

  return NextResponse.json(subject)
}
