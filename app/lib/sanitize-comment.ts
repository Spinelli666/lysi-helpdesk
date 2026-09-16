import DOMPurify from 'isomorphic-dompurify'

const SANITIZE_CONFIG = {
  ALLOWED_TAGS: ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'ul', 'ol', 'li', 'a', 'img', 'blockquote', 'code', 'pre', 'h2', 'h3', 'hr'],
  ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'style'],
}

// Tiptap's TextAlign only ever sets `text-align` on the style attribute; drop anything else
// a client might try to smuggle in through that attribute.
DOMPurify.addHook('uponSanitizeAttribute', (_node, data) => {
  if (data.attrName === 'style') {
    const match = /text-align:\s*(left|center|right|justify)/.exec(data.attrValue)
    data.attrValue = match ? `text-align: ${match[1]}` : ''
  }
})

export function sanitizeCommentHtml(html: string) {
  return DOMPurify.sanitize(html, SANITIZE_CONFIG)
}
