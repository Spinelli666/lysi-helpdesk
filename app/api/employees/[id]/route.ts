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
  const { name, active, project, unit, department, position } = body

  if (name !== undefined && !name.trim()) {
    return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })
  }

  const existing = await prisma.employee.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: 'Funcionário não encontrado' }, { status: 404 })
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

  const changes = diffFields(existing, {
    name: name !== undefined ? name.trim() : undefined,
    active,
    project: project !== undefined ? project || null : undefined,
    unit: unit !== undefined ? (Array.isArray(unit) ? unit : []) : undefined,
    department: department !== undefined ? department || null : undefined,
    position: position !== undefined ? position || null : undefined,
  }, ['name', 'active', 'project', 'unit', 'department', 'position'])

  if (Object.keys(changes).length > 0) {
    await createLog({
      session,
      action: Object.keys(changes).length === 1 && 'active' in changes ? 'TOGGLE' : 'UPDATE',
      entityType: 'EMPLOYEE',
      entityId: employee.id,
      entityLabel: `Funcionário ${employee.name}`,
      changes,
    })
  }

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

  await createLog({
    session,
    action: 'DELETE',
    entityType: 'EMPLOYEE',
    entityId: employee.id,
    entityLabel: `Funcionário ${employee.name}`,
  })

  return NextResponse.json({ success: true })
}
