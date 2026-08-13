import { prisma } from '@/app/lib/prisma'
import type { Prisma } from '@prisma/client'

type ActorSession = {
  user: {
    id: string
    name?: string | null
    email?: string | null
  }
}

type EntityType = 'TICKET' | 'EMPLOYEE' | 'USER' | 'SUBJECT'
type ActionType = 'CREATE' | 'UPDATE' | 'DELETE' | 'TOGGLE'
type FieldChanges = Record<string, { before: unknown; after: unknown }>

export async function createLog({
  session,
  action,
  entityType,
  entityId,
  entityLabel,
  changes,
}: {
  session: ActorSession
  action: ActionType
  entityType: EntityType
  entityId: string
  entityLabel: string
  changes?: FieldChanges
}) {
  await prisma.log.create({
    data: {
      action,
      entityType,
      entityId,
      entityLabel,
      changes: changes && Object.keys(changes).length > 0 ? (changes as Prisma.InputJsonValue) : undefined,
      actorId: session.user.id,
      actorName: session.user.name || session.user.email || 'Desconhecido',
    },
  })
}

export function diffFields<T extends Record<string, unknown>>(
  before: T,
  after: Record<string, unknown>,
  fields: string[]
): FieldChanges {
  const changes: FieldChanges = {}
  for (const field of fields) {
    if (after[field] === undefined) continue
    const beforeValue = before[field]
    const afterValue = after[field]
    if (JSON.stringify(beforeValue) !== JSON.stringify(afterValue)) {
      changes[field] = { before: beforeValue, after: afterValue }
    }
  }
  return changes
}
