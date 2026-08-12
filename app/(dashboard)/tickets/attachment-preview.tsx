'use client'

import { formatFileSize, getFileTypeMeta } from './attachment-utils'

export function AttachmentPreview({
  attachment,
}: {
  attachment: { id: string; filename: string; size: number }
}) {
  const meta = getFileTypeMeta(attachment.filename)
  const href = `/api/attachments/${attachment.id}`

  if (meta.isImage) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-fit max-w-xs border rounded-lg overflow-hidden hover:opacity-90"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={href} alt={attachment.filename} className="max-h-64 w-auto object-contain" />
      </a>
    )
  }

  const Icon = meta.icon

  return (
    <a
      href={href}
      className="flex items-center gap-3 w-fit max-w-sm border rounded-lg px-3 py-2 hover:bg-gray-50"
    >
      <span
        className={`shrink-0 w-9 h-9 rounded flex items-center justify-center text-white ${meta.badgeColor}`}
      >
        <Icon size={20} />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-medium text-gray-800 truncate">{attachment.filename}</span>
        <span className="block text-xs text-gray-400">
          {meta.label} · {formatFileSize(attachment.size)}
        </span>
      </span>
    </a>
  )
}
