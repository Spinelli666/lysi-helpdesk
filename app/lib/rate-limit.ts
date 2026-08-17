// Armazenamento em memória — seguro porque o app roda como um único processo Node
// (sem múltiplas réplicas/serverless). Se isso mudar, trocar por um store compartilhado (ex.: Redis).

const MAX_ATTEMPTS = 5
const WINDOW_MS = 15 * 60 * 1000
const LOCK_MS = 15 * 60 * 1000

type Entry = {
  count: number
  firstAttemptAt: number
  lockedUntil: number | null
}

const attempts = new Map<string, Entry>()

function normalize(email: string) {
  return email.trim().toLowerCase()
}

export function checkRateLimit(email: string): { blocked: boolean; retryAfterSeconds?: number } {
  const key = normalize(email)
  const entry = attempts.get(key)
  if (!entry) return { blocked: false }

  const now = Date.now()

  if (entry.lockedUntil && entry.lockedUntil > now) {
    return { blocked: true, retryAfterSeconds: Math.ceil((entry.lockedUntil - now) / 1000) }
  }

  if (entry.lockedUntil && entry.lockedUntil <= now) {
    attempts.delete(key)
    return { blocked: false }
  }

  if (now - entry.firstAttemptAt > WINDOW_MS) {
    attempts.delete(key)
    return { blocked: false }
  }

  return { blocked: false }
}

export function recordFailedAttempt(email: string) {
  const key = normalize(email)
  const now = Date.now()
  const entry = attempts.get(key)

  if (!entry || now - entry.firstAttemptAt > WINDOW_MS) {
    attempts.set(key, { count: 1, firstAttemptAt: now, lockedUntil: null })
    return
  }

  entry.count += 1
  if (entry.count >= MAX_ATTEMPTS) {
    entry.lockedUntil = now + LOCK_MS
  }
}

export function resetAttempts(email: string) {
  attempts.delete(normalize(email))
}
