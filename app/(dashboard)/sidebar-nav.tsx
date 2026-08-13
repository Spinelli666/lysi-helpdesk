'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

const links = [
  { href: '/tickets', label: 'Chamados' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/admin/users', label: 'Usuários' },
  { href: '/employees', label: 'Funcionários' },
  { href: '/admin/subjects', label: 'Assuntos' },
  { href: '/logs', label: 'Logs' },
]

export function SidebarNav() {
  const pathname = usePathname()

  function linkClass(href: string) {
    const active = pathname === href || pathname.startsWith(href + '/')
    return `block px-3 py-2 rounded-md text-sm font-bold text-sidebar-foreground transition-colors ${
      active ? 'bg-sidebar-primary' : 'hover:bg-sidebar-accent'
    }`
  }

  return (
    <nav className="space-y-1">
      {links.map((link) => (
        <Link key={link.href} href={link.href} className={linkClass(link.href)}>
          {link.label}
        </Link>
      ))}
    </nav>
  )
}
