'use client'

import { useEffect, useRef } from 'react'
import { CommentMessage } from './comment-message'
import { MessageComposer } from './message-composer'

export type Comment = {
  id: string
  content: string
  createdAt: string
  updatedAt: string
  author: { id: string; name: string; role: string }
  attachments: { id: string; filename: string; size: number }[]
}

const GROUP_WINDOW_MS = 5 * 60 * 1000

export function TicketConversation({
  ticketId,
  comments,
  onPosted,
}: {
  ticketId: string
  comments: Comment[]
  onPosted: () => void | Promise<void>
}) {
  const commentGroups: { author: Comment['author']; items: Comment[] }[] = []
  for (const comment of comments) {
    const last = commentGroups[commentGroups.length - 1]
    const lastItem = last?.items[last.items.length - 1]
    const sameGroup =
      last &&
      lastItem &&
      last.author.id === comment.author.id &&
      new Date(comment.createdAt).getTime() - new Date(lastItem.createdAt).getTime() < GROUP_WINDOW_MS
    if (sameGroup) {
      last.items.push(comment)
    } else {
      commentGroups.push({ author: comment.author, items: [comment] })
    }
  }

  const recentAttachments: { id: string; filename: string; size: number }[] = []
  {
    const seen = new Set<string>()
    for (let i = comments.length - 1; i >= 0 && recentAttachments.length < 8; i--) {
      for (const attachment of comments[i].attachments) {
        const key = `${attachment.filename}:${attachment.size}`
        if (seen.has(key)) continue
        seen.add(key)
        recentAttachments.push(attachment)
        if (recentAttachments.length >= 8) break
      }
    }
  }

  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [comments.length])

  return (
    <div className="mb-6 border rounded-lg flex flex-col max-h-[85vh] sticky top-6">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 min-h-0">
        {comments.length === 0 ? (
          <p className="text-sm text-gray-400">Nenhuma anotação ainda.</p>
        ) : (
          <div>
            {commentGroups.map((group, groupIndex) => (
              <div key={groupIndex} className={groupIndex > 0 ? 'mt-3' : ''}>
                {group.items.map((comment, itemIndex) => (
                  <CommentMessage
                    key={comment.id}
                    ticketId={ticketId}
                    comment={comment}
                    showHeader={itemIndex === 0}
                    onChanged={onPosted}
                  />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-3 border-t shrink-0">
        <MessageComposer
          ticketId={ticketId}
          recentAttachments={recentAttachments}
          onPosted={onPosted}
        />
      </div>
    </div>
  )
}
