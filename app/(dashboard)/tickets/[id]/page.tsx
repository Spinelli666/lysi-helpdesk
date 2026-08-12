'use client'

import { useParams, useRouter } from 'next/navigation'
import { TicketDetailView } from '../ticket-detail-view'

export default function TicketDetailPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()

  return (
    <div className="p-6 max-w-7xl">
      <TicketDetailView
        ticketId={id}
        onBack={() => router.push('/tickets')}
        onNotFound={() => router.push('/tickets')}
        showSidebar
      />
    </div>
  )
}
