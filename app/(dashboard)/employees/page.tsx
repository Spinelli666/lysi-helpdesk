'use client'

import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PROJECTS, UNITS_BY_PROJECT, CARGOS } from '@/app/lib/user-fields-constants'

type Employee = {
  id: string
  name: string
  active: boolean
  project: string | null
  unit: string[]
  department: string | null
  position: string | null
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [form, setForm] = useState({
    name: '', project: '', unit: [] as string[], department: '', position: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const [projectPickerOpen, setProjectPickerOpen] = useState(false)
  const [projectPickerSearch, setProjectPickerSearch] = useState('')

  const [unitPickerOpen, setUnitPickerOpen] = useState(false)
  const [unitPickerSearch, setUnitPickerSearch] = useState('')
  const [draftUnits, setDraftUnits] = useState<string[]>([])

  const [cargoPickerOpen, setCargoPickerOpen] = useState(false)
  const [cargoPickerSearch, setCargoPickerSearch] = useState('')

  const filteredEmployees = employees.filter((employee) => {
    const term = search.trim().toLowerCase()
    if (!term) return true
    return employee.name.toLowerCase().includes(term)
  })

  async function fetchEmployees() {
    const res = await fetch('/api/employees')
    const data = await res.json()
    setEmployees(data)
    setLoading(false)
  }

  useEffect(() => { fetchEmployees() }, [])

  function openNew() {
    setEditingEmployee(null)
    setForm({ name: '', project: '', unit: [], department: '', position: '' })
    setError('')
    setOpen(true)
  }

  function openEdit(employee: Employee) {
    setEditingEmployee(employee)
    setForm({
      name: employee.name,
      project: employee.project ?? '',
      unit: employee.unit ?? [],
      department: employee.department ?? '',
      position: employee.position ?? '',
    })
    setError('')
    setOpen(true)
  }

  function openProjectPicker() {
    setProjectPickerSearch('')
    setProjectPickerOpen(true)
  }
  function selectProject(project: string) {
    setForm((prev) => ({ ...prev, project, unit: [] }))
    setProjectPickerOpen(false)
  }
  const filteredProjects = PROJECTS.filter((p) =>
    p.toLowerCase().includes(projectPickerSearch.toLowerCase())
  )

  const unitsForProject = UNITS_BY_PROJECT[form.project] ?? []
  function openUnitPicker() {
    if (!form.project) return
    setDraftUnits(form.unit)
    setUnitPickerSearch('')
    setUnitPickerOpen(true)
  }
  function toggleDraftUnit(unit: string) {
    setDraftUnits((prev) => (prev.includes(unit) ? prev.filter((u) => u !== unit) : [...prev, unit]))
  }
  function saveUnits() {
    setForm((prev) => ({ ...prev, unit: draftUnits }))
    setUnitPickerOpen(false)
  }
  const filteredUnits = unitsForProject.filter((u) =>
    u.toLowerCase().includes(unitPickerSearch.toLowerCase())
  )

  function openCargoPicker() {
    setCargoPickerSearch('')
    setCargoPickerOpen(true)
  }
  function selectCargo(position: string) {
    setForm((prev) => ({ ...prev, position }))
    setCargoPickerOpen(false)
  }
  const filteredCargos = CARGOS.filter((c) =>
    c.toLowerCase().includes(cargoPickerSearch.toLowerCase())
  )

  async function handleSave() {
    if (!form.name.trim()) {
      setError('Preencha o nome do funcionário.')
      return
    }

    setSaving(true)
    setError('')

    const url = editingEmployee ? `/api/employees/${editingEmployee.id}` : '/api/employees'
    const method = editingEmployee ? 'PATCH' : 'POST'

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

    await fetchEmployees()
    setOpen(false)
    setSaving(false)
  }

  async function handleToggle(id: string) {
    await fetch(`/api/employees/${id}/toggle`, { method: 'PATCH' })
    await fetchEmployees()
  }

  async function handleDelete() {
    if (!deletingEmployee) return

    setDeleting(true)
    setDeleteError('')

    const res = await fetch(`/api/employees/${deletingEmployee.id}`, { method: 'DELETE' })

    if (!res.ok) {
      const data = await res.json()
      setDeleteError(data.error ?? 'Erro ao excluir.')
      setDeleting(false)
      return
    }

    await fetchEmployees()
    setDeleting(false)
    setDeletingEmployee(null)
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold">Funcionários</h1>
        <Button onClick={openNew}>+ Novo funcionário</Button>
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Pesquisar por nome..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {loading ? (
        <p className="text-gray-500">Carregando...</p>
      ) : (
        <div>
          <table className="w-full text-sm border-separate border-spacing-0 border border-border rounded-lg overflow-hidden">
            <thead className="bg-primary text-primary-foreground uppercase">
              <tr>
                <th className="text-center px-4 py-3">Nome</th>
                <th className="text-center px-4 py-3">Status</th>
                <th className="text-center px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-gray-500">
                    Nenhum funcionário encontrado.
                  </td>
                </tr>
              ) : (
              filteredEmployees.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-center font-medium">{employee.name}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={employee.active ? 'success' : 'secondary'}>
                      {employee.active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-center">
                      <Button
                        size="sm"
                        variant="outline"
                        title="Editar"
                        onClick={() => openEdit(employee)}
                      >
                        ✏️
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggle(employee.id)}
                      >
                        {employee.active ? 'Inativar' : 'Ativar'}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        title="Excluir"
                        onClick={() => { setDeletingEmployee(employee); setDeleteError('') }}
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
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingEmployee ? 'Editar funcionário' : 'Novo funcionário'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div className="space-y-1">
              <Label>Nome *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ex: Maria Souza"
              />
            </div>

            <div className="pt-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                Informações adicionais (opcional)
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Projeto</Label>
                  <button
                    type="button"
                    onClick={openProjectPicker}
                    className="flex h-8 w-full min-w-0 items-center overflow-hidden rounded-lg border border-input bg-transparent px-2.5 py-1 text-left text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30"
                  >
                    {form.project ? (
                      <span className="block w-full truncate">{form.project}</span>
                    ) : (
                      <span className="block w-full truncate text-muted-foreground">Selecione o projeto</span>
                    )}
                  </button>
                </div>

                <div className="space-y-1">
                  <Label>Unidade</Label>
                  <button
                    type="button"
                    onClick={openUnitPicker}
                    disabled={!form.project}
                    className="flex h-8 w-full min-w-0 items-center overflow-hidden rounded-lg border border-input bg-transparent px-2.5 py-1 text-left text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 disabled:cursor-not-allowed md:text-sm dark:bg-input/30"
                  >
                    {form.unit.length > 0 ? (
                      <span className="block w-full truncate">{form.unit.join(', ')}</span>
                    ) : (
                      <span className="block w-full truncate text-muted-foreground">
                        {form.project ? 'Selecione a(s) unidade(s)' : 'Selecione o projeto primeiro'}
                      </span>
                    )}
                  </button>
                </div>

                <div className="space-y-1">
                  <Label>Departamento</Label>
                  <Input
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <Label>Cargo</Label>
                  <button
                    type="button"
                    onClick={openCargoPicker}
                    className="flex h-8 w-full min-w-0 items-center overflow-hidden rounded-lg border border-input bg-transparent px-2.5 py-1 text-left text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30"
                  >
                    {form.position ? (
                      <span className="block w-full truncate">{form.position}</span>
                    ) : (
                      <span className="block w-full truncate text-muted-foreground">Selecione o cargo</span>
                    )}
                  </button>
                </div>
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

      <Dialog open={projectPickerOpen} onOpenChange={setProjectPickerOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Selecionar Projeto</DialogTitle>
          </DialogHeader>

          <Input
            placeholder="Pesquisar projeto..."
            value={projectPickerSearch}
            onChange={(e) => setProjectPickerSearch(e.target.value)}
          />

          <div className="max-h-80 overflow-y-auto">
            {filteredProjects.length === 0 && (
              <p className="text-sm text-gray-500">Nenhum projeto encontrado.</p>
            )}
            <div className="grid grid-cols-2 gap-2">
              {filteredProjects.map((project) => {
                const selected = form.project === project
                return (
                  <button
                    key={project}
                    type="button"
                    onClick={() => selectProject(project)}
                    className={
                      selected
                        ? 'text-left text-sm px-3 py-2 rounded-lg border border-primary bg-primary/10 text-primary font-medium transition-colors'
                        : 'text-left text-sm px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors'
                    }
                  >
                    {project}
                  </button>
                )
              })}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setProjectPickerOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={unitPickerOpen} onOpenChange={setUnitPickerOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Selecionar Unidade(s)</DialogTitle>
          </DialogHeader>

          <Input
            placeholder="Pesquisar unidade..."
            value={unitPickerSearch}
            onChange={(e) => setUnitPickerSearch(e.target.value)}
          />

          <div className="max-h-80 overflow-y-auto">
            {filteredUnits.length === 0 && (
              <p className="text-sm text-gray-500">Nenhuma unidade encontrada.</p>
            )}
            <div className="grid grid-cols-2 gap-2">
              {filteredUnits.map((unit) => {
                const selected = draftUnits.includes(unit)
                return (
                  <button
                    key={unit}
                    type="button"
                    onClick={() => toggleDraftUnit(unit)}
                    className={
                      selected
                        ? 'text-left text-sm px-3 py-2 rounded-lg border border-primary bg-primary/10 text-primary font-medium transition-colors'
                        : 'text-left text-sm px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors'
                    }
                  >
                    {unit}
                  </button>
                )
              })}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setUnitPickerOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={saveUnits}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={cargoPickerOpen} onOpenChange={setCargoPickerOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Selecionar Cargo</DialogTitle>
          </DialogHeader>

          <Input
            placeholder="Pesquisar cargo..."
            value={cargoPickerSearch}
            onChange={(e) => setCargoPickerSearch(e.target.value)}
          />

          <div className="max-h-80 overflow-y-auto">
            {filteredCargos.length === 0 && (
              <p className="text-sm text-gray-500">Nenhum cargo encontrado.</p>
            )}
            <div className="grid grid-cols-2 gap-2">
              {filteredCargos.map((cargo) => {
                const selected = form.position === cargo
                return (
                  <button
                    key={cargo}
                    type="button"
                    onClick={() => selectCargo(cargo)}
                    className={
                      selected
                        ? 'text-left text-sm px-3 py-2 rounded-lg border border-primary bg-primary/10 text-primary font-medium transition-colors'
                        : 'text-left text-sm px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors'
                    }
                  >
                    {cargo}
                  </button>
                )
              })}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setCargoPickerOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deletingEmployee} onOpenChange={(v) => !v && setDeletingEmployee(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir funcionário</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Tem certeza que deseja excluir permanentemente {deletingEmployee?.name}? Essa ação não pode ser desfeita.
            Se o funcionário tiver chamados vinculados, use &quot;Inativar&quot; em vez de excluir.
          </p>
          {deleteError && <p className="text-sm text-red-500">{deleteError}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingEmployee(null)}>
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
