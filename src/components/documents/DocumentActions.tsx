'use client'

import { useState } from 'react'
import { Heart, Bookmark, Share2, Download } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface DocumentActionsProps {
  documentId: string
  initialLiked?: boolean
  initialLikeCount?: number
  initialBookmarked?: boolean
  className?: string
}

export function DocumentActions({
  documentId,
  initialLiked = false,
  initialLikeCount = 0,
  initialBookmarked = false,
  className,
}: DocumentActionsProps) {
  const [liked, setLiked] = useState(initialLiked)
  const [likeCount, setLikeCount] = useState(initialLikeCount)
  const [bookmarked, setBookmarked] = useState(initialBookmarked)
  const [loading, setLoading] = useState(false)

  const handleLike = async () => {
    if (loading) return
    setLoading(true)
    try {
      if (liked) {
        const res = await fetch(`/api/documents/${documentId}/like`, { method: 'DELETE' })
        const data = await res.json()
        setLiked(false)
        setLikeCount(data.count)
      } else {
        const res = await fetch(`/api/documents/${documentId}/like`, { method: 'POST' })
        const data = await res.json()
        setLiked(true)
        setLikeCount(data.count)
      }
    } catch (err) {
      console.error('Failed to toggle like:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleBookmark = async () => {
    if (loading) return
    setLoading(true)
    try {
      if (bookmarked) {
        await fetch(`/api/documents/${documentId}/bookmark`, { method: 'DELETE' })
        setBookmarked(false)
      } else {
        await fetch(`/api/documents/${documentId}/bookmark`, { method: 'POST' })
        setBookmarked(true)
      }
    } catch (err) {
      console.error('Failed to toggle bookmark:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    try {
      const res = await fetch(`/api/documents/${documentId}/download`, { method: 'POST' })
      if (res.ok) {
        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const a = window.document.createElement('a')
        a.href = url
        a.download = `document.md`
        window.document.body.appendChild(a)
        a.click()
        window.document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch (err) {
      console.error('Failed to download:', err)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: document.title,
        url: window.location.href,
      })
    } else {
      await navigator.clipboard.writeText(window.location.href)
    }
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLike}
        className={cn('gap-1.5', liked && 'text-red-500 hover:text-red-600')}
      >
        <Heart className={cn('h-4 w-4', liked && 'fill-current')} />
        <span>{likeCount}</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleBookmark}
        className={cn(bookmarked && 'text-yellow-500 hover:text-yellow-600')}
      >
        <Bookmark className={cn('h-4 w-4', bookmarked && 'fill-current')} />
      </Button>

      <Button variant="ghost" size="sm" onClick={handleShare}>
        <Share2 className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleDownload}
        className="gap-1.5"
      >
        <Download className="h-4 w-4" />
      </Button>
    </div>
  )
}
