'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { NewEmployeeDialog } from '../employees/new-employee-dialog'

type Subject = { id: string; name: string; active: boolean }
type Employee = { id: string; name: string; active: boolean }

function todayInputValue() {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

function nowTimeInputValue() {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(now.getHours())}:${pad(now.getMinutes())}`
}

export function NewTicketDialog({ onCreated }: { onCreated: () => void | Promise<void> }) {
  const [open, setOpen] = useState(false)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [subjectId, setSubjectId] = useState('')
  const [employeeId, setEmployeeId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function fetchEmployees() {
    const res = await fetch('/api/employees')
    const data: Employee[] = await res.json()
    setEmployees(data.filter((e) => e.active))
  }

  useEffect(() => {
    if (!open) return
    fetch('/api/subjects')
      .then((res) => res.json())
      .then(setSubjects)
    fetchEmployees()
  }, [open])

  function openDialog() {
    setSubjectId('')
    setEmployeeId('')
    setTitle('')
    setDescription('')
    setDate(todayInputValue())
    setStartTime(nowTimeInputValue())
    setEndTime(nowTimeInputValue())
    setError('')
    setOpen(true)
  }

  async function handleSave() {
    if (!subjectId || !employeeId || !title.trim() || !description.trim() || !date || !startTime || !endTime) {
      setError('Preencha todos os campos.')
      return
    }

    if (endTime < startTime) {
      setError('O horário de término deve ser depois do horário de início.')
      return
    }

    setSaving(true)
    setError('')

    const res = await fetch('/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subjectId,
        employeeId,
        title,
        description,
        startedAt: `${date}T${startTime}`,
        endedAt: `${date}T${endTime}`,
      }),
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

            <div className="space-y-1">
              <Label>Data do atendimento *</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full sm:w-48" />
            </div>

            <div className="flex items-end gap-3">
              <div className="space-y-1 flex-1">
                <Label>Início *</Label>
                <div className="flex gap-1.5">
                  <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                  <Button type="button" variant="outline" size="sm" onClick={() => setStartTime(nowTimeInputValue())}>
                    Agora
                  </Button>
                </div>
              </div>
              <div className="space-y-1 flex-1">
                <Label>Fim *</Label>
                <div className="flex gap-1.5">
                  <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                  <Button type="button" variant="outline" size="sm" onClick={() => setEndTime(nowTimeInputValue())}>
                    Agora
                  </Button>
                </div>
              </div>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          <DialogFooter className="sm:justify-between">
            <NewEmployeeDialog
              triggerLabel="+ Adicionar funcionário"
              triggerVariant="outline"
              onCreated={async (employee) => {
                await fetchEmployees()
                setEmployeeId(employee.id)
              }}
            />
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="button" onClick={handleSave} disabled={saving}>
                {saving ? 'Salvando...' : 'Concluir'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
