import { readFile } from 'fs/promises'
import path from 'path'
import { auth } from '@/app/lib/auth'
import { getMimeType } from '@/app/lib/mime'
import { NextResponse } from 'next/server'

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'docs')

export async function GET(
  req: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params
  const session = await auth()

  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const safeName = path.basename(filename)

  try {
    const data = await readFile(path.join(UPLOAD_DIR, safeName))

    return new NextResponse(new Uint8Array(data), {
      headers: {
        'Content-Type': getMimeType(safeName),
        'Content-Disposition': 'inline',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Imagem não encontrada' }, { status: 404 })
  }
}
