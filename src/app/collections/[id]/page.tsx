'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { DocumentCard } from '@/components/documents/DocumentCard'
import type { Document } from '@/types/database'

interface Collection {
  id: string
  title: string
  description: string | null
  cover_image_url: string | null
  document_count: number
  created_at: string
  author_id: string
  username: string
  display_name: string | null
  avatar_url: string | null
}

export default function CollectionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [collection, setCollection] = useState<Collection | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [isOwner, setIsOwner] = useState(false)

  useEffect(() => {
    fetchCollection()
  }, [params.id])

  const fetchCollection = async () => {
    try {
      const res = await fetch(`/api/collections/${params.id}`)
      const data = await res.json()

      if (data.success) {
        setCollection(data.collection)
        setDocuments(data.documents || [])

        const sessionRes = await fetch('/api/auth/session')
        const sessionData = await sessionRes.json()
        setIsOwner(sessionData.authenticated && sessionData.user?.id === data.collection.author_id)
      }
    } catch (err) {
      console.error('Failed to fetch collection:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this collection?')) return

    try {
      const res = await fetch(`/api/collections/${params.id}`, { method: 'DELETE' })
      if (res.ok) {
        router.push('/collections')
      }
    } catch (err) {
      console.error('Failed to delete collection:', err)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" />
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-40 bg-gray-100 rounded-lg" />
            ))}
          </div>
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
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{collection.title}</h1>
        {collection.description && (
          <p className="text-gray-500 mb-4">{collection.description}</p>
        )}

        <div className="flex items-center gap-4 mb-4">
          <a href={`/users/${collection.username}`} className="flex items-center gap-2 hover:opacity-80">
            <Avatar src={collection.avatar_url || undefined} size="sm" />
            <span className="text-sm font-medium">{collection.display_name || collection.username}</span>
          </a>
          <span className="text-sm text-gray-400">{collection.document_count} documents</span>
        </div>

        {isOwner && (
          <div className="flex gap-2">
            <a href={`/collections/${collection.id}/edit`}>
              <Button variant="outline" size="sm">Edit</Button>
            </a>
            <Button variant="destructive" size="sm" onClick={handleDelete}>Delete</Button>
          </div>
        )}
      </div>

      {/* Documents */}
      {documents.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">This collection is empty</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <DocumentCard key={doc.id} document={doc} />
          ))}
        </div>
      )}
    </div>
  )
}
