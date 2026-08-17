import { NextResponse } from 'next/server'

export function requireAdmin(session: { user: { role: string } }) {
  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Apenas administradores podem realizar esta ação' }, { status: 403 })
  }
  return null
}
