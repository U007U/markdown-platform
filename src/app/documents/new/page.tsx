'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DocumentForm } from '@/components/documents/DocumentForm'
import { Button } from '@/components/ui/Button'

export default function NewDocumentPage() {
  const router = useRouter()
  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/session')
      const data = await res.json()
      if (data.authenticated) {
        setAuthenticated(true)
      } else {
        router.push('/auth')
      }
    } catch {
      router.push('/auth')
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

  if (!authenticated) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">New Document</h1>
          <Button variant="ghost" onClick={() => router.push('/documents')}>
            Back to documents
          </Button>
        </div>
      </div>

      <DocumentForm mode="create" />
    </div>
  )
}
