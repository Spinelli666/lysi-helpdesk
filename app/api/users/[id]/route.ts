import { auth } from '@/app/lib/auth'
import { prisma } from '@/app/lib/prisma'
import { createLog, diffFields } from '@/app/lib/audit-log'
import { parseBody } from '@/app/lib/parse-body'
import { updateUserSchema } from '@/app/lib/schemas'
import { requireAdmin } from '@/app/lib/require-admin'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()

  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const adminError = requireAdmin(session)
  if (adminError) return adminError

  const parsed = await parseBody(req, updateUserSchema)
  if (parsed.error) return parsed.error
  const { name, email, role, password } = parsed.data

  if (email) {
    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists && exists.id !== id) {
      return NextResponse.json({ error: 'Email já cadastrado' }, { status: 400 })
    }
  }

  const existing = await prisma.user.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
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

  const changes = diffFields(existing, { name, email, role }, ['name', 'email', 'role'])
  if (password) {
    changes.password = { before: '••••••', after: '••••••' }
  }

  if (Object.keys(changes).length > 0) {
    await createLog({
      session,
      action: 'UPDATE',
      entityType: 'USER',
      entityId: user.id,
      entityLabel: `Usuário ${user.name} (${user.email})`,
      changes,
    })
  }

  return NextResponse.json(user)
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

  const adminError = requireAdmin(session)
  if (adminError) return adminError

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

  await createLog({
    session,
    action: 'DELETE',
    entityType: 'USER',
    entityId: user.id,
    entityLabel: `Usuário ${user.name} (${user.email})`,
  })

  return NextResponse.json({ success: true })
}
