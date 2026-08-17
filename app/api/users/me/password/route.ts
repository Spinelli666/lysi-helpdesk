import { auth } from '@/app/lib/auth'
import { prisma } from '@/app/lib/prisma'
import { parseBody } from '@/app/lib/parse-body'
import { changeSelfPasswordSchema } from '@/app/lib/schemas'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function PATCH(req: Request) {
  const session = await auth()

  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const parsed = await parseBody(req, changeSelfPasswordSchema)
  if (parsed.error) return parsed.error
  const { newPassword } = parsed.data

  const hashedPassword = await bcrypt.hash(newPassword, 10)

  await prisma.user.update({
    where: { id: session.user.id },
    data: { password: hashedPassword },
  })

  return NextResponse.json({ success: true })
}
