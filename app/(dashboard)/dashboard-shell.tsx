'use client'

import { useEffect, useState } from 'react'
import { PanelLeft as PanelLeftIcon, PanelLeftClose as PanelLeftCloseIcon } from 'lucide-react'
import { SidebarNav } from './sidebar-nav'
import { UserMenu } from './user-menu'
import { LysiWordmark } from '@/components/logo'

const STORAGE_KEY = 'lysi-sidebar-open'

export function DashboardShell({
  userName,
  userRole,
  children,
}: {
  userName: string
  userRole: string
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored !== null) setSidebarOpen(stored === 'true')
  }, [])

  function toggleSidebar() {
    setSidebarOpen((prev) => {
      const next = !prev
      localStorage.setItem(STORAGE_KEY, String(next))
      return next
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {sidebarOpen && (
          <aside className="w-56 shrink-0 min-h-screen px-4 py-6 bg-sidebar text-sidebar-foreground">
            <LysiWordmark
              className="mb-[100px] text-sidebar-foreground"
              markVariant="mono"
              markClassName="h-7 w-7"
              textClassName="text-lg"
            />
            <SidebarNav />
          </aside>
        )}

        <main className="flex-1 min-w-0">
          <header className="px-6 py-4 flex justify-between items-center bg-sidebar text-sidebar-foreground border-b border-sidebar-border">
            <button
              type="button"
              onClick={toggleSidebar}
              title={sidebarOpen ? 'Recolher menu' : 'Expandir menu'}
              className="text-white/80 hover:text-white p-1.5 rounded hover:bg-white/10"
            >
              {sidebarOpen ? <PanelLeftCloseIcon size={20} /> : <PanelLeftIcon size={20} />}
            </button>
            <UserMenu name={userName} role={userRole} />
          </header>
          {children}
        </main>
      </div>
    </div>
  )
}
