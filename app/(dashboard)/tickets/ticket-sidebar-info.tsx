function formatDuration(startedAt: string, endedAt: string) {
  const minutes = Math.round((new Date(endedAt).getTime() - new Date(startedAt).getTime()) / 60000)
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return hours > 0 ? `${hours}h ${remainingMinutes}min` : `${remainingMinutes}min`
}

export function TicketSidebarInfo({
  createdBy,
  subject,
  employee,
  startedAt,
  endedAt,
}: {
  createdBy: { name: string; email: string }
  subject: { name: string }
  employee: { name: string } | null
  startedAt: string
  endedAt: string
}) {
  return (
    <div className="space-y-4">
      <div className="border rounded-lg p-4">
        <p className="text-sm font-medium text-gray-700 mb-3">Registrado por</p>
        <div className="space-y-3 text-sm">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Nome</p>
            <p className="text-gray-800 mt-0.5">{createdBy.name}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Email</p>
            <p className="text-gray-800 mt-0.5 break-all">{createdBy.email}</p>
          </div>
        </div>
      </div>

      <div className="border rounded-lg p-4">
        <p className="text-sm font-medium text-gray-700 mb-3">Informações do Chamado</p>
        <div className="space-y-3 text-sm">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Assunto</p>
            <p className="text-gray-800 mt-0.5">{subject.name}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Funcionário atendido</p>
            <p className="text-gray-800 mt-0.5">{employee?.name ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Início do atendimento</p>
            <p className="text-gray-800 mt-0.5">
              {new Date(startedAt).toLocaleString('pt-BR')}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Tempo de atendimento</p>
            <p className="text-gray-800 mt-0.5">
              {formatDuration(startedAt, endedAt)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
