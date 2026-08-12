import { auth } from '@/app/lib/auth'
import { prisma } from '@/app/lib/prisma'
import { sanitizeCommentHtml } from '@/app/lib/sanitize-comment'
import { COMMENT_INCLUDE } from '@/app/lib/comment-include'
import { NextResponse } from 'next/server'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  const { id, commentId } = await params
  const session = await auth()

  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const comment = await prisma.comment.findUnique({ where: { id: commentId } })

  if (!comment || comment.ticketId !== id) {
    return NextResponse.json({ error: 'Mensagem não encontrada' }, { status: 404 })
  }

  if (comment.authorId !== session.user.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const body = await req.json()
  const rawContent = body?.content

  if (typeof rawContent !== 'string') {
    return NextResponse.json({ error: 'O comentário não pode ser vazio' }, { status: 400 })
  }

  const content = sanitizeCommentHtml(rawContent)
  const textOnly = content.replace(/<[^>]*>/g, '').trim()

  if (textOnly.length === 0) {
    return NextResponse.json({ error: 'O comentário não pode ser vazio' }, { status: 400 })
  }

  const updated = await prisma.comment.update({
    where: { id: commentId },
    data: { content },
    include: COMMENT_INCLUDE,
  })

  return NextResponse.json(updated)
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  const { id, commentId } = await params
  const session = await auth()

  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const comment = await prisma.comment.findUnique({ where: { id: commentId } })

  if (!comment || comment.ticketId !== id) {
    return NextResponse.json({ error: 'Mensagem não encontrada' }, { status: 404 })
  }

  if (comment.authorId !== session.user.id && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  await prisma.comment.delete({ where: { id: commentId } })

  return NextResponse.json({ success: true })
}
