import { NextRequest, NextResponse } from 'next/server'
import { createDB } from '@/lib/db/client'
import { getSessionFromRequest } from '@/lib/auth/middleware'
import { commentLimiter } from '@/lib/security/rateLimit'

export async function GET(request: NextRequest) {
  try {
    const db = createDB()
    const { searchParams } = new URL(request.url)
    const documentId = searchParams.get('documentId')

    if (!documentId) {
      return NextResponse.json({ success: false, message: 'documentId is required' }, { status: 400 })
    }

    const result = await db
      .prepare(
        `SELECT c.*, u.username, u.display_name, u.avatar_url
         FROM comments c
         LEFT JOIN users u ON c.user_id = u.id
         WHERE c.document_id = ? AND c.deleted_at IS NULL AND c.parent_comment_id IS NULL
         ORDER BY c.created_at DESC`
      )
      .bind(documentId)
      .all()

    const comments = result.results as unknown as { id: string; content: string; created_at: string; like_count: number; reply_count: number; user_id: string; username: string; display_name: string | null; avatar_url: string | null }[]

    // Fetch replies for each comment
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const repliesResult = await db
          .prepare(
            `SELECT c.*, u.username, u.display_name, u.avatar_url
             FROM comments c
             LEFT JOIN users u ON c.user_id = u.id
             WHERE c.parent_comment_id = ? AND c.deleted_at IS NULL
             ORDER BY c.created_at ASC`
          )
          .bind(comment.id)
          .all()

        return {
          ...comment,
          replies: repliesResult.results,
        }
      })
    )

    return NextResponse.json({ success: true, comments: commentsWithReplies })
  } catch (error) {
    console.error('Get comments error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = createDB()
    const session = await getSessionFromRequest(request, db)
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    // Rate limit by user
    const limiter = commentLimiter(db)
    const { allowed } = await limiter.check(session.userId)
    if (!allowed) {
      return NextResponse.json(
        { success: false, message: 'Too many comments. Please slow down.' },
        { status: 429 }
      )
    }

    const data = await request.json()
    const { documentId, content, parentCommentId } = data

    if (!documentId || !content?.trim()) {
      return NextResponse.json({ success: false, message: 'documentId and content are required' }, { status: 400 })
    }

    if (content.length > 2000) {
      return NextResponse.json({ success: false, message: 'Comment must be under 2000 characters' }, { status: 400 })
    }

    const id = crypto.randomUUID()
    const now = new Date().toISOString()

    await db
      .prepare(
        `INSERT INTO comments (id, document_id, user_id, parent_comment_id, content, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .bind(id, documentId, session.userId, parentCommentId || null, content.trim(), now)
      .run()

    // Update reply count on parent comment
    if (parentCommentId) {
      await db
        .prepare('UPDATE comments SET reply_count = reply_count + 1 WHERE id = ?')
        .bind(parentCommentId)
        .run()
    }

    // Fetch the created comment with user info
    const comment = await db
      .prepare(
        `SELECT c.*, u.username, u.display_name, u.avatar_url
         FROM comments c
         LEFT JOIN users u ON c.user_id = u.id
         WHERE c.id = ?`
      )
      .bind(id)
      .first()

    return NextResponse.json({ success: true, comment }, { status: 201 })
  } catch (error) {
    console.error('Create comment error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
