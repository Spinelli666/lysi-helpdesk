'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

const links = [
  { href: '/tickets', label: 'Chamados' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/admin/users', label: 'Usuários', adminOnly: true },
  { href: '/employees', label: 'Funcionários' },
  { href: '/admin/subjects', label: 'Assuntos', adminOnly: true },
  { href: '/logs', label: 'Logs' },
]

export function SidebarNav({ userRole }: { userRole: string }) {
  const pathname = usePathname()
  const visibleLinks = links.filter((link) => !link.adminOnly || userRole === 'ADMIN')

  function linkClass(href: string) {
    const active = pathname === href || pathname.startsWith(href + '/')
    return `block px-3 py-2 rounded-md text-sm font-bold text-sidebar-foreground transition-colors ${
      active ? 'bg-sidebar-primary' : 'hover:bg-sidebar-accent'
    }`
  }

  return (
    <nav className="space-y-1">
      {visibleLinks.map((link) => (
        <Link key={link.href} href={link.href} className={linkClass(link.href)}>
          {link.label}
        </Link>
      ))}
    </nav>
  )
}
