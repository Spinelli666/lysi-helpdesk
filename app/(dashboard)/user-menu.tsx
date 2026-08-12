'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { LogoutButton } from './logout-button'
import { Button } from '@/components/ui/button'
import { UserCircle, Sun, Moon } from 'lucide-react'

type Props = {
  name: string
  role: string
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrador',
  SUPPORT: 'Suporte',
}

export function UserMenu({ name, role }: Props) {
  const [open, setOpen] = useState(false)
  const [dark, setDark] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const stored = localStorage.getItem('theme') === 'dark'
    setDark(stored)
    document.documentElement.classList.toggle('dark', stored)
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function toggleDark() {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-white font-bold">Bem Vindo, {name}!</span>

      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center justify-center w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 transition-colors cursor-pointer"
        >
          <UserCircle size={36} className="text-white" />
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 py-3 px-4 z-50">
            <p className="font-semibold text-gray-800 text-sm">{name}</p>
            <p className="text-xs text-gray-400 mt-0.5">{ROLE_LABELS[role] ?? role}</p>
            <div className="border-t border-gray-100 mt-3 pt-3 flex flex-col gap-1">
              <Button asChild variant="outline" size="sm" className="w-full justify-start" onClick={() => setOpen(false)}>
                <Link href="/profile">Ver Perfil</Link>
              </Button>
              <LogoutButton />
            </div>
          </div>
        )}
      </div>

      <button
        onClick={toggleDark}
        className="flex items-center justify-center w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 transition-colors cursor-pointer"
        title={dark ? 'Modo claro' : 'Modo noturno'}
      >
        {dark ? <Sun size={20} className="text-white" /> : <Moon size={20} className="text-white" />}
      </button>
    </div>
  )
}
