import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Lýsi - Login',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-950 via-indigo-900 to-indigo-700">
      {children}
    </div>
  )
}
