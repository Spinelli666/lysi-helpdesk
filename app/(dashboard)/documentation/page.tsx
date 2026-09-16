import { auth } from '@/app/lib/auth'
import { redirect } from 'next/navigation'
import { DocumentationView } from './documentation-view'

export default async function DocumentationPage() {
  const session = await auth()
  if (!session) redirect('/login')

  return <DocumentationView isAdmin={session.user.role === 'ADMIN'} />
}
