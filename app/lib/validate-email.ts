const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const ALLOWED_EMAIL_DOMAIN = 'igedes.org.br'

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email)
}

export function isAllowedEmailDomain(email: string): boolean {
  return email.trim().toLowerCase().endsWith(`@${ALLOWED_EMAIL_DOMAIN}`)
}
