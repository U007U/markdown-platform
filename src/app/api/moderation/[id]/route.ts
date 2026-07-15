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

    // Check if user is moderator/admin
    const user = await db
      .prepare('SELECT role FROM users WHERE id = ?')
      .bind(session.userId)
      .first<{ role: string }>()

    if (!user || !['moderator', 'admin'].includes((user as unknown as Record<string, unknown>).role as string)) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const data = await request.json()
    const { status } = data

    if (!['reviewed', 'resolved', 'dismissed'].includes(status)) {
      return NextResponse.json({ success: false, message: 'Invalid status' }, { status: 400 })
    }

    await db
      .prepare('UPDATE reports SET status = ?, reviewed_by = ?, reviewed_at = ? WHERE id = ?')
      .bind(status, session.userId, new Date().toISOString(), id)
      .run()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update report error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
