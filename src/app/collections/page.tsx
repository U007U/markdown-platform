'use client'

import { useState, useEffect } from 'react'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import Link from 'next/link'

interface Collection {
  id: string
  title: string
  description: string | null
  document_count: number
  created_at: string
  username: string
  display_name: string | null
  avatar_url: string | null
}

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCollections()
  }, [])

  const fetchCollections = async () => {
    try {
      const res = await fetch('/api/collections')
      const data = await res.json()
      setCollections(data.collections || [])
    } catch (err) {
      console.error('Failed to fetch collections:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Collections</h1>
          <p className="text-gray-500">Curated sets of documents by topic</p>
        </div>
        <Link href="/collections/new">
          <Button>New Collection</Button>
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : collections.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No collections yet</p>
          <Link href="/collections/new">
            <Button>Create the first collection</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map((collection) => (
            <Link key={collection.id} href={`/collections/${collection.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardBody>
                  <h3 className="font-semibold text-lg mb-1">{collection.title}</h3>
                  {collection.description && (
                    <p className="text-sm text-gray-500 line-clamp-2 mb-3">{collection.description}</p>
                  )}
                  <div className="flex items-center justify-between mt-auto pt-3 border-t">
                    <div className="flex items-center gap-2">
                      <Avatar src={collection.avatar_url || undefined} size="sm" />
                      <span className="text-sm text-gray-600">
                        {collection.display_name || collection.username}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">{collection.document_count} docs</span>
                  </div>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
