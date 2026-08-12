'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { PanelLeft as PanelLeftIcon, PanelLeftClose as PanelLeftCloseIcon } from 'lucide-react'
import { SidebarNav } from './sidebar-nav'
import { UserMenu } from './user-menu'

const STORAGE_KEY = 'lysi-sidebar-open'

export function DashboardShell({
  role,
  userName,
  userRole,
  children,
}: {
  role: string
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
          <aside
            className="w-56 shrink-0 min-h-screen px-4 py-6"
            style={{ backgroundColor: '#008A83', border: 'none', borderRight: '4px solid rgb(213, 51, 32)' }}
          >
            <Link href="/tickets" className="block w-fit mb-[100px] text-white font-bold text-xl">
              Lýsi
            </Link>
            <SidebarNav role={role} />
          </aside>
        )}

        <main className="flex-1 min-w-0">
          <header
            className="px-6 py-4 flex justify-between items-center"
            style={{ backgroundColor: '#008A83', borderBottom: '4px solid rgb(213, 51, 32)' }}
          >
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
