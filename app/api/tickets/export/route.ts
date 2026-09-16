import ExcelJS from 'exceljs'
import { auth } from '@/app/lib/auth'
import { prisma } from '@/app/lib/prisma'
import { NextResponse } from 'next/server'

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

function projectShortLabel(project: string | null | undefined): string {
  if (!project) return ''
  const parts = project.split(' - ')
  return parts.length > 1 ? parts[1].trim() : project
}

export async function GET(req: Request) {
  const session = await auth()

  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  if (!from || !to || !DATE_RE.test(from) || !DATE_RE.test(to)) {
    return NextResponse.json({ error: 'Informe um intervalo de datas válido.' }, { status: 400 })
  }

  const fromDate = new Date(`${from}T00:00:00.000Z`)
  const toDate = new Date(`${to}T23:59:59.999Z`)

  if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime()) || fromDate > toDate) {
    return NextResponse.json({ error: 'Informe um intervalo de datas válido.' }, { status: 400 })
  }

  const tickets = await prisma.ticket.findMany({
    where: { startedAt: { gte: fromDate, lte: toDate } },
    orderBy: { startedAt: 'asc' },
    include: {
      subject: { select: { name: true } },
      employee: { select: { name: true, department: true, project: true } },
      createdBy: { select: { name: true } },
    },
  })

  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('Chamados')

  const centered = { vertical: 'middle' as const, horizontal: 'center' as const }

  sheet.columns = [
    { header: 'Data', key: 'data', width: 12, style: { alignment: centered } },
    { header: 'Horário', key: 'horario', width: 10, style: { alignment: centered } },
    { header: 'Solicitante', key: 'solicitante', width: 32, style: { alignment: centered } },
    { header: 'Categoria', key: 'categoria', width: 20, style: { alignment: centered } },
    { header: 'Atendente inicial', key: 'atendenteInicial', width: 18, style: { alignment: centered } },
    { header: 'Atendente Final', key: 'atendenteFinal', width: 18, style: { alignment: centered } },
    { header: 'Tempo de Atendimento', key: 'tempoAtendimento', width: 18, style: { alignment: centered } },
    { header: 'Status', key: 'status', width: 12, style: { alignment: centered } },
    { header: 'Assunto', key: 'assunto', width: 40, style: { alignment: centered } },
    { header: 'Projeto', key: 'projeto', width: 16, style: { alignment: centered } },
  ]

  const headerRow = sheet.getRow(1)
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } }
    cell.alignment = centered
  })
  headerRow.height = 20

  for (const ticket of tickets) {
    const row = sheet.addRow({
      data: ticket.startedAt,
      horario: ticket.startedAt,
      solicitante: ticket.employee?.name ?? '',
      categoria: ticket.employee?.department ?? '',
      atendenteInicial: ticket.createdBy.name,
      atendenteFinal: ticket.createdBy.name,
      tempoAtendimento: (ticket.endedAt.getTime() - ticket.startedAt.getTime()) / (24 * 60 * 60 * 1000),
      status: 'Resolvido',
      assunto: ticket.subject.name,
      projeto: projectShortLabel(ticket.employee?.project),
    })

    row.getCell('data').numFmt = 'dd/mm/yyyy'
    row.getCell('horario').numFmt = 'hh:mm'
    row.getCell('tempoAtendimento').numFmt = '[h]:mm:ss'
  }

  sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: sheet.columns.length } }

  const buffer = await workbook.xlsx.writeBuffer()

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="chamados_${from}_a_${to}.xlsx"`,
    },
  })
}
