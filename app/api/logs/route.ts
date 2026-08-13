import { auth } from '@/app/lib/auth'
import { prisma } from '@/app/lib/prisma'
import { LogAction, LogEntity } from '@prisma/client'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const session = await auth()

  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const entityType = searchParams.get('entityType')
  const action = searchParams.get('action')

  const validEntityType = entityType && entityType in LogEntity ? (entityType as LogEntity) : undefined
  const validAction = action && action in LogAction ? (action as LogAction) : undefined

  const logs = await prisma.log.findMany({
    where: {
      ...(validEntityType ? { entityType: validEntityType } : {}),
      ...(validAction ? { action: validAction } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: 300,
  })

  return NextResponse.json(logs)
}
