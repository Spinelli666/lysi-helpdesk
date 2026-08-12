import { auth } from '@/app/lib/auth'
import { prisma } from '@/app/lib/prisma'
import { redirect } from 'next/navigation'
import { ChangePasswordDialog } from './change-password-dialog'

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrador',
  SUPPORT: 'Suporte',
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="text-sm text-gray-800 mt-1">{value || '—'}</p>
    </div>
  )
}

export default async function ProfilePage() {
  const session = await auth()
  if (!session) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, role: true },
  })

  if (!user) redirect('/login')

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Meu Perfil</h1>

      <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-6">
        <div className="grid grid-cols-2 gap-6">
          <Field label="Nome Completo" value={user.name} />
          <Field label="Email" value={user.email} />
          <Field label="Cargo" value={ROLE_LABELS[user.role] ?? user.role} />
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Senha</p>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-sm text-gray-800">••••••••</p>
              <ChangePasswordDialog />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
