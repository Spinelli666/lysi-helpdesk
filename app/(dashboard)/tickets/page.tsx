'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { EyeIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { NewTicketDialog } from './new-ticket-dialog'
import { TicketDetailView } from './ticket-detail-view'

type Ticket = {
  id: string
  number: number
  title: string
  createdAt: string
  subject: { id: string; name: string }
  createdBy: { id: string; name: string }
}

export default function TicketsPage() {
  const router = useRouter()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [viewingTicketId, setViewingTicketId] = useState<string | null>(null)

  async function fetchTickets() {
    const res = await fetch('/api/tickets')
    const data = await res.json()
    setTickets(data)
    setLoading(false)
  }

  useEffect(() => { fetchTickets() }, [])

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Chamados</h1>
        <NewTicketDialog onCreated={fetchTickets} />
      </div>

      {loading ? (
        <p className="text-gray-500">Carregando...</p>
      ) : tickets.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📋</p>
          <p className="font-medium">Nenhum chamado encontrado</p>
          <p className="text-sm mt-1">Registre um atendimento para começar</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-center px-4 py-3">ID</th>
                <th className="text-center px-4 py-3">Título</th>
                <th className="text-center px-4 py-3">Assunto</th>
                <th className="text-center px-4 py-3">Registrado por</th>
                <th className="text-center px-4 py-3">Data</th>
                <th className="text-center px-4 py-3">Visualizar</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {tickets.map((ticket) => (
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
                  <td className="px-4 py-3 text-center text-gray-500">{ticket.createdBy.name}</td>
                  <td className="px-4 py-3 text-center text-gray-400 text-xs">
                    {new Date(ticket.createdAt).toLocaleDateString('pt-BR')}
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
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden border-3 border-[rgb(213,51,32)] flex flex-col">
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
