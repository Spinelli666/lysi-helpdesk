'use client'

import { useEffect, useState } from 'react'
import {
  Pencil as PencilIcon,
  Plus as PlusIcon,
  Trash2 as TrashIcon,
  ChevronRight,
  ChevronDown,
  MoreVertical,
  FileText,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { RichTextEditor } from '@/components/rich-text-editor'

type Subtopic = {
  id: string
  title: string
  content: string
  updatedAt: string | null
  updatedByName: string | null
}

type Topic = {
  id: string
  title: string
  content: string
  updatedAt: string | null
  updatedByName: string | null
  subtopics: Subtopic[]
}

export function DocumentationView({ isAdmin }: { isAdmin: boolean }) {
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null)
  const [selectedSubtopicId, setSelectedSubtopicId] = useState<string | null>(null)

  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [addingTopic, setAddingTopic] = useState(false)
  const [newTopicTitle, setNewTopicTitle] = useState('')
  const [addingSubtopicFor, setAddingSubtopicFor] = useState<string | null>(null)
  const [newSubtopicTitle, setNewSubtopicTitle] = useState('')
  const [renaming, setRenaming] = useState<{ topicId: string; subtopicId: string | null } | null>(null)
  const [renameValue, setRenameValue] = useState('')

  async function fetchTopics() {
    const res = await fetch('/api/documentation/topics')
    const data: Topic[] = await res.json()
    setTopics(data)
    setLoading(false)
    return data
  }

  useEffect(() => {
    fetchTopics().then((data) => {
      if (data.length > 0) {
        setSelectedTopicId(data[0].id)
        setExpanded(new Set([data[0].id]))
      }
    })
  }, [])

  const selectedTopic = topics.find((t) => t.id === selectedTopicId) ?? null
  const selectedSubtopic = selectedTopic?.subtopics.find((s) => s.id === selectedSubtopicId) ?? null
  const currentNode = selectedSubtopicId ? selectedSubtopic : selectedTopic

  function selectTopic(id: string) {
    setSelectedTopicId(id)
    setSelectedSubtopicId(null)
    setEditing(false)
  }

  function selectSubtopic(topicId: string, subtopicId: string) {
    setSelectedTopicId(topicId)
    setSelectedSubtopicId(subtopicId)
    setEditing(false)
  }

  function toggleExpand(topicId: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(topicId)) next.delete(topicId)
      else next.add(topicId)
      return next
    })
  }

  async function handleCreateTopic() {
    const title = newTopicTitle.trim()
    if (!title) {
      setAddingTopic(false)
      return
    }
    const res = await fetch('/api/documentation/topics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    })
    if (res.ok) {
      const topic = await res.json()
      await fetchTopics()
      setSelectedTopicId(topic.id)
      setSelectedSubtopicId(null)
      setExpanded((prev) => new Set(prev).add(topic.id))
    }
    setNewTopicTitle('')
    setAddingTopic(false)
  }

  async function handleCreateSubtopic(topicId: string) {
    const title = newSubtopicTitle.trim()
    if (!title) {
      setAddingSubtopicFor(null)
      return
    }
    const res = await fetch('/api/documentation/subtopics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topicId, title }),
    })
    if (res.ok) {
      const subtopic = await res.json()
      await fetchTopics()
      setSelectedTopicId(topicId)
      setSelectedSubtopicId(subtopic.id)
    }
    setNewSubtopicTitle('')
    setAddingSubtopicFor(null)
  }

  async function handleRename() {
    if (!renaming) return
    const title = renameValue.trim()
    if (!title) {
      setRenaming(null)
      return
    }
    const url = renaming.subtopicId
      ? `/api/documentation/subtopics/${renaming.subtopicId}`
      : `/api/documentation/topics/${renaming.topicId}`
    await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    })
    setRenaming(null)
    await fetchTopics()
  }

  async function handleDeleteTopic(topicId: string) {
    if (!window.confirm('Excluir este tópico e todos os seus subtópicos?')) return
    await fetch(`/api/documentation/topics/${topicId}`, { method: 'DELETE' })
    const data = await fetchTopics()
    if (selectedTopicId === topicId) {
      if (data.length > 0) {
        setSelectedTopicId(data[0].id)
        setSelectedSubtopicId(null)
      } else {
        setSelectedTopicId(null)
        setSelectedSubtopicId(null)
      }
    }
  }

  async function handleDeleteSubtopic(topicId: string, subtopicId: string) {
    if (!window.confirm('Excluir este subtópico?')) return
    await fetch(`/api/documentation/subtopics/${subtopicId}`, { method: 'DELETE' })
    await fetchTopics()
    if (selectedSubtopicId === subtopicId) {
      setSelectedTopicId(topicId)
      setSelectedSubtopicId(null)
    }
  }

  async function handleUploadImage(file: File) {
    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch('/api/documentation/images', {
      method: 'POST',
      body: formData,
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.error ?? 'Erro ao enviar imagem')

    return data.url as string
  }

  function startEditing() {
    setDraft(currentNode?.content ?? '')
    setError('')
    setEditing(true)
  }

  async function handleSaveContent() {
    if (!selectedTopicId) return
    setSaving(true)
    setError('')

    const url = selectedSubtopicId
      ? `/api/documentation/subtopics/${selectedSubtopicId}`
      : `/api/documentation/topics/${selectedTopicId}`

    const res = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: draft }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Erro ao salvar.')
      setSaving(false)
      return
    }

    await fetchTopics()
    setSaving(false)
    setEditing(false)
  }

  if (loading) {
    return <div className="p-6 text-gray-500">Carregando...</div>
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-heading font-bold mb-6">Documentação</h1>

      <div className="flex gap-6 items-start">
        <aside className="w-72 shrink-0 border rounded-lg p-2">
          <div className="space-y-0.5">
            {topics.map((topic) => (
              <div key={topic.id}>
                <div
                  className={`group flex items-center gap-1 rounded-md px-1.5 py-1.5 text-sm cursor-pointer ${
                    selectedTopicId === topic.id && !selectedSubtopicId
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleExpand(topic.id)}
                    className="shrink-0 text-gray-400 hover:text-gray-600"
                  >
                    {expanded.has(topic.id) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </button>

                  {renaming?.topicId === topic.id && !renaming.subtopicId ? (
                    <Input
                      autoFocus
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRename()
                        if (e.key === 'Escape') setRenaming(null)
                      }}
                      onBlur={handleRename}
                      className="h-7 flex-1 min-w-0 px-1.5 text-sm"
                    />
                  ) : (
                    <span onClick={() => selectTopic(topic.id)} className="flex-1 min-w-0 truncate">
                      {topic.title}
                    </span>
                  )}

                  {isAdmin && !(renaming?.topicId === topic.id && !renaming.subtopicId) && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          onClick={(e) => e.stopPropagation()}
                          className="shrink-0 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-gray-700"
                        >
                          <MoreVertical size={14} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setExpanded((prev) => new Set(prev).add(topic.id))
                            setAddingSubtopicFor(topic.id)
                          }}
                        >
                          <PlusIcon size={14} /> Novo subtópico
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setRenaming({ topicId: topic.id, subtopicId: null })
                            setRenameValue(topic.title)
                          }}
                        >
                          <PencilIcon size={14} /> Renomear
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteTopic(topic.id)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <TrashIcon size={14} /> Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>

                {expanded.has(topic.id) && (
                  <div className="ml-4 pl-2 border-l space-y-0.5">
                    {topic.subtopics.map((sub) => (
                      <div
                        key={sub.id}
                        className={`group flex items-center gap-1 rounded-md px-1.5 py-1.5 text-sm cursor-pointer ${
                          selectedSubtopicId === sub.id
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        <FileText size={13} className="shrink-0 text-gray-400" />

                        {renaming?.subtopicId === sub.id ? (
                          <Input
                            autoFocus
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleRename()
                              if (e.key === 'Escape') setRenaming(null)
                            }}
                            onBlur={handleRename}
                            className="h-7 flex-1 min-w-0 px-1.5 text-sm"
                          />
                        ) : (
                          <span
                            onClick={() => selectSubtopic(topic.id, sub.id)}
                            className="flex-1 min-w-0 truncate"
                          >
                            {sub.title}
                          </span>
                        )}

                        {isAdmin && renaming?.subtopicId !== sub.id && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                type="button"
                                onClick={(e) => e.stopPropagation()}
                                className="shrink-0 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-gray-700"
                              >
                                <MoreVertical size={14} />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setRenaming({ topicId: topic.id, subtopicId: sub.id })
                                  setRenameValue(sub.title)
                                }}
                              >
                                <PencilIcon size={14} /> Renomear
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteSubtopic(topic.id, sub.id)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <TrashIcon size={14} /> Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    ))}

                    {addingSubtopicFor === topic.id && (
                      <Input
                        autoFocus
                        value={newSubtopicTitle}
                        placeholder="Nome do subtópico"
                        onChange={(e) => setNewSubtopicTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleCreateSubtopic(topic.id)
                          if (e.key === 'Escape') setAddingSubtopicFor(null)
                        }}
                        onBlur={() => handleCreateSubtopic(topic.id)}
                        className="h-7 px-1.5 text-sm"
                      />
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {isAdmin && (
            <div className="mt-1 pt-1 border-t">
              {addingTopic ? (
                <Input
                  autoFocus
                  value={newTopicTitle}
                  placeholder="Nome do tópico"
                  onChange={(e) => setNewTopicTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateTopic()
                    if (e.key === 'Escape') setAddingTopic(false)
                  }}
                  onBlur={handleCreateTopic}
                  className="h-7 px-1.5 text-sm mt-1"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setAddingTopic(true)}
                  className="w-full flex items-center gap-1.5 rounded-md px-1.5 py-1.5 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                >
                  <PlusIcon size={14} /> Novo tópico
                </button>
              )}
            </div>
          )}
        </aside>

        <div className="flex-1 min-w-0">
          {!currentNode ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-3">📄</p>
              <p className="font-medium">Nenhum tópico ainda</p>
              {isAdmin && <p className="text-sm mt-1">Clique em &quot;Novo tópico&quot; para começar.</p>}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-heading font-bold">{currentNode.title}</h2>
                  {currentNode.updatedAt && (
                    <p className="text-xs text-gray-400 mt-1">
                      Última atualização em {new Date(currentNode.updatedAt).toLocaleString('pt-BR')}
                      {currentNode.updatedByName && ` por ${currentNode.updatedByName}`}
                    </p>
                  )}
                </div>
                {isAdmin && !editing && (
                  <Button type="button" onClick={startEditing}>
                    <PencilIcon size={16} />
                    Editar
                  </Button>
                )}
              </div>

              {editing ? (
                <div className="space-y-4">
                  <RichTextEditor
                    value={draft}
                    onChange={setDraft}
                    placeholder="Escreva aqui o conteúdo..."
                    onUploadImage={handleUploadImage}
                  />
                  {error && <p className="text-sm text-red-500">{error}</p>}
                  <div className="flex gap-2">
                    <Button type="button" onClick={handleSaveContent} disabled={saving}>
                      {saving ? 'Salvando...' : 'Salvar'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setEditing(false)} disabled={saving}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : !currentNode.content ? (
                <div className="text-center py-16 text-gray-400">
                  <p className="text-4xl mb-3">📄</p>
                  <p className="font-medium">Nenhum conteúdo ainda</p>
                  {isAdmin && <p className="text-sm mt-1">Clique em &quot;Editar&quot; para começar a escrever.</p>}
                </div>
              ) : (
                <div className="border rounded-lg p-4">
                  <div className="tiptap-content text-sm" dangerouslySetInnerHTML={{ __html: currentNode.content }} />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
