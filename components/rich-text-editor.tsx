'use client'

import { useEffect, useRef, useState } from 'react'
import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import ImageExtension from '@tiptap/extension-image'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
import {
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Underline as UnderlineIcon,
  List as ListIcon,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Code as CodeIcon,
  SquareCode as CodeBlockIcon,
  Heading2,
  Heading3,
} from 'lucide-react'

function ToolbarButton({
  onClick,
  active,
  children,
  title,
}: {
  onClick: () => void
  active?: boolean
  children: React.ReactNode
  title: string
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`p-1.5 rounded hover:bg-gray-100 ${active ? 'bg-gray-200 text-gray-900' : 'text-gray-500'}`}
    >
      {children}
    </button>
  )
}

function Toolbar({ editor, onUploadImage }: { editor: Editor; onUploadImage?: (file: File) => Promise<string> }) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !onUploadImage) return

    setUploading(true)
    try {
      const url = await onUploadImage(file)
      editor.chain().focus().setImage({ src: url }).run()
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Erro ao enviar imagem')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex items-center gap-0.5 border-b p-1.5 flex-wrap">
      <ToolbarButton title="Título" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
        <Heading2 size={16} />
      </ToolbarButton>
      <ToolbarButton title="Subtítulo" active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
        <Heading3 size={16} />
      </ToolbarButton>

      <span className="w-px h-5 bg-gray-200 mx-1" />

      <ToolbarButton title="Negrito" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
        <BoldIcon size={16} />
      </ToolbarButton>
      <ToolbarButton title="Itálico" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <ItalicIcon size={16} />
      </ToolbarButton>
      <ToolbarButton title="Sublinhado" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}>
        <UnderlineIcon size={16} />
      </ToolbarButton>

      <span className="w-px h-5 bg-gray-200 mx-1" />

      <ToolbarButton title="Alinhar à esquerda" active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()}>
        <AlignLeft size={16} />
      </ToolbarButton>
      <ToolbarButton title="Centralizar" active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()}>
        <AlignCenter size={16} />
      </ToolbarButton>
      <ToolbarButton title="Alinhar à direita" active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()}>
        <AlignRight size={16} />
      </ToolbarButton>

      <span className="w-px h-5 bg-gray-200 mx-1" />

      <ToolbarButton title="Lista com marcadores" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        <ListIcon size={16} />
      </ToolbarButton>
      <ToolbarButton title="Lista numerada" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        <ListOrdered size={16} />
      </ToolbarButton>

      <span className="w-px h-5 bg-gray-200 mx-1" />

      <ToolbarButton
        title="Link"
        active={editor.isActive('link')}
        onClick={() => {
          const previousUrl = editor.getAttributes('link').href as string | undefined
          const url = window.prompt('Endereço do link:', previousUrl ?? 'https://')
          if (url === null) return
          if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run()
            return
          }
          editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
        }}
      >
        <LinkIcon size={16} />
      </ToolbarButton>
      <ToolbarButton
        title={uploading ? 'Enviando imagem...' : 'Imagem'}
        onClick={() => {
          if (uploading) return
          if (onUploadImage) {
            fileInputRef.current?.click()
            return
          }
          const url = window.prompt('Endereço da imagem:', 'https://')
          if (!url) return
          editor.chain().focus().setImage({ src: url }).run()
        }}
      >
        <ImageIcon size={16} className={uploading ? 'animate-pulse' : undefined} />
      </ToolbarButton>
      {onUploadImage && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelected}
        />
      )}

      <span className="w-px h-5 bg-gray-200 mx-1" />

      <ToolbarButton title="Código" active={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()}>
        <CodeIcon size={16} />
      </ToolbarButton>
      <ToolbarButton title="Bloco de código" active={editor.isActive('codeBlock')} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
        <CodeBlockIcon size={16} />
      </ToolbarButton>
    </div>
  )
}

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  showToolbar = true,
  onReady,
  onUploadImage,
}: {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  showToolbar?: boolean
  onReady?: (editor: Editor) => void
  onUploadImage?: (file: File) => Promise<string>
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
      }),
      ImageExtension,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder: placeholder ?? 'Escreva uma mensagem...' }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  })

  useEffect(() => {
    if (editor) onReady?.(editor)
  }, [editor, onReady])

  if (!editor) return null

  return (
    <div className="tiptap-editor border rounded-lg overflow-hidden">
      {showToolbar && <Toolbar editor={editor} onUploadImage={onUploadImage} />}
      <EditorContent editor={editor} className="tiptap-content px-3 py-2 text-sm" />
    </div>
  )
}
