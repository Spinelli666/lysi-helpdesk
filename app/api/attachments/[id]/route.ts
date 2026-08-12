import { readFile } from 'fs/promises'
import path from 'path'
import { auth } from '@/app/lib/auth'
import { prisma } from '@/app/lib/prisma'
import { getMimeType, isImageFile } from '@/app/lib/mime'
import { NextResponse } from 'next/server'

const UPLOAD_DIR = path.join(process.cwd(), 'uploads')

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()

  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const attachment = await prisma.attachment.findUnique({ where: { id } })

  if (!attachment) {
    return NextResponse.json({ error: 'Anexo não encontrado' }, { status: 404 })
  }

  const data = await readFile(path.join(UPLOAD_DIR, attachment.url))
  const disposition = isImageFile(attachment.filename) ? 'inline' : 'attachment'

  return new NextResponse(new Uint8Array(data), {
    headers: {
      'Content-Type': getMimeType(attachment.filename),
      'Content-Disposition': `${disposition}; filename="${encodeURIComponent(attachment.filename)}"`,
    },
  })
}
