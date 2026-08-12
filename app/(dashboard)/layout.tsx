import type { Metadata } from 'next'
import { auth } from '@/app/lib/auth'
import { redirect } from 'next/navigation'
import { DashboardShell } from './dashboard-shell'

export const metadata: Metadata = {
  title: 'Lýsi - Home',
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session) redirect('/login')

  return (
    <DashboardShell
      role={session.user.role}
      userName={session.user.name ?? ''}
      userRole={session.user.role}
    >
      {children}
    </DashboardShell>
  )
}
