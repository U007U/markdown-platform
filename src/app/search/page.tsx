'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { SearchBar } from '@/components/search/SearchBar'
import { DocumentCard } from '@/components/documents/DocumentCard'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import type { Document } from '@/types/database'

type SortOption = 'relevance' | 'newest' | 'popular' | 'downloads'

interface SearchFilters {
  category?: string
  tag?: string
  author?: string
  sort: SortOption
}

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const limit = 12

  const query = searchParams.get('q') || ''
  const [filters, setFilters] = useState<SearchFilters>({
    category: searchParams.get('category') || undefined,
    tag: searchParams.get('tag') || undefined,
    author: searchParams.get('author') || undefined,
    sort: (searchParams.get('sort') as SortOption) || 'relevance',
  })

  useEffect(() => {
    if (query || filters.category || filters.tag || filters.author) {
      searchDocuments()
    } else {
      setDocuments([])
      setTotal(0)
    }
  }, [query, filters, page])

  const searchDocuments = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (query) params.set('q', query)
      if (filters.category) params.set('category', filters.category)
      if (filters.tag) params.set('tag', filters.tag)
      if (filters.author) params.set('author', filters.author)
      params.set('sort', filters.sort)
      params.set('limit', String(limit))
      params.set('offset', String((page - 1) * limit))

      const res = await fetch(`/api/search?${params}`)
      const data = await res.json()

      if (data.success) {
        setDocuments(data.documents || [])
        setTotal(data.total || 0)
      }
    } catch (err) {
      console.error('Search failed:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (q: string) => {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (filters.category) params.set('category', filters.category)
    if (filters.tag) params.set('tag', filters.tag)
    if (filters.author) params.set('author', filters.author)
    params.set('sort', filters.sort)
    router.push(`/search?${params}`)
    setPage(1)
  }

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value || undefined }))
    setPage(1)
  }

  const clearFilters = () => {
    setFilters({ sort: 'relevance' })
    setPage(1)
    if (query) {
      router.push(`/search?q=${encodeURIComponent(query)}`)
    } else {
      router.push('/search')
    }
  }

  const totalPages = Math.ceil(total / limit)
  const hasFilters = filters.category || filters.tag || filters.author

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Filters Sidebar */}
      <aside className="lg:col-span-1 space-y-6">
        {/* Sort */}
        <div>
          <h3 className="font-medium text-sm text-gray-700 mb-2">Sort by</h3>
          <div className="space-y-1">
            {([
              { value: 'relevance', label: 'Relevance' },
              { value: 'newest', label: 'Newest' },
              { value: 'popular', label: 'Most Viewed' },
              { value: 'downloads', label: 'Most Downloaded' },
            ] as const).map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleFilterChange('sort', opt.value)}
                className={`block w-full text-left px-3 py-1.5 rounded text-sm ${
                  filters.sort === opt.value
                    ? 'bg-primary text-white'
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Clear Filters */}
        {hasFilters && (
          <Button variant="outline" size="sm" onClick={clearFilters} className="w-full">
            Clear Filters
          </Button>
        )}
      </aside>

      {/* Results */}
      <main className="lg:col-span-3">
        {/* Active Filters */}
        {(query || hasFilters) && (
          <div className="mb-4 flex items-center gap-2 flex-wrap">
            {query && (
              <span className="text-sm text-gray-500">
                Results for <span className="font-medium">&quot;{query}&quot;</span>
              </span>
            )}
            {filters.category && (
              <Badge variant="secondary">
                {filters.category}
                <button
                  onClick={() => handleFilterChange('category', '')}
                  className="ml-1 hover:text-gray-900"
                >
                  &times;
                </button>
              </Badge>
            )}
            {filters.tag && (
              <Badge variant="secondary">
                #{filters.tag}
                <button
                  onClick={() => handleFilterChange('tag', '')}
                  className="ml-1 hover:text-gray-900"
                >
                  &times;
                </button>
              </Badge>
            )}
            {filters.author && (
              <Badge variant="secondary">
                @{filters.author}
                <button
                  onClick={() => handleFilterChange('author', '')}
                  className="ml-1 hover:text-gray-900"
                >
                  &times;
                </button>
              </Badge>
            )}
            <span className="text-sm text-gray-400">({total} results)</span>
          </div>
        )}

        {/* Results Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-40 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-12">
            {query ? (
              <>
                <p className="text-gray-500 mb-4">No results found for &quot;{query}&quot;</p>
                <p className="text-sm text-gray-400">Try different keywords or filters</p>
              </>
            ) : (
              <p className="text-gray-500">Enter a search query to find documents</p>
            )}
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
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4 text-sm text-gray-500">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                >
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

function SearchLoading() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <aside className="lg:col-span-1 space-y-6">
        <div className="h-32 bg-gray-100 rounded animate-pulse" />
      </aside>
      <main className="lg:col-span-3">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </main>
    </div>
  )
}

export default function SearchPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Search Documents</h1>
        <SearchBar
          placeholder="Search by title, content, or description..."
          className="max-w-2xl"
        />
      </div>
      <Suspense fallback={<SearchLoading />}>
        <SearchContent />
      </Suspense>
    </div>
  )
}
