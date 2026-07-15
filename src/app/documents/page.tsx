'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { DocumentCard } from '@/components/documents/DocumentCard'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import type { Document } from '@/types/database'

type SortOption = 'newest' | 'popular' | 'downloads' | 'featured'

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Most Viewed' },
  { value: 'downloads', label: 'Most Downloaded' },
  { value: 'featured', label: 'Featured' },
]

function DocumentsContent() {
  const searchParams = useSearchParams()
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [sort, setSort] = useState<SortOption>((searchParams.get('sort') as SortOption) || 'newest')
  const [category, setCategory] = useState(searchParams.get('category') || '')
  const [tag, setTag] = useState(searchParams.get('tag') || '')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [categories, setCategories] = useState<{ category: string; count: number }[]>([])
  const [popularTags, setPopularTags] = useState<{ id: string; name: string; slug: string; usage_count: number }[]>([])
  const limit = 12

  useEffect(() => {
    fetchCategories()
    fetchTags()
  }, [])

  useEffect(() => {
    fetchDocuments()
  }, [page, sort, category, tag])

  const fetchDocuments = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        status: 'published',
        visibility: 'public',
        sort,
        limit: String(limit),
        offset: String((page - 1) * limit),
      })
      if (search) params.set('search', search)
      if (category) params.set('category', category)
      if (tag) params.set('tag', tag)

      const res = await fetch(`/api/documents?${params}`)
      const data = await res.json()

      setDocuments(data.documents || [])
      setTotal(data.total || 0)
    } catch (err) {
      console.error('Failed to fetch documents:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories')
      const data = await res.json()
      setCategories(data.categories || [])
    } catch (err) {
      console.error('Failed to fetch categories:', err)
    }
  }

  const fetchTags = async () => {
    try {
      const res = await fetch('/api/tags/popular?limit=15')
      const data = await res.json()
      setPopularTags(data.tags || [])
    } catch (err) {
      console.error('Failed to fetch tags:', err)
    }
  }

  const handleSearch = () => {
    setPage(1)
    fetchDocuments()
  }

  const handleCategoryClick = (cat: string) => {
    setCategory(category === cat ? '' : cat)
    setTag('')
    setPage(1)
  }

  const handleTagClick = (t: string) => {
    setTag(tag === t ? '' : t)
    setCategory('')
    setPage(1)
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Sidebar */}
      <aside className="lg:col-span-1 space-y-6">
        {/* Search */}
        <div>
          <Input
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>

        {/* Sort */}
        <div>
          <h3 className="font-medium text-sm text-gray-700 mb-2">Sort by</h3>
          <div className="space-y-1">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { setSort(opt.value); setPage(1) }}
                className={`block w-full text-left px-3 py-1.5 rounded text-sm ${
                  sort === opt.value
                    ? 'bg-primary text-white'
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Categories */}
        {categories.length > 0 && (
          <div>
            <h3 className="font-medium text-sm text-gray-700 mb-2">Categories</h3>
            <div className="space-y-1">
              {categories.map((cat) => (
                <button
                  key={cat.category}
                  onClick={() => handleCategoryClick(cat.category)}
                  className={`block w-full text-left px-3 py-1.5 rounded text-sm ${
                    category === cat.category
                      ? 'bg-primary text-white'
                      : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  {cat.category} ({cat.count})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {popularTags.length > 0 && (
          <div>
            <h3 className="font-medium text-sm text-gray-700 mb-2">Popular Tags</h3>
            <div className="flex flex-wrap gap-1.5">
              {popularTags.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleTagClick(t.slug)}
                  className={`px-2 py-0.5 rounded-full text-xs ${
                    tag === t.slug
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <a href="/search">
          <Button variant="outline" className="w-full mb-3">Advanced Search</Button>
        </a>
        <a href="/documents/new">
          <Button className="w-full">New Document</Button>
        </a>
      </aside>

      {/* Main Content */}
      <main className="lg:col-span-3">
        {(category || tag) && (
          <div className="mb-4 flex items-center gap-2">
            <span className="text-sm text-gray-500">Filtered by:</span>
            {category && (
              <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-sm">
                {category}
                <button onClick={() => setCategory('')} className="ml-1">&times;</button>
              </span>
            )}
            {tag && (
              <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-sm">
                #{tag}
                <button onClick={() => setTag('')} className="ml-1">&times;</button>
              </span>
            )}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-40 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No documents found</p>
            <a href="/documents/new">
              <Button>Create your first document</Button>
            </a>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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
        )}
      </main>
    </div>
  )
}

function DocumentsLoading() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <aside className="lg:col-span-1 space-y-6">
        <div className="h-10 bg-gray-100 rounded animate-pulse" />
        <div className="h-32 bg-gray-100 rounded animate-pulse" />
        <div className="h-24 bg-gray-100 rounded animate-pulse" />
      </aside>
      <main className="lg:col-span-3">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </main>
    </div>
  )
}

export default function DocumentsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Documents</h1>
        <p className="text-gray-500">Browse and discover markdown documents</p>
      </div>
      <Suspense fallback={<DocumentsLoading />}>
        <DocumentsContent />
      </Suspense>
    </div>
  )
}
