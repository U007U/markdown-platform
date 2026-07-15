import { NextRequest, NextResponse } from 'next/server'
import { createDB } from '@/lib/db/client'
import { getSessionFromRequest } from '@/lib/auth/middleware'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = createDB()
    const session = await getSessionFromRequest(request, db)
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const data = await request.json()
    const { content } = data

    if (!content?.trim()) {
      return NextResponse.json({ success: false, message: 'Content is required' }, { status: 400 })
    }

    // Check ownership
    const existing = await db
      .prepare('SELECT user_id FROM comments WHERE id = ?')
      .bind(id)
      .first<{ user_id: string }>()

    if (!existing || (existing as unknown as Record<string, unknown>).user_id !== session.userId) {
      return NextResponse.json({ success: false, message: 'Not authorized' }, { status: 403 })
    }

    await db
      .prepare('UPDATE comments SET content = ?, updated_at = ? WHERE id = ?')
      .bind(content.trim(), new Date().toISOString(), id)
      .run()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update comment error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = createDB()
    const session = await getSessionFromRequest(request, db)
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Check ownership
    const existing = await db
      .prepare('SELECT user_id, parent_comment_id FROM comments WHERE id = ?')
      .bind(id)
      .first<{ user_id: string; parent_comment_id: string | null }>()

    if (!existing || (existing as unknown as Record<string, unknown>).user_id !== session.userId) {
      return NextResponse.json({ success: false, message: 'Not authorized' }, { status: 403 })
    }

    // Soft delete
    await db
      .prepare('UPDATE comments SET deleted_at = ? WHERE id = ?')
      .bind(new Date().toISOString(), id)
      .run()

    // Decrement reply count on parent
    const parentCommentId = (existing as unknown as Record<string, unknown>).parent_comment_id
    if (parentCommentId) {
      await db
        .prepare('UPDATE comments SET reply_count = MAX(0, reply_count - 1) WHERE id = ?')
        .bind(parentCommentId)
        .run()
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete comment error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
