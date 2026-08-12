'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { ArrowLeft as ArrowLeftIcon, Trash2 as Trash2Icon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { TicketSidebarInfo } from './ticket-sidebar-info'
import { TicketConversation, type Comment } from './ticket-conversation'

type Ticket = {
  id: string
  number: number
  title: string
  description: string
  createdAt: string
  subject: { id: string; name: string }
  employee: { id: string; name: string } | null
  createdBy: { id: string; name: string; email: string }
  comments: Comment[]
  attachments: { id: string; filename: string; size: number }[]
}

export function TicketDetailView({
  ticketId,
  onBack,
  onNotFound,
  onChanged,
  showSidebar = false,
}: {
  ticketId: string
  onBack?: () => void
  onNotFound?: () => void
  onChanged?: () => void | Promise<void>
  showSidebar?: boolean
}) {
  const { data: session } = useSession()
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function fetchTicket() {
    const res = await fetch(`/api/tickets/${ticketId}`)
    if (!res.ok) {
      onNotFound?.()
      return
    }
    const data = await res.json()
    setTicket(data)
    setLoading(false)
  }

  useEffect(() => { fetchTicket() }, [ticketId])

  async function handleDelete() {
    setDeleting(true)
    await fetch(`/api/tickets/${ticketId}`, { method: 'DELETE' })
    setDeleting(false)
    setDeleteDialogOpen(false)
    onChanged?.()
    onBack?.()
  }

  if (loading || !ticket) {
    return <div className="text-gray-500">Carregando...</div>
  }

  const isAdmin = session?.user?.role === 'ADMIN'

  return (
    <div>
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeftIcon size={16} />
          Voltar
        </button>
      )}

      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <p className="text-xs text-gray-400 font-mono">#{String(ticket.number).padStart(6, '0')}</p>
          <h1 className="text-xl font-bold text-gray-900 mt-0.5">{ticket.title}</h1>
        </div>
        {isAdmin && (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2Icon size={16} />
            Excluir
          </Button>
        )}
      </div>

      <div className={showSidebar ? 'grid grid-cols-1 lg:grid-cols-3 gap-6' : 'space-y-6'}>
        <div className={showSidebar ? 'lg:col-span-2 space-y-6' : 'space-y-6'}>
          <div className="border rounded-lg p-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Descrição</p>
            <p className="text-sm text-gray-800 whitespace-pre-wrap">{ticket.description}</p>
          </div>

          {!showSidebar && (
            <TicketSidebarInfo
              createdBy={ticket.createdBy}
              subject={ticket.subject}
              employee={ticket.employee}
              createdAt={ticket.createdAt}
            />
          )}

          <TicketConversation
            ticketId={ticket.id}
            comments={ticket.comments}
            onPosted={fetchTicket}
          />
        </div>

        {showSidebar && (
          <div>
            <TicketSidebarInfo
              createdBy={ticket.createdBy}
              subject={ticket.subject}
              employee={ticket.employee}
              createdAt={ticket.createdAt}
            />
          </div>
        )}
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir chamado</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Tem certeza que deseja excluir permanentemente este chamado? Essa ação não pode ser desfeita.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Excluindo...' : 'Excluir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
