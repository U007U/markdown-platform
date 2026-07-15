'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface Collection {
  id: string
  title: string
  description: string | null
  cover_image_url: string | null
  is_private: boolean
}

export default function EditCollectionPage() {
  const params = useParams()
  const router = useRouter()
  const [collection, setCollection] = useState<Collection | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [coverImageUrl, setCoverImageUrl] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCollection()
  }, [params.id])

  const fetchCollection = async () => {
    try {
      const res = await fetch(`/api/collections/${params.id}`)
      const data = await res.json()

      if (data.success) {
        const c = data.collection
        setCollection(c)
        setTitle(c.title)
        setDescription(c.description || '')
        setCoverImageUrl(c.cover_image_url || '')
        setIsPrivate(!!c.is_private)
      }
    } catch (err) {
      console.error('Failed to fetch collection:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setError('Title is required')
      return
    }

    setSaving(true)
    setError('')

    try {
      const res = await fetch(`/api/collections/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          cover_image_url: coverImageUrl.trim() || undefined,
          is_private: isPrivate,
        }),
      })

      const data = await res.json()

      if (data.success) {
        router.push(`/collections/${params.id}`)
      } else {
        setError(data.message || 'Failed to update collection')
      }
    } catch (err) {
      setError('An error occurred')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-40 bg-gray-100 rounded" />
        </div>
      </div>
    )
  }

  if (!collection) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Collection not found</h1>
        <a href="/collections"><Button>Browse Collections</Button></a>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Edit Collection</h1>

      <Card>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <Input
                placeholder="My Collection"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description (optional)</label>
              <textarea
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="A brief description of this collection..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Cover Image URL (optional)</label>
              <Input
                placeholder="https://..."
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="private"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="private" className="text-sm">Make this collection private</label>
            </div>

            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button variant="outline" type="button" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}
