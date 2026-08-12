'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

type Props = {
  role: string
}

const links = [
  { href: '/tickets', label: 'Chamados' },
  { href: '/dashboard', label: 'Dashboard' },
]

const adminLinks = [
  { href: '/admin/users', label: 'Usuários' },
  { href: '/admin/subjects', label: 'Assuntos' },
]

export function SidebarNav({ role }: Props) {
  const pathname = usePathname()

  const isAdmin = role === 'ADMIN'

  function linkClass(href: string) {
    const active = pathname === href || pathname.startsWith(href + '/')
    return `block px-3 py-2 rounded-md text-sm font-bold text-white transition-colors ${
      active ? 'bg-[rgb(213,51,32)]' : 'hover:bg-white/10'
    }`
  }

  return (
    <nav className="space-y-1">
      {links.map((link) => (
        <Link key={link.href} href={link.href} className={linkClass(link.href)}>
          {link.label}
        </Link>
      ))}

      {isAdmin && (
        <>
          <p className="text-xs text-white/60 uppercase mt-4 mb-1 px-3">Administrador</p>
          {adminLinks.map((link) => (
            <Link key={link.href} href={link.href} className={linkClass(link.href)}>
              {link.label}
            </Link>
          ))}
        </>
      )}
    </nav>
  )
}
