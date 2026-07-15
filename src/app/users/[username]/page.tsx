'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardBody } from '@/components/ui/Card'
import { DocumentCard } from '@/components/documents/DocumentCard'
import { FollowButton } from '@/components/users/FollowButton'
import type { Document } from '@/types/database'

interface UserProfile {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  website: string | null
  social_links: string | null
  created_at: string
}

interface UserStats {
  total_documents: number
  published: number
  drafts: number
  total_views: number
  total_downloads: number
}

interface Collection {
  id: string
  title: string
  description: string | null
  document_count: number
  created_at: string
}

type Tab = 'published' | 'collections'

export default function UserProfilePage() {
  const params = useParams()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('published')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [currentUserId, setCurrentUserId] = useState<string | undefined>()
  const limit = 12

  useEffect(() => {
    fetchUser()
    fetchCurrentUser()
  }, [params.username])

  useEffect(() => {
    if (user) {
      if (activeTab === 'published') {
        fetchDocuments()
      } else {
        fetchCollections()
      }
    }
  }, [user, activeTab, page])

  const fetchUser = async () => {
    try {
      const res = await fetch(`/api/users/public/${params.username}`)
      const data = await res.json()

      if (data.success) {
        setUser(data.user)
        setStats(data.stats)
      }
    } catch (err) {
      console.error('Failed to fetch user:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch('/api/auth/session')
      const data = await res.json()
      if (data.authenticated && data.user?.id) {
        setCurrentUserId(data.user.id)
      }
    } catch (err) {
      // Not logged in
    }
  }

  const fetchDocuments = async () => {
    try {
      const res = await fetch(
        `/api/documents?author_id=${user?.id}&status=published&visibility=public&limit=${limit}&offset=${(page - 1) * limit}`
      )
      const data = await res.json()
      setDocuments(data.documents || [])
      setTotal(data.total || 0)
    } catch (err) {
      console.error('Failed to fetch documents:', err)
    }
  }

  const fetchCollections = async () => {
    try {
      const res = await fetch(`/api/collections?userId=${user?.id}`)
      const data = await res.json()
      setCollections(data.collections || [])
    } catch (err) {
      console.error('Failed to fetch collections:', err)
    }
  }

  const totalPages = Math.ceil(total / limit)

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-20 w-20 bg-gray-200 rounded-full" />
            <div className="space-y-2">
              <div className="h-6 bg-gray-200 rounded w-48" />
              <div className="h-4 bg-gray-200 rounded w-32" />
            </div>
          </div>
          <div className="h-4 bg-gray-200 rounded w-64 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-40 bg-gray-100 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">User not found</h1>
        <a href="/documents">
          <Button>Browse Documents</Button>
        </a>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Profile Header */}
      <div className="flex items-start gap-6 mb-8">
        <Avatar src={user.avatar_url || undefined} size="xl" />
        <div className="flex-1">
          <h1 className="text-2xl font-bold mb-1">
            {user.display_name || user.username}
          </h1>
          <p className="text-gray-500 mb-3">@{user.username}</p>

          {user.bio && (
            <p className="text-gray-600 mb-3 max-w-xl">{user.bio}</p>
          )}

          <div className="flex items-center gap-4 text-sm text-gray-500">
            {user.website && (
              <a
                href={user.website.startsWith('http') ? user.website : `https://${user.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary"
              >
                {user.website.replace(/^https?:\/\//, '')}
              </a>
            )}
            <span>Member since {new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
          </div>

          <div className="mt-4">
            <FollowButton userId={user.id} currentUserId={currentUserId} />
          </div>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardBody className="text-center py-4">
              <p className="text-2xl font-bold">{stats.total_documents}</p>
              <p className="text-sm text-gray-500">Documents</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center py-4">
              <p className="text-2xl font-bold">{stats.published}</p>
              <p className="text-sm text-gray-500">Published</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center py-4">
              <p className="text-2xl font-bold">{stats.total_views.toLocaleString()}</p>
              <p className="text-sm text-gray-500">Views</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center py-4">
              <p className="text-2xl font-bold">{stats.total_downloads.toLocaleString()}</p>
              <p className="text-sm text-gray-500">Downloads</p>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 border-b mb-6">
        <button
          onClick={() => { setActiveTab('published'); setPage(1) }}
          className={`pb-3 px-1 font-medium text-sm transition-colors ${
            activeTab === 'published'
              ? 'border-b-2 border-primary text-primary'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Published ({stats?.published || 0})
        </button>
        <button
          onClick={() => { setActiveTab('collections'); setPage(1) }}
          className={`pb-3 px-1 font-medium text-sm transition-colors ${
            activeTab === 'collections'
              ? 'border-b-2 border-primary text-primary'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Collections ({collections.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === 'published' ? (
        documents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No published documents yet</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((doc) => (
                <DocumentCard key={doc.id} document={doc} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <Button variant="outline" disabled={page === 1} onClick={() => setPage(page - 1)}>
                  Previous
                </Button>
                <span className="flex items-center px-4 text-sm text-gray-500">
                  Page {page} of {totalPages}
                </span>
                <Button variant="outline" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
                  Next
                </Button>
              </div>
            )}
          </>
        )
      ) : (
        collections.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No public collections yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {collections.map((collection) => (
              <a key={collection.id} href={`/collections/${collection.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardBody>
                    <h3 className="font-semibold text-lg mb-1">{collection.title}</h3>
                    {collection.description && (
                      <p className="text-sm text-gray-500 line-clamp-2 mb-3">{collection.description}</p>
                    )}
                    <p className="text-xs text-gray-400">{collection.document_count} documents</p>
                  </CardBody>
                </Card>
              </a>
            ))}
          </div>
        )
      )}
    </div>
  )
}
