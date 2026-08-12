import { mkdir, writeFile } from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'
import { auth } from '@/app/lib/auth'
import { prisma } from '@/app/lib/prisma'
import { sanitizeCommentHtml } from '@/app/lib/sanitize-comment'
import { COMMENT_INCLUDE } from '@/app/lib/comment-include'
import { NextResponse } from 'next/server'

const UPLOAD_DIR = path.join(process.cwd(), 'uploads')
const MAX_FILE_SIZE = 10 * 1024 * 1024

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()

  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const ticket = await prisma.ticket.findUnique({ where: { id } })

  if (!ticket) {
    return NextResponse.json({ error: 'Chamado não encontrado' }, { status: 404 })
  }

  const comments = await prisma.comment.findMany({
    where: { ticketId: id },
    orderBy: { createdAt: 'asc' },
    include: COMMENT_INCLUDE,
  })

  return NextResponse.json(comments)
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()

  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const ticket = await prisma.ticket.findUnique({ where: { id } })

  if (!ticket) {
    return NextResponse.json({ error: 'Chamado não encontrado' }, { status: 404 })
  }

  const formData = await req.formData()
  const rawContent = formData.get('content')
  const files = formData.getAll('file').filter((f): f is File => f instanceof File && f.size > 0)
  const existingAttachmentIds = formData.getAll('existingAttachmentId').filter((v): v is string => typeof v === 'string')

  if (typeof rawContent !== 'string') {
    return NextResponse.json({ error: 'A anotação não pode ficar vazia' }, { status: 400 })
  }

  const content = sanitizeCommentHtml(rawContent)
  const textOnly = content.replace(/<[^>]*>/g, '').trim()

  if (textOnly.length === 0 && files.length === 0 && existingAttachmentIds.length === 0) {
    return NextResponse.json({ error: 'A anotação não pode ficar vazia' }, { status: 400 })
  }

  const oversized = files.find((f) => f.size > MAX_FILE_SIZE)
  if (oversized) {
    return NextResponse.json({ error: `O anexo "${oversized.name}" excede o limite de 10 MB` }, { status: 400 })
  }

  const comment = await prisma.comment.create({
    data: {
      ticketId: id,
      authorId: session.user.id,
      content,
    },
  })

  if (files.length > 0) {
    await mkdir(UPLOAD_DIR, { recursive: true })

    for (const file of files) {
      const bytes = Buffer.from(await file.arrayBuffer())
      const diskFilename = `${randomUUID()}${path.extname(file.name)}`

      await writeFile(path.join(UPLOAD_DIR, diskFilename), bytes)

      await prisma.attachment.create({
        data: {
          ticketId: id,
          commentId: comment.id,
          filename: file.name,
          url: diskFilename,
          size: file.size,
        },
      })
    }
  }

  if (existingAttachmentIds.length > 0) {
    const reusedAttachments = await prisma.attachment.findMany({
      where: { id: { in: existingAttachmentIds }, ticketId: id },
    })

    for (const attachment of reusedAttachments) {
      await prisma.attachment.create({
        data: {
          ticketId: id,
          commentId: comment.id,
          filename: attachment.filename,
          url: attachment.url,
          size: attachment.size,
        },
      })
    }
  }

  const commentWithAttachments = await prisma.comment.findUnique({
    where: { id: comment.id },
    include: COMMENT_INCLUDE,
  })

  return NextResponse.json(commentWithAttachments, { status: 201 })
}
