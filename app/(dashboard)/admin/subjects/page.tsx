'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Subject = {
  id: string
  name: string
  active: boolean
}

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null)
  const [form, setForm] = useState({ name: '', active: true })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function fetchSubjects() {
    const res = await fetch('/api/subjects')
    const data = await res.json()
    setSubjects(data)
    setLoading(false)
  }

  useEffect(() => { fetchSubjects() }, [])

  function openNew() {
    setEditingSubject(null)
    setForm({ name: '', active: true })
    setError('')
    setOpen(true)
  }

  function openEdit(subject: Subject) {
    setEditingSubject(subject)
    setForm({ name: subject.name, active: subject.active })
    setError('')
    setOpen(true)
  }

  async function handleSave() {
    if (!form.name.trim()) {
      setError('Preencha o nome do assunto.')
      return
    }

    setSaving(true)
    setError('')

    const url = editingSubject ? `/api/subjects/${editingSubject.id}` : '/api/subjects'
    const method = editingSubject ? 'PATCH' : 'POST'

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

    await fetchSubjects()
    setOpen(false)
    setSaving(false)
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold">Assuntos</h1>
        <Button onClick={openNew}>+ Novo assunto</Button>
      </div>

      {loading ? (
        <p className="text-gray-500">Carregando...</p>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-center px-4 py-3">Nome</th>
                <th className="text-center px-4 py-3">Status</th>
                <th className="text-center px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {subjects.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-gray-500">
                    Nenhum assunto cadastrado.
                  </td>
                </tr>
              ) : (
              subjects.map((subject) => (
                <tr key={subject.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-center font-medium">{subject.name}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={subject.active ? 'default' : 'secondary'}>
                      {subject.active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Button size="sm" variant="outline" onClick={() => openEdit(subject)}>
                      Editar
                    </Button>
                  </td>
                </tr>
              ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingSubject ? 'Editar assunto' : 'Novo assunto'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div className="space-y-1">
              <Label>Nome *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ex: Suporte remoto ao usuário"
              />
            </div>

            {editingSubject && (
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="active"
                  checked={form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                  className="w-4 h-4"
                />
                <Label htmlFor="active">Assunto ativo</Label>
              </div>
            )}

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
    </div>
  )
}
