import { auth } from '@/app/lib/auth'
import { prisma } from '@/app/lib/prisma'
import { createLog } from '@/app/lib/audit-log'
import { NextResponse } from 'next/server'
import { isValidEmail, isAllowedEmailDomain, ALLOWED_EMAIL_DOMAIN } from '@/app/lib/validate-email'
import bcrypt from 'bcryptjs'

export async function GET() {
  const session = await auth()

  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

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

  const body = await req.json()
  const { name, email, password, role } = body

  if (!name?.trim() || !email?.trim() || !password || !role) {
    return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 })
  }

  if (!isValidEmail(email) || !isAllowedEmailDomain(email)) {
    return NextResponse.json(
      { error: `O email deve ser um endereço válido do domínio @${ALLOWED_EMAIL_DOMAIN}` },
      { status: 400 }
    )
  }

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
