import { NextRequest, NextResponse } from 'next/server'
import { createDB } from '@/lib/db/client'
import { getSessionFromRequest } from '@/lib/auth/middleware'

// Ensure follows table exists
async function ensureFollowsTable(db: ReturnType<typeof createDB>) {
  try {
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS follows (
        id TEXT PRIMARY KEY,
        follower_id TEXT NOT NULL,
        following_id TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(follower_id, following_id)
      )
    `).run()
  } catch (error) {
    console.error('Error creating follows table:', error)
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = createDB()
    await ensureFollowsTable(db)

    const session = await getSessionFromRequest(request, db)
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Can't follow yourself
    if (session.userId === id) {
      return NextResponse.json({ success: false, message: 'Cannot follow yourself' }, { status: 400 })
    }

    // Check if target user exists
    const targetUser = await db
      .prepare('SELECT id FROM users WHERE id = ?')
      .bind(id)
      .first()
    if (!targetUser) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
    }

    // Check if already following
    const existing = await db
      .prepare('SELECT id FROM follows WHERE follower_id = ? AND following_id = ?')
      .bind(session.userId, id)
      .first()
    if (existing) {
      return NextResponse.json({ success: false, message: 'Already following' }, { status: 400 })
    }

    // Create follow
    const followId = crypto.randomUUID()
    await db
      .prepare('INSERT INTO follows (id, follower_id, following_id, created_at) VALUES (?, ?, ?, ?)')
      .bind(followId, session.userId, id, new Date().toISOString())
      .run()

    return NextResponse.json({ success: true, following: true })
  } catch (error) {
    console.error('Follow error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = createDB()
    await ensureFollowsTable(db)

    const session = await getSessionFromRequest(request, db)
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    await db
      .prepare('DELETE FROM follows WHERE follower_id = ? AND following_id = ?')
      .bind(session.userId, id)
      .run()

    return NextResponse.json({ success: true, following: false })
  } catch (error) {
    console.error('Unfollow error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = createDB()
    await ensureFollowsTable(db)

    const { id } = await params
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'followers'

    if (type === 'followers') {
      const result = await db
        .prepare(
          `SELECT u.id, u.username, u.display_name, u.avatar_url
           FROM follows f
           INNER JOIN users u ON f.follower_id = u.id
           WHERE f.following_id = ?
           ORDER BY f.created_at DESC`
        )
        .bind(id)
        .all()

      return NextResponse.json({ success: true, users: result.results })
    } else {
      const result = await db
        .prepare(
          `SELECT u.id, u.username, u.display_name, u.avatar_url
           FROM follows f
           INNER JOIN users u ON f.following_id = u.id
           WHERE f.follower_id = ?
           ORDER BY f.created_at DESC`
        )
        .bind(id)
        .all()

      return NextResponse.json({ success: true, users: result.results })
    }
  } catch (error) {
    console.error('Get follows error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
