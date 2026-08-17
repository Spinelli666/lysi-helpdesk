import { auth } from '@/app/lib/auth'
import { prisma } from '@/app/lib/prisma'
import { createLog } from '@/app/lib/audit-log'
import { parseBody } from '@/app/lib/parse-body'
import { createEmployeeSchema } from '@/app/lib/schemas'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await auth()

  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const employees = await prisma.employee.findMany({
    orderBy: { name: 'asc' },
  })

  return NextResponse.json(employees)
}

export async function POST(req: Request) {
  const session = await auth()

  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const parsed = await parseBody(req, createEmployeeSchema)
  if (parsed.error) return parsed.error
  const { name, project, unit, department, position } = parsed.data

  const employee = await prisma.employee.create({
    data: {
      name: name.trim(),
      project: project || null,
      unit: Array.isArray(unit) ? unit : [],
      department: department || null,
      position: position || null,
    },
  })

  await createLog({
    session,
    action: 'CREATE',
    entityType: 'EMPLOYEE',
    entityId: employee.id,
    entityLabel: `Funcionário ${employee.name}`,
  })

  return NextResponse.json(employee, { status: 201 })
}
