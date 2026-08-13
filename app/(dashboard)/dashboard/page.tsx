'use client'

import { useEffect, useMemo, useState } from 'react'
import { Label } from '@/components/ui/label'
import { NewTicketDialog } from '../tickets/new-ticket-dialog'

const BRAND = '#4F46E5'

type Ticket = {
  id: string
  number: number
  title: string
  createdAt: string
  subject: { id: string; name: string }
  createdBy: { id: string; name: string }
  employee: { id: string; name: string } | null
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function monthLabel(key: string) {
  const [y, m] = key.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
}

function addMonths(key: string, delta: number) {
  const [y, m] = key.split('-').map(Number)
  return monthKey(new Date(y, m - 1 + delta, 1))
}

function monthRange(from: string, to: string) {
  const result: string[] = []
  let cur = from
  let guard = 0
  while (cur <= to && guard < 240) {
    result.push(cur)
    cur = addMonths(cur, 1)
    guard++
  }
  return result
}

function dayKey(date: Date) {
  return date.toDateString()
}

function dayRange(from: Date, to: Date) {
  const result: Date[] = []
  const cur = new Date(from)
  cur.setHours(0, 0, 0, 0)
  const end = new Date(to)
  end.setHours(0, 0, 0, 0)
  let guard = 0
  while (cur <= end && guard < 730) {
    result.push(new Date(cur))
    cur.setDate(cur.getDate() + 1)
    guard++
  }
  return result
}

const CURRENT_MONTH = monthKey(new Date())

const PRESETS = [
  { key: 'current', label: 'Este mês', from: CURRENT_MONTH, to: CURRENT_MONTH },
  { key: '3m', label: 'Últimos 3 meses', from: addMonths(CURRENT_MONTH, -2), to: CURRENT_MONTH },
  { key: '6m', label: 'Últimos 6 meses', from: addMonths(CURRENT_MONTH, -5), to: CURRENT_MONTH },
  { key: 'year', label: 'Este ano', from: `${new Date().getFullYear()}-01`, to: CURRENT_MONTH },
  { key: 'all', label: 'Tudo', from: '', to: '' },
] as const

function countBy<T extends string>(items: T[]) {
  const counts: Record<string, number> = {}
  for (const item of items) {
    counts[item] = (counts[item] ?? 0) + 1
  }
  return counts
}

function HorizontalBars({ data }: { data: { label: string; count: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.count))
  return (
    <div className="space-y-2">
      {data.map((d) => {
        const pct = Math.round((d.count / max) * 100)
        return (
          <div key={d.label} title={`${d.label}: ${d.count}`}>
            <div className="flex items-center justify-between text-sm mb-1 gap-2">
              <span className="text-gray-700 truncate">{d.label}</span>
              <span className="text-gray-500 shrink-0">{d.count}</span>
            </div>
            <div className="h-2 rounded-full bg-gray-100">
              <div
                className="h-2 rounded-full transition-[width]"
                style={{ width: `${pct}%`, backgroundColor: BRAND }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function AreaChart({ data }: { data: { label: string; count: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.count))
  const width = 700
  const height = 160
  const padding = 20
  const stepX = data.length > 1 ? (width - padding * 2) / (data.length - 1) : 0

  const points = data.map((d, i) => ({
    x: padding + i * stepX,
    y: height - padding - (d.count / max) * (height - padding * 2),
    ...d,
  }))

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
  const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${height - padding} L ${points[0].x.toFixed(1)} ${height - padding} Z`

  const labeledIndexes = new Set(points.map((_, i) => i).filter((i) => i % Math.ceil(points.length / 8 || 1) === 0 || i === points.length - 1))

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-40">
        <path d={areaPath} fill={BRAND} opacity="0.08" />
        <path d={linePath} fill="none" stroke={BRAND} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill={BRAND}>
            <title>{`${p.label}: ${p.count}`}</title>
          </circle>
        ))}
      </svg>
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        {points.filter((_, i) => labeledIndexes.has(i)).map((p) => (
          <span key={p.label}>{p.label}</span>
        ))}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)

  const [fromMonth, setFromMonth] = useState(addMonths(CURRENT_MONTH, -5))
  const [toMonth, setToMonth] = useState(CURRENT_MONTH)
  const [granularity, setGranularity] = useState<'month' | 'day'>('month')

  async function fetchData() {
    const res = await fetch('/api/tickets')
    setTickets(await res.json())
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const activePreset = useMemo(
    () => PRESETS.find((p) => p.from === fromMonth && p.to === toMonth)?.key ?? 'custom',
    [fromMonth, toMonth]
  )

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const key = monthKey(new Date(t.createdAt))
      if (fromMonth && key < fromMonth) return false
      if (toMonth && key > toMonth) return false
      return true
    })
  }, [tickets, fromMonth, toMonth])

  const total = filteredTickets.length

  const todayCount = useMemo(() => {
    const todayKey = dayKey(new Date())
    return filteredTickets.filter((t) => dayKey(new Date(t.createdAt)) === todayKey).length
  }, [filteredTickets])

  const subjectData = useMemo(() => {
    const counts = countBy(filteredTickets.map((t) => t.subject.name))
    return Object.entries(counts)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
  }, [filteredTickets])

  const agentData = useMemo(() => {
    const counts = countBy(filteredTickets.map((t) => t.createdBy.name))
    return Object.entries(counts)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
  }, [filteredTickets])

  const topSubject = subjectData[0]?.label ?? '—'
  const topAgent = agentData[0]?.label ?? '—'
  const topUsers = agentData.slice(0, 5)

  const topEmployeesData = useMemo(() => {
    const counts = countBy(
      filteredTickets
        .filter((t): t is Ticket & { employee: { id: string; name: string } } => t.employee !== null)
        .map((t) => t.employee.name)
    )
    return Object.entries(counts)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  }, [filteredTickets])

  const effectiveFromMonth = useMemo(() => {
    const keys = filteredTickets.map((t) => monthKey(new Date(t.createdAt)))
    return fromMonth || keys.reduce((min, k) => (k < min ? k : min), CURRENT_MONTH)
  }, [filteredTickets, fromMonth])

  const effectiveToMonth = toMonth || CURRENT_MONTH

  const monthlyData = useMemo(() => {
    const range = monthRange(effectiveFromMonth, effectiveToMonth)
    const counts = countBy(filteredTickets.map((t) => monthKey(new Date(t.createdAt))))
    return range.map((k) => ({ label: monthLabel(k), count: counts[k] ?? 0 }))
  }, [filteredTickets, effectiveFromMonth, effectiveToMonth])

  const dailyData = useMemo(() => {
    const [fy, fm] = effectiveFromMonth.split('-').map(Number)
    const startDate = new Date(fy, fm - 1, 1)

    const [ty, tm] = effectiveToMonth.split('-').map(Number)
    const endDate = effectiveToMonth === CURRENT_MONTH ? new Date() : new Date(ty, tm, 0)

    const days = dayRange(startDate, endDate)
    const counts: Record<string, number> = {}
    for (const t of filteredTickets) {
      const key = dayKey(new Date(t.createdAt))
      counts[key] = (counts[key] ?? 0) + 1
    }
    return days.map((d) => ({
      label: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      count: counts[dayKey(d)] ?? 0,
    }))
  }, [filteredTickets, effectiveFromMonth, effectiveToMonth])

  const recentTickets = useMemo(
    () => [...filteredTickets].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 8),
    [filteredTickets]
  )

  function applyPreset(preset: typeof PRESETS[number]) {
    setFromMonth(preset.from)
    setToMonth(preset.to)
  }

  if (loading) {
    return <div className="p-6 text-gray-500">Carregando...</div>
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold">Dashboard</h1>
        <NewTicketDialog onCreated={fetchData} />
      </div>

      <div className="border rounded-lg p-4 flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-gray-700">Período:</span>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => applyPreset(p)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                activePreset === p.key
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 md:ml-auto">
          <Label className="text-xs text-gray-500">De</Label>
          <input
            type="month"
            value={fromMonth}
            max={toMonth || CURRENT_MONTH}
            onChange={(e) => setFromMonth(e.target.value)}
            className="h-8 rounded-md border border-input px-2 text-sm bg-transparent"
          />
          <Label className="text-xs text-gray-500">Até</Label>
          <input
            type="month"
            value={toMonth}
            min={fromMonth}
            max={CURRENT_MONTH}
            onChange={(e) => setToMonth(e.target.value)}
            className="h-8 rounded-md border border-input px-2 text-sm bg-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="border-2 border-primary rounded-lg p-4">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Total de chamados</p>
          <p className="text-3xl font-bold mt-1">{total}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Chamados hoje</p>
          <p className="text-3xl font-bold mt-1">{todayCount}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Assunto mais comum</p>
          <p className="text-lg font-bold mt-1 truncate" title={topSubject}>{topSubject}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Atendente mais ativo</p>
          <p className="text-lg font-bold mt-1 truncate" title={topAgent}>{topAgent}</p>
        </div>
      </div>

      <div className="border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-gray-700">
            Chamados {granularity === 'month' ? 'por mês' : 'por dia'}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setGranularity('month')}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                granularity === 'month'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              Mensal
            </button>
            <button
              type="button"
              onClick={() => setGranularity('day')}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                granularity === 'day'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              Diário
            </button>
          </div>
        </div>
        <AreaChart data={granularity === 'month' ? monthlyData : dailyData} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-4">
          <p className="text-sm font-semibold text-gray-700 mb-3">Chamados por assunto</p>
          {subjectData.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhum chamado no período.</p>
          ) : (
            <HorizontalBars data={subjectData} />
          )}
        </div>

        <div className="border rounded-lg p-4">
          <p className="text-sm font-semibold text-gray-700 mb-3">Chamados por atendente</p>
          {agentData.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhum chamado no período.</p>
          ) : (
            <HorizontalBars data={agentData} />
          )}
        </div>
      </div>

      <div className="border rounded-lg p-4">
        <p className="text-sm font-semibold text-gray-700 mb-3">Top 5 usuários com mais chamados</p>
        {topUsers.length === 0 ? (
          <p className="text-sm text-gray-500">Nenhum chamado no período.</p>
        ) : (
          <table className="w-full text-sm border-separate border-spacing-0 border border-border rounded-lg overflow-hidden">
            <thead className="bg-primary text-primary-foreground uppercase">
              <tr>
                <th className="text-center px-4 py-2 w-16">#</th>
                <th className="text-center px-4 py-2">Usuário</th>
                <th className="text-center px-4 py-2 w-32">Chamados</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {topUsers.map((user, i) => (
                <tr key={user.label} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-center text-gray-400 font-mono">{i + 1}</td>
                  <td className="px-4 py-2 text-center font-medium">{user.label}</td>
                  <td className="px-4 py-2 text-center text-gray-500">{user.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="border rounded-lg p-4">
        <p className="text-sm font-semibold text-gray-700 mb-3">Top 10 funcionários com mais chamados</p>
        {topEmployeesData.length === 0 ? (
          <p className="text-sm text-gray-500">Nenhum chamado no período.</p>
        ) : (
          <table className="w-full text-sm border-separate border-spacing-0 border border-border rounded-lg overflow-hidden">
            <thead className="bg-primary text-primary-foreground uppercase">
              <tr>
                <th className="text-center px-4 py-2 w-16">#</th>
                <th className="text-center px-4 py-2">Funcionário</th>
                <th className="text-center px-4 py-2 w-32">Chamados</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {topEmployeesData.map((employee, i) => (
                <tr key={employee.label} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-center text-gray-400 font-mono">{i + 1}</td>
                  <td className="px-4 py-2 text-center font-medium">{employee.label}</td>
                  <td className="px-4 py-2 text-center text-gray-500">{employee.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="border rounded-lg p-4">
        <p className="text-sm font-semibold text-gray-700 mb-3">Chamados recentes</p>
        {recentTickets.length === 0 ? (
          <p className="text-sm text-gray-500">Nenhum chamado no período.</p>
        ) : (
          <div className="space-y-2">
            {recentTickets.map((ticket) => (
              <div key={ticket.id} className="flex items-center justify-between text-sm gap-2">
                <span className="text-gray-700 truncate">#{ticket.number} - {ticket.title}</span>
                <span className="text-gray-400 text-xs shrink-0">{ticket.subject.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
