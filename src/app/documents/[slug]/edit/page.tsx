'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DocumentForm } from '@/components/documents/DocumentForm'
import { Button } from '@/components/ui/Button'
import type { Document } from '@/types/database'

export default function EditDocumentPage() {
  const params = useParams()
  const router = useRouter()
  const [document, setDocument] = useState<Document | null>(null)
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    fetchDocument()
  }, [params.slug])

  const fetchDocument = async () => {
    try {
      const res = await fetch(`/api/documents/${params.slug}`)
      const data = await res.json()

      if (data.success && data.document) {
        const sessionRes = await fetch('/api/auth/session')
        const sessionData = await sessionRes.json()

        if (sessionData.authenticated && sessionData.user?.id === data.document.author_id) {
          setDocument(data.document)
          setAuthorized(true)
        } else {
          router.push(`/documents/${params.slug}`)
        }
      } else {
        router.push('/documents')
      }
    } catch (err) {
      console.error('Failed to fetch document:', err)
      router.push('/documents')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-8" />
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!authorized || !document) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Edit Document</h1>
          <Button variant="ghost" onClick={() => router.push(`/documents/${document.slug}`)}>
            Back to document
          </Button>
        </div>
      </div>

      <DocumentForm
        initialData={{
          title: document.title,
          description: document.description || '',
          content: document.content || '',
          category: document.category || '',
          visibility: document.visibility,
        }}
        documentId={document.id}
        mode="edit"
      />
    </div>
  )
}
