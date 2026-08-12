import { auth } from '@/app/lib/auth'
import { prisma } from '@/app/lib/prisma'
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

  const employee = await prisma.employee.findUnique({ where: { id } })
  if (!employee) {
    return NextResponse.json({ error: 'Funcionário não encontrado' }, { status: 404 })
  }

  const updated = await prisma.employee.update({
    where: { id },
    data: { active: !employee.active },
    select: { id: true, active: true },
  })

  return NextResponse.json(updated)
}
