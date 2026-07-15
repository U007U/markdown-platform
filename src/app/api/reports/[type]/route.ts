import { NextRequest, NextResponse } from 'next/server'
import { createDB } from '@/lib/db/client'
import { getSessionFromRequest } from '@/lib/auth/middleware'

// Ensure reports table exists
async function ensureReportsTable(db: ReturnType<typeof createDB>) {
  try {
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS reports (
        id TEXT PRIMARY KEY,
        reporter_id TEXT NOT NULL,
        target_type TEXT NOT NULL CHECK (target_type IN ('document', 'user', 'comment')),
        target_id TEXT NOT NULL,
        reason TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
        reviewed_by TEXT,
        reviewed_at TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `).run()
  } catch (error) {
    console.error('Error creating reports table:', error)
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const db = createDB()
    await ensureReportsTable(db)

    const session = await getSessionFromRequest(request, db)
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { type } = await params
    if (!['document', 'user', 'comment'].includes(type)) {
      return NextResponse.json({ success: false, message: 'Invalid report type' }, { status: 400 })
    }

    const data = await request.json()
    const { targetId, reason, description } = data

    if (!targetId || !reason) {
      return NextResponse.json({ success: false, message: 'targetId and reason are required' }, { status: 400 })
    }

    // Check for duplicate report
    const existing = await db
      .prepare('SELECT id FROM reports WHERE reporter_id = ? AND target_type = ? AND target_id = ? AND status = ?')
      .bind(session.userId, type, targetId, 'pending')
      .first()

    if (existing) {
      return NextResponse.json({ success: false, message: 'You have already reported this' }, { status: 400 })
    }

    const reportId = crypto.randomUUID()
    await db
      .prepare(
        `INSERT INTO reports (id, reporter_id, target_type, target_id, reason, description, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(reportId, session.userId, type, targetId, reason, description || null, new Date().toISOString())
      .run()

    return NextResponse.json({ success: true, reportId }, { status: 201 })
  } catch (error) {
    console.error('Create report error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const db = createDB()
    await ensureReportsTable(db)

    const session = await getSessionFromRequest(request, db)
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is moderator/admin
    const user = await db
      .prepare('SELECT role FROM users WHERE id = ?')
      .bind(session.userId)
      .first<{ role: string }>()

    if (!user || !['moderator', 'admin'].includes((user as unknown as Record<string, unknown>).role as string)) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'pending'
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    const result = await db
      .prepare(
        `SELECT r.*, u.username as reporter_username
         FROM reports r
         LEFT JOIN users u ON r.reporter_id = u.id
         WHERE r.status = ?
         ORDER BY r.created_at DESC
         LIMIT ? OFFSET ?`
      )
      .bind(status, limit, offset)
      .all()

    const total = await db
      .prepare('SELECT COUNT(*) as count FROM reports WHERE status = ?')
      .bind(status)
      .first<{ count: number }>()

    return NextResponse.json({
      success: true,
      reports: result.results,
      total: (total as unknown as Record<string, unknown>)?.count || 0,
    })
  } catch (error) {
    console.error('Get reports error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
