'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MarkdownEditor } from './MarkdownEditor'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface DocumentFormData {
  title: string
  description: string
  content: string
  category: string
  visibility: 'public' | 'unlisted' | 'private'
}

interface DocumentFormProps {
  initialData?: Partial<DocumentFormData>
  documentId?: string
  mode?: 'create' | 'edit'
}

export function DocumentForm({ initialData, documentId, mode = 'create' }: DocumentFormProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState<DocumentFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    content: initialData?.content || '',
    category: initialData?.category || '',
    visibility: initialData?.visibility || 'public',
  })

  const handleSaveDraft = async () => {
    if (!formData.title.trim()) {
      setError('Title is required')
      return
    }

    setSaving(true)
    setError('')

    try {
      const url = mode === 'edit' ? `/api/documents/${documentId}` : '/api/documents'
      const method = mode === 'edit' ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Failed to save')
        return
      }

      setSuccess('Draft saved!')
      setTimeout(() => setSuccess(''), 2000)

      if (mode === 'create' && data.document) {
        router.push(`/documents/${data.document.slug}/edit`)
      }
    } catch {
      setError('Network error')
    } finally {
      setSaving(false)
    }
  }

  const handlePublish = async () => {
    if (!formData.title.trim()) {
      setError('Title is required')
      return
    }

    setPublishing(true)
    setError('')

    try {
      let docId = documentId

      if (mode === 'create' || !docId) {
        const res = await fetch('/api/documents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
        const data = await res.json()
        if (!res.ok) {
          setError(data.message || 'Failed to create')
          return
        }
        docId = data.document.id
      }

      const publishRes = await fetch(`/api/documents/${docId}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const publishData = await publishRes.json()

      if (!publishRes.ok) {
        setError(publishData.message || 'Failed to publish')
        return
      }

      router.push(`/documents/${publishData.document.slug}`)
      router.refresh()
    } catch {
      setError('Network error')
    } finally {
      setPublishing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium">
          Title *
        </label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Document title"
          maxLength={200}
        />
        <p className="text-xs text-gray-400">{formData.title.length}/200</p>
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">
          Description
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Brief description of the document"
          className="w-full h-20 p-2 border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="category" className="text-sm font-medium">
            Category
          </label>
          <Input
            id="category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            placeholder="e.g., Tutorial, Guide, Reference"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="visibility" className="text-sm font-medium">
            Visibility
          </label>
          <select
            id="visibility"
            value={formData.visibility}
            onChange={(e) => setFormData({ ...formData, visibility: e.target.value as DocumentFormData['visibility'] })}
            className="w-full h-10 px-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="public">Public</option>
            <option value="unlisted">Unlisted</option>
            <option value="private">Private</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Content *</label>
        <MarkdownEditor
          value={formData.content}
          onChange={(content) => setFormData({ ...formData, content })}
          placeholder="Write your document in Markdown..."
        />
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
      )}

      {success && (
        <div className="p-3 bg-green-50 text-green-600 rounded-lg text-sm">{success}</div>
      )}

      <div className="flex gap-3">
        <Button
          variant="secondary"
          onClick={handleSaveDraft}
          disabled={saving || publishing}
        >
          {saving ? 'Saving...' : 'Save Draft'}
        </Button>
        <Button
          onClick={handlePublish}
          disabled={saving || publishing}
        >
          {publishing ? 'Publishing...' : 'Publish'}
        </Button>
      </div>
    </div>
  )
}
