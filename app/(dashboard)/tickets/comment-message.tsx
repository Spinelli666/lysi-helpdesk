'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import {
  UserCircle,
  MoreHorizontal as MoreHorizontalIcon,
  Pencil as PencilIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { RichTextEditor } from '@/components/rich-text-editor'
import { AttachmentPreview } from './attachment-preview'
import type { Comment } from './ticket-conversation'

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function formatDateTime(value: string) {
  const date = new Date(value)
  return `${date.toLocaleDateString('pt-BR')} às ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
}

export function CommentMessage({
  ticketId,
  comment,
  showHeader,
  onChanged,
}: {
  ticketId: string
  comment: Comment
  showHeader: boolean
  onChanged: () => void | Promise<void>
}) {
  const { data: session } = useSession()
  const currentUserId = session?.user?.id
  const isAuthor = comment.author.id === currentUserId

  const [moreMenuOpen, setMoreMenuOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)
  const [savingEdit, setSavingEdit] = useState(false)
  const [editError, setEditError] = useState('')

  function handleStartEdit() {
    setEditContent(comment.content)
    setEditError('')
    setIsEditing(true)
  }

  async function handleSaveEdit() {
    if (editContent.replace(/<[^>]*>/g, '').trim().length === 0) {
      setEditError('A anotação não pode ficar vazia.')
      return
    }

    setSavingEdit(true)
    setEditError('')

    const res = await fetch(`/api/tickets/${ticketId}/comments/${comment.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: editContent }),
    })

    if (!res.ok) {
      const data = await res.json()
      setEditError(data.error ?? 'Erro ao editar anotação.')
      setSavingEdit(false)
      return
    }

    await onChanged()
    setSavingEdit(false)
    setIsEditing(false)
  }

  return (
    <div
      id={`comment-${comment.id}`}
      className="group relative flex gap-3 px-2 py-1 rounded transition-colors hover:bg-gray-200/70"
    >
      <div className="w-9 shrink-0 flex items-start justify-center">
        {showHeader ? (
          <UserCircle size={36} className="text-gray-300" />
        ) : (
          <span className="hidden group-hover:block text-[10px] text-gray-400 mt-1">
            {formatTime(comment.createdAt)}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        {showHeader && (
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900 text-sm">{comment.author.name}</span>
            {comment.author.role === 'SUPPORT' && (
              <span className="text-xs text-gray-400">Atendente</span>
            )}
            <span className="text-xs text-gray-400">{formatDateTime(comment.createdAt)}</span>
          </div>
        )}

        {isEditing ? (
          <div className="mt-1">
            <RichTextEditor value={editContent} onChange={setEditContent} />
            {editError && <p className="text-sm text-red-500 mt-1">{editError}</p>}
            <div className="flex gap-2 mt-1.5">
              <Button size="sm" onClick={handleSaveEdit} disabled={savingEdit}>
                {savingEdit ? 'Salvando...' : 'Salvar'}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div
              className="tiptap-content text-gray-800 text-sm"
              dangerouslySetInnerHTML={{ __html: comment.content }}
            />
            {comment.updatedAt !== comment.createdAt && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-[10px] text-gray-400 cursor-default">(editado)</span>
                </TooltipTrigger>
                <TooltipContent>{formatDateTime(comment.updatedAt)}</TooltipContent>
              </Tooltip>
            )}
            {comment.attachments.length > 0 && (
              <div className="mt-1.5 flex flex-col gap-2">
                {comment.attachments.map((attachment) => (
                  <AttachmentPreview key={attachment.id} attachment={attachment} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {!isEditing && isAuthor && (
        <div
          className={`flex items-center gap-0.5 absolute -top-3 right-2 bg-white border rounded shadow-sm px-1 py-0.5 transition-opacity ${
            moreMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto'
          }`}
        >
          <DropdownMenu onOpenChange={setMoreMenuOpen}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                title="Mais opções"
                className="p-1 rounded text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              >
                <MoreHorizontalIcon size={14} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleStartEdit}>
                <PencilIcon size={16} />
                Editar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  )
}
