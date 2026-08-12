'use client'

import { useRef, useState } from 'react'
import {
  X as XIcon,
  Plus as PlusIcon,
  Upload as UploadIcon,
  Clock as ClockIcon,
  CaseSensitive as CaseSensitiveIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { RichTextEditor } from '@/components/rich-text-editor'
import { getFileIcon } from './attachment-utils'

export function MessageComposer({
  ticketId,
  recentAttachments,
  onPosted,
  onCancel,
  placeholder,
}: {
  ticketId: string
  recentAttachments: { id: string; filename: string; size: number }[]
  onPosted: () => void | Promise<void>
  onCancel?: () => void
  placeholder?: string
}) {
  const [content, setContent] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [existingAttachments, setExistingAttachments] = useState<{ id: string; filename: string; size: number }[]>([])
  const [posting, setPosting] = useState(false)
  const [error, setError] = useState('')
  const [composerKey, setComposerKey] = useState(0)
  const [showFormatting, setShowFormatting] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handlePost() {
    const hasText = content.replace(/<[^>]*>/g, '').trim().length > 0
    const hasAttachments = files.length > 0 || existingAttachments.length > 0

    if (!hasText && !hasAttachments) {
      setError('Escreva uma anotação ou anexe um arquivo antes de enviar.')
      return
    }

    setPosting(true)
    setError('')

    const formData = new FormData()
    formData.set('content', content)
    for (const file of files) {
      formData.append('file', file)
    }
    for (const attachment of existingAttachments) {
      formData.append('existingAttachmentId', attachment.id)
    }

    const res = await fetch(`/api/tickets/${ticketId}/comments`, {
      method: 'POST',
      body: formData,
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Erro ao enviar anotação.')
      setPosting(false)
      return
    }

    await onPosted()
    setContent('')
    setFiles([])
    setExistingAttachments([])
    setPosting(false)
    setComposerKey((k) => k + 1)
  }

  return (
    <div className="border rounded-lg p-3">
      <RichTextEditor
        key={composerKey}
        value={content}
        onChange={setContent}
        showToolbar={showFormatting}
        placeholder={placeholder}
      />
      {(files.length > 0 || existingAttachments.length > 0) && (
        <div className="flex flex-wrap gap-2 mt-2">
          {files.map((file, index) => {
            const { icon: Icon, color } = getFileIcon(file.name)
            return (
              <span
                key={`file-${index}`}
                className="flex items-center gap-1.5 text-xs bg-gray-100 rounded px-2 py-1"
              >
                <Icon size={14} className={`shrink-0 ${color}`} />
                {file.name}
                <button
                  type="button"
                  onClick={() => setFiles((prev) => prev.filter((_, i) => i !== index))}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XIcon size={12} />
                </button>
              </span>
            )
          })}
          {existingAttachments.map((attachment) => {
            const { icon: Icon, color } = getFileIcon(attachment.filename)
            return (
              <span
                key={`existing-${attachment.id}`}
                className="flex items-center gap-1.5 text-xs bg-gray-100 rounded px-2 py-1"
              >
                <Icon size={14} className={`shrink-0 ${color}`} />
                {attachment.filename}
                <button
                  type="button"
                  onClick={() => setExistingAttachments((prev) => prev.filter((a) => a.id !== attachment.id))}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XIcon size={12} />
                </button>
              </span>
            )
          })}
        </div>
      )}
      {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
      <div className="flex items-center justify-between mt-2 gap-3">
        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                title="Anexar arquivo"
                className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700"
              >
                <PlusIcon size={18} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                <UploadIcon size={16} />
                Fazer upload do computador
              </DropdownMenuItem>
              {recentAttachments.length > 0 && (
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <ClockIcon size={16} />
                    Arquivo recente
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    {recentAttachments.map((attachment) => {
                      const { icon: Icon, color } = getFileIcon(attachment.filename)
                      return (
                        <DropdownMenuItem
                          key={attachment.id}
                          onClick={() =>
                            setExistingAttachments((prev) =>
                              prev.some((a) => a.id === attachment.id) ? prev : [...prev, attachment]
                            )
                          }
                        >
                          <Icon size={16} className={color} />
                          {attachment.filename}
                        </DropdownMenuItem>
                      )
                    })}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => {
              const selected = Array.from(e.target.files ?? [])
              setFiles((prev) => [...prev, ...selected])
              e.target.value = ''
            }}
          />

          <button
            type="button"
            title={showFormatting ? 'Ocultar formatação' : 'Mostrar formatação'}
            onClick={() => setShowFormatting((v) => !v)}
            className={`p-1.5 rounded hover:bg-gray-100 ${showFormatting ? 'text-gray-700 bg-gray-100' : 'text-gray-400'}`}
          >
            <CaseSensitiveIcon size={18} />
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="ml-1 text-xs text-gray-400 hover:text-gray-600"
            >
              Cancelar
            </button>
          )}
        </div>
        <Button onClick={handlePost} disabled={posting}>
          {posting ? 'Enviando...' : 'Adicionar Anotação'}
        </Button>
      </div>
    </div>
  )
}
