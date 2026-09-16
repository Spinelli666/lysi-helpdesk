'use client'

import { useState } from 'react'
import { Download as DownloadIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

function firstDayOfMonthISO() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
}

export function ExportTicketsDialog() {
  const [open, setOpen] = useState(false)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState('')

  function openDialog() {
    setFrom(firstDayOfMonthISO())
    setTo(todayISO())
    setError('')
    setOpen(true)
  }

  async function handleExport() {
    if (!from || !to) {
      setError('Selecione as duas datas.')
      return
    }

    setExporting(true)
    setError('')

    const res = await fetch(`/api/tickets/export?from=${from}&to=${to}`)

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Erro ao exportar.')
      setExporting(false)
      return
    }

    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `chamados_${from}_a_${to}.xlsx`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)

    setExporting(false)
    setOpen(false)
  }

  return (
    <>
      <Button type="button" variant="outline" onClick={openDialog}>
        <DownloadIcon size={16} />
        Exportar
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Exportar chamados</DialogTitle>
            <DialogDescription>
              Escolha o intervalo de datas para gerar a planilha.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="space-y-1 flex-1">
                <Label>De</Label>
                <Input type="date" value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} />
              </div>
              <div className="space-y-1 flex-1">
                <Label>Até</Label>
                <Input type="date" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} />
              </div>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleExport} disabled={exporting}>
              {exporting ? 'Exportando...' : 'Exportar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
