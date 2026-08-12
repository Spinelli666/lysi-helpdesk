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
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#008A83' }}>
      {children}
    </div>
  )
}
