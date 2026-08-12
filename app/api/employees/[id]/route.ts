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

  const body = await req.json()
  const { name, active, project, unit, department, position } = body

  if (name !== undefined && !name.trim()) {
    return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })
  }

  const employee = await prisma.employee.update({
    where: { id },
    data: {
      ...(name !== undefined ? { name: name.trim() } : {}),
      ...(active !== undefined ? { active } : {}),
      ...(project !== undefined ? { project: project || null } : {}),
      ...(unit !== undefined ? { unit: Array.isArray(unit) ? unit : [] } : {}),
      ...(department !== undefined ? { department: department || null } : {}),
      ...(position !== undefined ? { position: position || null } : {}),
    },
  })

  return NextResponse.json(employee)
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

  const employee = await prisma.employee.findUnique({ where: { id } })
  if (!employee) {
    return NextResponse.json({ error: 'Funcionário não encontrado' }, { status: 404 })
  }

  try {
    await prisma.employee.delete({ where: { id } })
  } catch {
    return NextResponse.json(
      { error: 'Não é possível excluir: este funcionário possui chamados vinculados. Inative o funcionário em vez de excluir.' },
      { status: 400 }
    )
  }

  return NextResponse.json({ success: true })
}
