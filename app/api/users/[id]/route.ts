import { auth } from '@/app/lib/auth'
import { prisma } from '@/app/lib/prisma'
import { NextResponse } from 'next/server'
import { isValidEmail } from '@/app/lib/validate-email'
import bcrypt from 'bcryptjs'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const body = await req.json()
  const { name, email, role, password } = body

  if (email && !isValidEmail(email)) {
    return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
  }

  if (email) {
    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists && exists.id !== id) {
      return NextResponse.json({ error: 'Email já cadastrado' }, { status: 400 })
    }
  }

  const user = await prisma.user.update({
    where: { id },
    data: {
      name,
      email,
      role,
      ...(password ? { password: await bcrypt.hash(password, 10) } : {}),
    },
    select: { id: true, name: true, email: true, role: true, active: true },
  })

  return NextResponse.json(user)
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  if (session.user.id === id) {
    return NextResponse.json({ error: 'Você não pode excluir sua própria conta.' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) {
    return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
  }

  try {
    await prisma.user.delete({ where: { id } })
  } catch {
    return NextResponse.json(
      { error: 'Não é possível excluir: este usuário possui chamados ou anotações vinculadas. Inative o usuário em vez de excluir.' },
      { status: 400 }
    )
  }

  return NextResponse.json({ success: true })
}
