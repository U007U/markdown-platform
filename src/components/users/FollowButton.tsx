'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface FollowButtonProps {
  userId: string
  currentUserId?: string
  className?: string
}

export function FollowButton({ userId, currentUserId, className }: FollowButtonProps) {
  const [following, setFollowing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [counts, setCounts] = useState({ followers: 0, following: 0 })

  useEffect(() => {
    if (currentUserId && currentUserId !== userId) {
      checkFollowStatus()
    }
    fetchCounts()
  }, [userId, currentUserId])

  const checkFollowStatus = async () => {
    try {
      const res = await fetch(`/api/users/${userId}/follow?type=followers`)
      const data = await res.json()
      if (data.success) {
        setFollowing(data.users.some((u: { id: string }) => u.id === currentUserId))
      }
    } catch (err) {
      console.error('Failed to check follow status:', err)
    }
  }

  const fetchCounts = async () => {
    try {
      const [followersRes, followingRes] = await Promise.all([
        fetch(`/api/users/${userId}/follow?type=followers`),
        fetch(`/api/users/${userId}/follow?type=following`),
      ])
      const [followersData, followingData] = await Promise.all([
        followersRes.json(),
        followingRes.json(),
      ])
      setCounts({
        followers: followersData.users?.length || 0,
        following: followingData.users?.length || 0,
      })
    } catch (err) {
      console.error('Failed to fetch follow counts:', err)
    }
  }

  const handleFollow = async () => {
    if (loading || !currentUserId || currentUserId === userId) return
    setLoading(true)

    try {
      const method = following ? 'DELETE' : 'POST'
      const res = await fetch(`/api/users/${userId}/follow`, { method })
      const data = await res.json()

      if (data.success) {
        setFollowing(data.following)
        setCounts((prev) => ({
          ...prev,
          followers: prev.followers + (data.following ? 1 : -1),
        }))
      }
    } catch (err) {
      console.error('Failed to follow/unfollow:', err)
    } finally {
      setLoading(false)
    }
  }

  // Don't show button for own profile
  if (!currentUserId || currentUserId === userId) {
    return (
      <div className={cn('text-sm text-gray-500', className)}>
        <span>{counts.followers} followers</span>
        <span className="mx-2">·</span>
        <span>{counts.following} following</span>
      </div>
    )
  }

  return (
    <div className={cn('flex items-center gap-4', className)}>
      <Button
        variant={following ? 'outline' : 'primary'}
        size="sm"
        onClick={handleFollow}
        disabled={loading}
      >
        {loading ? '...' : following ? 'Unfollow' : 'Follow'}
      </Button>
      <span className="text-sm text-gray-500">
        {counts.followers} followers
      </span>
    </div>
  )
}
