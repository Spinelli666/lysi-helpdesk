'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { EyeIcon, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { NewTicketDialog } from './new-ticket-dialog'
import { ExportTicketsDialog } from './export-tickets-dialog'
import { TicketDetailView } from './ticket-detail-view'

type Ticket = {
  id: string
  number: number
  title: string
  startedAt: string
  subject: { id: string; name: string }
  employee: { id: string; name: string } | null
  createdBy: { id: string; name: string }
}

export default function TicketsPage() {
  const router = useRouter()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [viewingTicketId, setViewingTicketId] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  async function fetchTickets() {
    const res = await fetch('/api/tickets')
    const data = await res.json()
    setTickets(data)
    setLoading(false)
  }

  useEffect(() => { fetchTickets() }, [])

  const filteredTickets = tickets.filter((ticket) => {
    const term = search.trim().toLowerCase()
    if (!term) return true
    return (
      ticket.title.toLowerCase().includes(term) ||
      String(ticket.number).padStart(6, '0').includes(term) ||
      ticket.subject.name.toLowerCase().includes(term) ||
      (ticket.employee?.name.toLowerCase().includes(term) ?? false) ||
      ticket.createdBy.name.toLowerCase().includes(term)
    )
  })

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold">Chamados</h1>
        <div className="flex items-center gap-2">
          <ExportTicketsDialog />
          <NewTicketDialog onCreated={fetchTickets} />
        </div>
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Pesquisar por título, nº, assunto ou funcionário..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {loading ? (
        <p className="text-gray-500">Carregando...</p>
      ) : tickets.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📋</p>
          <p className="font-medium">Nenhum chamado encontrado</p>
          <p className="text-sm mt-1">Registre um atendimento para começar</p>
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-medium">Nenhum chamado encontrado para essa pesquisa</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-center px-4 py-3">ID</th>
                <th className="text-center px-4 py-3">Título</th>
                <th className="text-center px-4 py-3">Assunto</th>
                <th className="text-center px-4 py-3">Funcionário</th>
                <th className="text-center px-4 py-3">Registrado por</th>
                <th className="text-center px-4 py-3">Data</th>
                <th className="text-center px-4 py-3">Visualizar</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredTickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => router.push(`/tickets/${ticket.id}`)}
                >
                  <td className="px-4 py-3 text-center text-gray-400 font-mono text-xs">
                    #{String(ticket.number).padStart(6, '0')}
                  </td>
                  <td className="px-4 py-3 text-center font-medium">{ticket.title}</td>
                  <td className="px-4 py-3 text-center text-gray-500">{ticket.subject.name}</td>
                  <td className="px-4 py-3 text-center text-gray-500">{ticket.employee?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-center text-gray-500">{ticket.createdBy.name}</td>
                  <td className="px-4 py-3 text-center text-gray-400 text-xs">
                    {new Date(ticket.startedAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            setViewingTicketId(ticket.id)
                          }}
                        >
                          <EyeIcon />
                          <span className="sr-only">Visualizar</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Visualizar</TooltipContent>
                    </Tooltip>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog
        open={viewingTicketId !== null}
        onOpenChange={(open) => !open && setViewingTicketId(null)}
      >
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>
              Detalhes do Chamado
              {(() => {
                const viewingTicket = tickets.find((t) => t.id === viewingTicketId)
                return viewingTicket ? ` - #${String(viewingTicket.number).padStart(6, '0')}` : ''
              })()}
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto pr-1 -mr-1 flex-1 min-h-0">
            {viewingTicketId && (
              <TicketDetailView
                ticketId={viewingTicketId}
                onChanged={fetchTickets}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
