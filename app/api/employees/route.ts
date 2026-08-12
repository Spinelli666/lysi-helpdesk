import { auth } from '@/app/lib/auth'
import { prisma } from '@/app/lib/prisma'
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

  const body = await req.json()
  const { name, project, unit, department, position } = body

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })
  }

  const employee = await prisma.employee.create({
    data: {
      name: name.trim(),
      project: project || null,
      unit: Array.isArray(unit) ? unit : [],
      department: department || null,
      position: position || null,
    },
  })

  return NextResponse.json(employee, { status: 201 })
}
