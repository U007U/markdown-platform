'use client'

import { useState, useEffect } from 'react'
import { CommentItem } from './CommentItem'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'

interface Comment {
  id: string
  content: string
  created_at: string
  updated_at: string | null
  like_count: number
  reply_count: number
  user_id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  replies?: Comment[]
}

interface CommentListProps {
  documentId: string
  currentUserId?: string
}

export function CommentList({ documentId, currentUserId }: CommentListProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchComments()
  }, [documentId])

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/comments?documentId=${documentId}`)
      const data = await res.json()
      if (data.success) {
        setComments(data.comments || [])
      }
    } catch (err) {
      console.error('Failed to fetch comments:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || submitting) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId,
          content: newComment.trim(),
        }),
      })

      if (res.ok) {
        setNewComment('')
        fetchComments()
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleCommentUpdate = () => {
    fetchComments()
  }

  const handleCommentDelete = (commentId: string) => {
    setComments(comments.filter((c) => c.id !== commentId))
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="animate-pulse flex gap-3">
            <div className="h-8 w-8 bg-gray-200 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/4" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Comment form */}
      {currentUserId ? (
        <form onSubmit={handleSubmit} className="flex gap-3">
          <Avatar size="sm" />
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
            <div className="flex justify-end mt-2">
              <Button
                type="submit"
                size="sm"
                disabled={submitting || !newComment.trim()}
              >
                {submitting ? 'Posting...' : 'Post Comment'}
              </Button>
            </div>
          </div>
        </form>
      ) : (
        <p className="text-sm text-gray-500">
          <a href="/auth/login" className="text-primary hover:underline">Sign in</a> to leave a comment
        </p>
      )}

      {/* Comments list */}
      {comments.length === 0 ? (
        <p className="text-center text-gray-500 py-8">No comments yet. Be the first to comment!</p>
      ) : (
        <div className="divide-y">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={currentUserId}
              onReply={handleCommentUpdate}
              onEdit={handleCommentUpdate}
              onDelete={handleCommentDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
