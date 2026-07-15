'use client'

import { useState } from 'react'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

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

interface CommentItemProps {
  comment: Comment
  currentUserId?: string
  onReply?: (parentId: string) => void
  onEdit?: (commentId: string, content: string) => void
  onDelete?: (commentId: string) => void
  depth?: number
}

export function CommentItem({
  comment,
  currentUserId,
  onReply,
  onEdit,
  onDelete,
  depth = 0,
}: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [editing, setEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)
  const [submitting, setSubmitting] = useState(false)

  const isOwner = currentUserId === comment.user_id

  const handleReply = async () => {
    if (!replyContent.trim() || submitting) return
    setSubmitting(true)

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: comment.id.split('-')[0], // This needs to be passed from parent
          content: replyContent.trim(),
          parentCommentId: comment.id,
        }),
      })

      if (res.ok) {
        setReplyContent('')
        setShowReplyForm(false)
        onReply?.(comment.id)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = async () => {
    if (!editContent.trim() || submitting) return
    setSubmitting(true)

    try {
      const res = await fetch(`/api/comments/${comment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent.trim() }),
      })

      if (res.ok) {
        setEditing(false)
        onEdit?.(comment.id, editContent.trim())
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this comment?')) return

    const res = await fetch(`/api/comments/${comment.id}`, { method: 'DELETE' })
    if (res.ok) {
      onDelete?.(comment.id)
    }
  }

  return (
    <div className={cn('py-4', depth > 0 && 'ml-8 border-l-2 border-gray-100 pl-4')}>
      <div className="flex items-start gap-3">
        <Avatar src={comment.avatar_url || undefined} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm">
              {comment.display_name || comment.username}
            </span>
            <span className="text-xs text-gray-400">
              {new Date(comment.created_at).toLocaleDateString()}
            </span>
            {comment.updated_at && (
              <span className="text-xs text-gray-400">(edited)</span>
            )}
          </div>

          {editing ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleEdit} disabled={submitting}>
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.content}</p>
          )}

          <div className="flex items-center gap-4 mt-2">
            {currentUserId && !editing && depth < 2 && (
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="text-xs text-gray-500 hover:text-primary"
              >
                Reply
              </button>
            )}
            {isOwner && !editing && (
              <>
                <button
                  onClick={() => setEditing(true)}
                  className="text-xs text-gray-500 hover:text-primary"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="text-xs text-gray-500 hover:text-red-500"
                >
                  Delete
                </button>
              </>
            )}
          </div>

          {showReplyForm && (
            <div className="mt-3 space-y-2">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleReply} disabled={submitting || !replyContent.trim()}>
                  Reply
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowReplyForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Nested replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              currentUserId={currentUserId}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}
