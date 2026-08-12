export const COMMENT_INCLUDE = {
  author: { select: { id: true, name: true, role: true } },
  attachments: { select: { id: true, filename: true, size: true } },
} as const
