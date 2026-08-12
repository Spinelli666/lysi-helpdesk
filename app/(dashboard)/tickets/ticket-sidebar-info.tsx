export function TicketSidebarInfo({
  createdBy,
  subject,
  createdAt,
}: {
  createdBy: { name: string; email: string }
  subject: { name: string }
  createdAt: string
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
            <p className="text-xs text-gray-400 uppercase tracking-wide">Criado em</p>
            <p className="text-gray-800 mt-0.5">
              {new Date(createdAt).toLocaleString('pt-BR')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
