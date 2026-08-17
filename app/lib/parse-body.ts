import { NextResponse } from 'next/server'
import type { ZodType } from 'zod'

type ParsedBody<T> = { data: T; error?: undefined } | { data?: undefined; error: NextResponse }

export async function parseBody<T>(req: Request, schema: ZodType<T>): Promise<ParsedBody<T>> {
  let json: unknown

  try {
    json = await req.json()
  } catch {
    return { error: NextResponse.json({ error: 'JSON inválido' }, { status: 400 }) }
  }

  const result = schema.safeParse(json)

  if (!result.success) {
    const firstIssue = result.error.issues[0]
    return {
      error: NextResponse.json(
        { error: firstIssue?.message || 'Dados inválidos', issues: result.error.flatten() },
        { status: 400 }
      ),
    }
  }

  return { data: result.data }
}
