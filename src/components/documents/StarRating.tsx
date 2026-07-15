'use client'

import { useState, useEffect } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  documentId: string
  currentUserId?: string
  averageRating?: number
  totalRatings?: number
  onRate?: (rating: number) => void
  className?: string
  size?: 'sm' | 'md' | 'lg'
  readonly?: boolean
}

export function StarRating({
  documentId,
  currentUserId,
  averageRating = 0,
  totalRatings = 0,
  onRate,
  className,
  size = 'md',
  readonly = false,
}: StarRatingProps) {
  const [hovered, setHovered] = useState(0)
  const [userRating, setUserRating] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (currentUserId) {
      fetchUserRating()
    }
  }, [documentId, currentUserId])

  const fetchUserRating = async () => {
    try {
      const res = await fetch(`/api/documents/${documentId}/rate`)
      const data = await res.json()
      if (data.success && data.stats) {
        // We need to check if user has rated - this is simplified
        // In production, you'd have a separate endpoint for user's rating
      }
    } catch (err) {
      console.error('Failed to fetch rating:', err)
    }
  }

  const handleRate = async (rating: number) => {
    if (!currentUserId || readonly || loading) return

    setLoading(true)
    try {
      const res = await fetch(`/api/documents/${documentId}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating }),
      })

      if (res.ok) {
        setUserRating(rating)
        onRate?.(rating)
      }
    } finally {
      setLoading(false)
    }
  }

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  }

  const displayRating = hovered || userRating || averageRating

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={readonly || !currentUserId || loading}
            onClick={() => handleRate(star)}
            onMouseEnter={() => !readonly && setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className={cn(
              'transition-colors',
              readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
            )}
          >
            <Star
              className={cn(
                sizeClasses[size],
                star <= displayRating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-gray-200 text-gray-200'
              )}
            />
          </button>
        ))}
      </div>

      {totalRatings > 0 && (
        <span className="text-sm text-gray-500">
          {averageRating.toFixed(1)} ({totalRatings} {totalRatings === 1 ? 'rating' : 'ratings'})
        </span>
      )}
    </div>
  )
}
