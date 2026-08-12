'use client'

import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type User = {
  id: string
  name: string
  email: string
  role: string
  active: boolean
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Admin',
  SUPPORT: 'Suporte',
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'SUPPORT' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const [deletingUser, setDeletingUser] = useState<User | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const filteredUsers = users.filter((user) => {
    const term = search.trim().toLowerCase()
    if (!term) return true
    return user.name.toLowerCase().includes(term) || user.email.toLowerCase().includes(term)
  })

  async function fetchUsers() {
    const res = await fetch('/api/users')
    const data = await res.json()
    setUsers(data)
    setLoading(false)
  }

  useEffect(() => { fetchUsers() }, [])

  function openNew() {
    setEditingUser(null)
    setForm({ name: '', email: '', password: '', role: 'SUPPORT' })
    setError('')
    setOpen(true)
  }

  function openEdit(user: User) {
    setEditingUser(user)
    setForm({ name: user.name, email: user.email, password: '', role: user.role })
    setError('')
    setOpen(true)
  }

  async function handleSave() {
    if (!form.name.trim() || !form.email.trim() || (!editingUser && !form.password)) {
      setError('Preencha todos os campos.')
      return
    }

    setSaving(true)
    setError('')

    const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users'
    const method = editingUser ? 'PATCH' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Erro ao salvar.')
      setSaving(false)
      return
    }

    await fetchUsers()
    setOpen(false)
    setSaving(false)
  }

  async function handleToggle(id: string) {
    await fetch(`/api/users/${id}/toggle`, { method: 'PATCH' })
    await fetchUsers()
  }

  async function handleDelete() {
    if (!deletingUser) return

    setDeleting(true)
    setDeleteError('')

    const res = await fetch(`/api/users/${deletingUser.id}`, { method: 'DELETE' })

    if (!res.ok) {
      const data = await res.json()
      setDeleteError(data.error ?? 'Erro ao excluir.')
      setDeleting(false)
      return
    }

    await fetchUsers()
    setDeleting(false)
    setDeletingUser(null)
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Usuários</h1>
        <Button onClick={openNew}>+ Novo usuário</Button>
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Pesquisar por nome ou email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {loading ? (
        <p className="text-gray-500">Carregando...</p>
      ) : (
        <div>
          <table className="w-full text-sm border-separate border-spacing-0 border-4 border-[#d53320] rounded-lg overflow-hidden">
            <thead className="bg-[#d53320] text-white uppercase">
              <tr className="bg-[#d53320]">
                <th className="text-center px-4 py-3 bg-[#d53320]">Nome</th>
                <th className="text-center px-4 py-3 bg-[#d53320]">Email</th>
                <th className="text-center px-4 py-3 bg-[#d53320]">Cargo</th>
                <th className="text-center px-4 py-3 bg-[#d53320]">Status</th>
                <th className="text-center px-4 py-3 bg-[#d53320]"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-center font-medium">{user.name}</td>
                  <td className="px-4 py-3 text-center text-gray-500">{user.email}</td>
                  <td className="px-4 py-3 text-center text-gray-500">{ROLE_LABELS[user.role] ?? user.role}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={user.active ? 'default' : 'secondary'}>
                      {user.active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-center">
                      <Button
                        size="sm"
                        variant="outline"
                        title="Editar"
                        onClick={() => openEdit(user)}
                      >
                        ✏️
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggle(user.id)}
                      >
                        {user.active ? 'Inativar' : 'Ativar'}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        title="Excluir"
                        onClick={() => { setDeletingUser(user); setDeleteError('') }}
                      >
                        🗑️
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg border-3 border-[rgb(213,51,32)]">
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Editar usuário' : 'Novo usuário'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div className="space-y-1">
              <Label>Nome *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Email *</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Cargo *</Label>
                <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SUPPORT">Suporte</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>{editingUser ? 'Nova senha' : 'Senha *'}</Label>
                <Input
                  type="password"
                  placeholder={editingUser ? 'Deixe em branco para manter' : undefined}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deletingUser} onOpenChange={(v) => !v && setDeletingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir usuário</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Tem certeza que deseja excluir permanentemente {deletingUser?.name}? Essa ação não pode ser desfeita.
            Se o usuário tiver chamados ou anotações vinculadas, use &quot;Inativar&quot; em vez de excluir.
          </p>
          {deleteError && <p className="text-sm text-red-500">{deleteError}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingUser(null)}>
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
