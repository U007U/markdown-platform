'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils'

interface Suggestion {
  type: 'document' | 'tag' | 'category'
  title?: string
  name?: string
  slug?: string
}

interface SearchBarProps {
  defaultValue?: string
  placeholder?: string
  className?: string
  autoFocus?: boolean
  onSearch?: (query: string) => void
}

export function SearchBar({
  defaultValue = '',
  placeholder = 'Search documents...',
  className,
  autoFocus = false,
  onSearch,
}: SearchBarProps) {
  const router = useRouter()
  const [query, setQuery] = useState(defaultValue)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout>(undefined)

  // Load search history from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('search_history')
    if (stored) {
      setHistory(JSON.parse(stored))
    }
  }, [])

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Fetch suggestions with debounce
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([])
      return
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`)
        const data = await res.json()
        if (data.success) {
          setSuggestions(data.suggestions)
        }
      } catch (err) {
        console.error('Failed to fetch suggestions:', err)
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [query])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    // Save to history
    const newHistory = [query, ...history.filter((h) => h !== query)].slice(0, 10)
    setHistory(newHistory)
    localStorage.setItem('search_history', JSON.stringify(newHistory))

    setShowSuggestions(false)

    if (onSearch) {
      onSearch(query)
    } else {
      router.push(`/search?q=${encodeURIComponent(query)}`)
    }
  }

  const handleSuggestionClick = (suggestion: Suggestion) => {
    if (suggestion.type === 'document' && suggestion.slug) {
      router.push(`/documents/${suggestion.slug}`)
    } else if (suggestion.type === 'tag' && suggestion.slug) {
      router.push(`/search?tag=${suggestion.slug}`)
    } else if (suggestion.type === 'category' && suggestion.name) {
      router.push(`/search?category=${encodeURIComponent(suggestion.name)}`)
    }
    setShowSuggestions(false)
  }

  const handleHistoryClick = (term: string) => {
    setQuery(term)
    if (onSearch) {
      onSearch(term)
    } else {
      router.push(`/search?q=${encodeURIComponent(term)}`)
    }
    setShowSuggestions(false)
  }

  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem('search_history')
  }

  const showDropdown = showSuggestions && (suggestions.length > 0 || history.length > 0)

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setShowSuggestions(true)
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder={placeholder}
            autoFocus={autoFocus}
            className="pl-10 pr-10"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('')
                setSuggestions([])
                inputRef.current?.focus()
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </form>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="p-2">
              <p className="text-xs text-gray-400 px-2 py-1">Suggestions</p>
              {suggestions.map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 flex items-center gap-2"
                >
                  <span className="text-gray-400 text-sm">
                    {suggestion.type === 'document' && '📄'}
                    {suggestion.type === 'tag' && '🏷️'}
                    {suggestion.type === 'category' && '📁'}
                  </span>
                  <span className="text-sm">
                    {suggestion.type === 'document' ? suggestion.title : suggestion.name}
                  </span>
                  <span className="text-xs text-gray-400 ml-auto">{suggestion.type}</span>
                </button>
              ))}
            </div>
          )}

          {/* Search History */}
          {history.length > 0 && (
            <div className="p-2 border-t">
              <div className="flex items-center justify-between px-2 py-1">
                <p className="text-xs text-gray-400">Recent searches</p>
                <button
                  onClick={clearHistory}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  Clear
                </button>
              </div>
              {history.slice(0, 5).map((term, i) => (
                <button
                  key={i}
                  onClick={() => handleHistoryClick(term)}
                  className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 flex items-center gap-2"
                >
                  <span className="text-gray-400 text-sm">🕐</span>
                  <span className="text-sm">{term}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
