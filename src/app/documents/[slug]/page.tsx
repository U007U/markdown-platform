'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { MarkdownRenderer } from '@/components/documents/MarkdownRenderer'
import { VersionHistory } from '@/components/documents/VersionHistory'
import { DocumentActions } from '@/components/documents/DocumentActions'
import { TableOfContents } from '@/components/documents/TableOfContents'
import { DocumentCard } from '@/components/documents/DocumentCard'
import { CommentList } from '@/components/documents/CommentList'
import { StarRating } from '@/components/documents/StarRating'
import { Breadcrumbs } from '@/components/seo/Breadcrumbs'
import { ShareButton } from '@/components/seo/ShareButton'
import { ArticleSchema } from '@/components/seo/StructuredData'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import type { Document } from '@/types/database'

interface AuthorInfo {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
}

export default function DocumentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [document, setDocument] = useState<Document | null>(null)
  const [author, setAuthor] = useState<AuthorInfo | null>(null)
  const [relatedDocs, setRelatedDocs] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [showVersions, setShowVersions] = useState(false)
  const [isOwner, setIsOwner] = useState(false)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [bookmarked, setBookmarked] = useState(false)

  useEffect(() => {
    fetchDocument()
  }, [params.slug])

  const fetchDocument = async () => {
    try {
      const res = await fetch(`/api/documents/${params.slug}`)
      const data = await res.json()

      if (data.success && data.document) {
        setDocument(data.document)
        setLikeCount(data.document.view_count || 0)

        const sessionRes = await fetch('/api/auth/session')
        const sessionData = await sessionRes.json()
        const isAuth = sessionData.authenticated
        setIsOwner(isAuth && sessionData.user?.id === data.document.author_id)

        if (data.document.author_id) {
          fetchAuthor(data.document.author_id)
        }
        fetchRelated(data.document.id)
      }
    } catch (err) {
      console.error('Failed to fetch document:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchAuthor = async (authorId: string) => {
    try {
      const res = await fetch(`/api/users/profile?userId=${authorId}`)
      const data = await res.json()
      if (data.success && data.user) {
        setAuthor(data.user)
      }
    } catch {}
  }

  const fetchRelated = async (docId: string) => {
    try {
      const res = await fetch(`/api/documents/${docId}/related?limit=3`)
      const data = await res.json()
      if (data.success) {
        setRelatedDocs(data.documents || [])
      }
    } catch {}
  }

  const handlePublishToggle = async () => {
    if (!document) return
    const action = document.status === 'published' ? 'unpublish' : 'publish'
    const res = await fetch(`/api/documents/${document.id}/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    })
    const data = await res.json()
    if (data.success) setDocument(data.document)
  }

  const handleRestoreVersion = async (versionId: string) => {
    if (!document) return
    const res = await fetch(`/api/documents/${document.id}/versions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: document.title, content: document.content, changelog: 'Restored from version' }),
    })
    if (res.ok) fetchDocument()
  }

  const handleDelete = async () => {
    if (!document || !confirm('Are you sure you want to delete this document?')) return
    const res = await fetch(`/api/documents/${document.id}`, { method: 'DELETE' })
    if (res.ok) router.push('/documents')
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" />
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-8" />
          <div className="space-y-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!document) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Document not found</h1>
        <a href="/documents"><Button>Browse Documents</Button></a>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Structured Data */}
      {author && (
        <ArticleSchema
          title={document.title}
          description={document.description || document.title}
          url={`/documents/${document.slug}`}
          datePublished={document.created_at}
          dateModified={document.updated_at || undefined}
          author={{
            name: author.display_name || author.username,
            url: `/users/${author.username}`,
          }}
        />
      )}

      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Documents', href: '/documents' },
          { label: document.title },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-8 max-w-6xl mx-auto">
        {/* Main Content */}
        <div>
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{document.title}</h1>
            {document.description && (
              <p className="text-gray-500 mb-4">{document.description}</p>
            )}

            <div className="flex items-center gap-3 text-sm text-gray-400 mb-4">
              <Badge variant={document.status === 'published' ? 'default' : 'warning'}>
                {document.status}
              </Badge>
              {document.category && (
                <a href={`/documents?category=${document.category}`} className="bg-gray-100 px-2 py-0.5 rounded hover:bg-gray-200">
                  {document.category}
                </a>
              )}
              <span>{document.view_count} views</span>
              <span>{document.download_count} downloads</span>
              <span>{new Date(document.created_at).toLocaleDateString()}</span>
            </div>

            {/* Author info */}
            {author && (
              <a href={`/users/${author.username}`} className="flex items-center gap-3 mb-4 hover:opacity-80">
                <Avatar src={author.avatar_url || undefined} size="sm" />
                <div>
                  <p className="text-sm font-medium">{author.display_name || author.username}</p>
                  <p className="text-xs text-gray-400">@{author.username}</p>
                </div>
              </a>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2">
              <DocumentActions
                documentId={document.id}
                initialLiked={liked}
                initialLikeCount={likeCount}
                initialBookmarked={bookmarked}
              />
              <ShareButton
                url={`/documents/${document.slug}`}
                title={document.title}
                description={document.description || undefined}
              />
              <StarRating
                documentId={document.id}
                currentUserId={isOwner ? document.author_id : undefined}
                size="sm"
              />
              {isOwner && (
                <div className="flex gap-2 ml-auto">
                  <Button variant="outline" size="sm" onClick={() => router.push(`/documents/${document.slug}/edit`)}>
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setShowVersions(true)}>
                    Versions
                  </Button>
                  <Button variant="outline" size="sm" onClick={handlePublishToggle}>
                    {document.status === 'published' ? 'Unpublish' : 'Publish'}
                  </Button>
                  <Button variant="destructive" size="sm" onClick={handleDelete}>
                    Delete
                  </Button>
                </div>
              )}
            </div>
          </div>

          <article className="prose prose-slate dark:prose-invert max-w-none">
            <MarkdownRenderer content={document.content || '*No content*'} />
          </article>

          {/* Comments */}
          <div className="mt-12 pt-8 border-t">
            <h2 className="text-xl font-bold mb-4">Comments</h2>
            <CommentList documentId={document.id} currentUserId={isOwner ? document.author_id : undefined} />
          </div>

          {/* Related Documents */}
          {relatedDocs.length > 0 && (
            <div className="mt-12 pt-8 border-t">
              <h2 className="text-xl font-bold mb-4">Related Documents</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {relatedDocs.map((doc) => (
                  <DocumentCard key={doc.id} document={doc} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Table of Contents */}
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <TableOfContents content={document.content || ''} />
          </div>
        </aside>
      </div>

      <VersionHistory
        documentId={document.id}
        open={showVersions}
        onOpenChange={setShowVersions}
        onRestore={handleRestoreVersion}
      />
    </div>
  )
}
