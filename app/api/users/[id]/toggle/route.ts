import { auth } from '@/app/lib/auth'
import { prisma } from '@/app/lib/prisma'
import { createLog } from '@/app/lib/audit-log'
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

  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) {
    return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { active: !user.active },
    select: { id: true, active: true },
  })

  await createLog({
    session,
    action: 'TOGGLE',
    entityType: 'USER',
    entityId: user.id,
    entityLabel: `Usuário ${user.name} (${user.email})`,
    changes: { active: { before: user.active, after: updated.active } },
  })

  return NextResponse.json(updated)
}
