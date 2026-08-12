'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'

type Subject = { id: string; name: string; active: boolean }
type Employee = { id: string; name: string; active: boolean }

export function NewTicketDialog({ onCreated }: { onCreated: () => void | Promise<void> }) {
  const [open, setOpen] = useState(false)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [subjectId, setSubjectId] = useState('')
  const [employeeId, setEmployeeId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    fetch('/api/subjects')
      .then((res) => res.json())
      .then(setSubjects)
    fetch('/api/employees')
      .then((res) => res.json())
      .then((data: Employee[]) => setEmployees(data.filter((e) => e.active)))
  }, [open])

  function openDialog() {
    setSubjectId('')
    setEmployeeId('')
    setTitle('')
    setDescription('')
    setError('')
    setOpen(true)
  }

  async function handleSave() {
    if (!subjectId || !employeeId || !title.trim() || !description.trim()) {
      setError('Preencha todos os campos.')
      return
    }

    setSaving(true)
    setError('')

    const res = await fetch('/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subjectId, employeeId, title, description }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Erro ao salvar.')
      setSaving(false)
      return
    }

    await onCreated()
    setSaving(false)
    setOpen(false)
  }

  return (
    <>
      <Button onClick={openDialog}>
        + Novo Chamado
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Novo Chamado</DialogTitle>
            <DialogDescription>
              Registre um atendimento já concluído.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1">
              <Label>Assunto *</Label>
              <Select value={subjectId} onValueChange={setSubjectId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione o assunto" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Funcionário atendido *</Label>
              <Select value={employeeId} onValueChange={setEmployeeId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione o funcionário" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((e) => (
                    <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Título *</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            <div className="space-y-1">
              <Label>Descrição *</Label>
              <Textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleSave} disabled={saving}>
              {saving ? 'Salvando...' : 'Concluir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
