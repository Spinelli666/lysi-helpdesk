'use client'

import { useEffect, useState } from 'react'
import { Eye as EyeIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type LogEntry = {
  id: string
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'TOGGLE'
  entityType: 'TICKET' | 'EMPLOYEE' | 'USER' | 'SUBJECT' | 'DOCUMENTATION'
  entityId: string
  entityLabel: string
  changes: Record<string, { before: unknown; after: unknown }> | null
  actorId: string
  actorName: string
  createdAt: string
}

const ENTITY_LABELS: Record<LogEntry['entityType'], string> = {
  TICKET: 'Chamado',
  EMPLOYEE: 'Funcionário',
  USER: 'Usuário',
  SUBJECT: 'Assunto',
  DOCUMENTATION: 'Documentação',
}

const ACTION_LABELS: Record<LogEntry['action'], string> = {
  CREATE: 'Criação',
  UPDATE: 'Edição',
  TOGGLE: 'Status',
  DELETE: 'Exclusão',
}

const ACTION_BADGE_VARIANT: Record<LogEntry['action'], 'default' | 'secondary' | 'success' | 'destructive'> = {
  CREATE: 'success',
  UPDATE: 'default',
  TOGGLE: 'secondary',
  DELETE: 'destructive',
}

const FIELD_LABELS: Record<string, string> = {
  name: 'Nome',
  email: 'Email',
  role: 'Perfil',
  active: 'Status',
  password: 'Senha',
  project: 'Projeto',
  unit: 'Unidade',
  department: 'Departamento',
  position: 'Cargo',
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Admin',
  SUPPORT: 'Suporte',
}

function formatValue(field: string, value: unknown): string {
  if (value === null || value === undefined || value === '') return '—'
  if (field === 'active') return value ? 'Ativo' : 'Inativo'
  if (field === 'role' && typeof value === 'string') return ROLE_LABELS[value] ?? value
  if (Array.isArray(value)) return value.length ? value.join(', ') : '—'
  return String(value)
}

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [entityFilter, setEntityFilter] = useState('ALL')
  const [actionFilter, setActionFilter] = useState('ALL')
  const [detailsLog, setDetailsLog] = useState<LogEntry | null>(null)

  async function fetchLogs() {
    setLoading(true)
    const params = new URLSearchParams()
    if (entityFilter !== 'ALL') params.set('entityType', entityFilter)
    if (actionFilter !== 'ALL') params.set('action', actionFilter)
    const res = await fetch(`/api/logs?${params.toString()}`)
    const data = await res.json()
    setLogs(data)
    setLoading(false)
  }

  useEffect(() => { fetchLogs() }, [entityFilter, actionFilter])

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold">Logs</h1>
      </div>

      <div className="flex gap-3 mb-4">
        <Select value={entityFilter} onValueChange={setEntityFilter}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todas as entidades</SelectItem>
            <SelectItem value="TICKET">Chamados</SelectItem>
            <SelectItem value="EMPLOYEE">Funcionários</SelectItem>
            <SelectItem value="USER">Usuários</SelectItem>
            <SelectItem value="SUBJECT">Assuntos</SelectItem>
            <SelectItem value="DOCUMENTATION">Documentação</SelectItem>
          </SelectContent>
        </Select>

        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todas as ações</SelectItem>
            <SelectItem value="CREATE">Criação</SelectItem>
            <SelectItem value="UPDATE">Edição</SelectItem>
            <SelectItem value="TOGGLE">Status</SelectItem>
            <SelectItem value="DELETE">Exclusão</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <p className="text-gray-500">Carregando...</p>
      ) : logs.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🗒️</p>
          <p className="font-medium">Nenhum registro encontrado</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm border-separate border-spacing-0">
            <thead className="bg-primary text-primary-foreground uppercase">
              <tr>
                <th className="text-center px-4 py-3">Data/Hora</th>
                <th className="text-center px-4 py-3">Usuário</th>
                <th className="text-center px-4 py-3">Ação</th>
                <th className="text-center px-4 py-3">Entidade</th>
                <th className="text-center px-4 py-3">Descrição</th>
                <th className="text-center px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-center text-gray-400 text-xs whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString('pt-BR')}
                  </td>
                  <td className="px-4 py-3 text-center font-medium">{log.actorName}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={ACTION_BADGE_VARIANT[log.action]}>{ACTION_LABELS[log.action]}</Badge>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-500">{ENTITY_LABELS[log.entityType]}</td>
                  <td className="px-4 py-3 text-center text-gray-700">{log.entityLabel}</td>
                  <td className="px-4 py-3 text-center">
                    {log.changes && Object.keys(log.changes).length > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setDetailsLog(log)}
                      >
                        <EyeIcon />
                        <span className="sr-only">Ver detalhes</span>
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={detailsLog !== null} onOpenChange={(open) => !open && setDetailsLog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterações — {detailsLog?.entityLabel}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {detailsLog?.changes &&
              Object.entries(detailsLog.changes).map(([field, { before, after }]) => (
                <div key={field} className="border rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
                    {FIELD_LABELS[field] ?? field}
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-400 line-through">{formatValue(field, before)}</span>
                    <span className="text-gray-400">→</span>
                    <span className="text-gray-900 font-medium">{formatValue(field, after)}</span>
                  </div>
                </div>
              ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
