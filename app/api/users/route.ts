import { auth } from '@/app/lib/auth'
import { prisma } from '@/app/lib/prisma'
import { createLog } from '@/app/lib/audit-log'
import { parseBody } from '@/app/lib/parse-body'
import { createUserSchema } from '@/app/lib/schemas'
import { requireAdmin } from '@/app/lib/require-admin'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function GET() {
  const session = await auth()

  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const adminError = requireAdmin(session)
  if (adminError) return adminError

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      active: true,
      createdAt: true,
    },
  })

  return NextResponse.json(users)
}

export async function POST(req: Request) {
  const session = await auth()

  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const adminError = requireAdmin(session)
  if (adminError) return adminError

  const parsed = await parseBody(req, createUserSchema)
  if (parsed.error) return parsed.error
  const { name, email, password, role } = parsed.data

  const exists = await prisma.user.findUnique({ where: { email } })
  if (exists) {
    return NextResponse.json({ error: 'Email já cadastrado' }, { status: 400 })
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword, role },
    select: { id: true, name: true, email: true, role: true, active: true },
  })

  await createLog({
    session,
    action: 'CREATE',
    entityType: 'USER',
    entityId: user.id,
    entityLabel: `Usuário ${user.name} (${user.email})`,
  })

  return NextResponse.json(user, { status: 201 })
}
