import { mkdir, writeFile } from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'
import { auth } from '@/app/lib/auth'
import { requireAdmin } from '@/app/lib/require-admin'
import { isImageFile } from '@/app/lib/mime'
import { NextResponse } from 'next/server'

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'docs')
const MAX_FILE_SIZE = 20 * 1024 * 1024

export async function POST(req: Request) {
  const session = await auth()

  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const adminError = requireAdmin(session)
  if (adminError) return adminError

  const formData = await req.formData()
  const file = formData.get('file')

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: 'Envie um arquivo de imagem' }, { status: 400 })
  }

  if (!isImageFile(file.name)) {
    return NextResponse.json({ error: 'O arquivo precisa ser uma imagem' }, { status: 400 })
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'A imagem excede o limite de 20 MB' }, { status: 400 })
  }

  await mkdir(UPLOAD_DIR, { recursive: true })

  const diskFilename = `${randomUUID()}${path.extname(file.name)}`
  const bytes = Buffer.from(await file.arrayBuffer())
  await writeFile(path.join(UPLOAD_DIR, diskFilename), bytes)

  return NextResponse.json({ url: `/api/documentation/images/${diskFilename}` })
}
