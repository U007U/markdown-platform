import { NextRequest, NextResponse } from 'next/server'
import { createDB } from '@/lib/db/client'
import { getSessionFromRequest } from '@/lib/auth/middleware'

// Ensure ratings table exists
async function ensureRatingsTable(db: ReturnType<typeof createDB>) {
  try {
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS ratings (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        document_id TEXT NOT NULL,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
        UNIQUE(user_id, document_id)
      )
    `).run()
  } catch (error) {
    console.error('Error creating ratings table:', error)
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = createDB()
    await ensureRatingsTable(db)

    const { id } = await params

    // Get average rating and breakdown
    const stats = await db
      .prepare(
        `SELECT
           COUNT(*) as total_ratings,
           COALESCE(AVG(rating), 0) as average_rating,
           SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as rating_5,
           SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as rating_4,
           SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as rating_3,
           SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as rating_2,
           SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as rating_1
         FROM ratings WHERE document_id = ?`
      )
      .bind(id)
      .first()

    return NextResponse.json({ success: true, stats })
  } catch (error) {
    console.error('Get rating error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = createDB()
    await ensureRatingsTable(db)

    const session = await getSessionFromRequest(request, db)
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const data = await request.json()
    const { rating } = data

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ success: false, message: 'Rating must be between 1 and 5' }, { status: 400 })
    }

    // Upsert rating
    const existing = await db
      .prepare('SELECT id FROM ratings WHERE user_id = ? AND document_id = ?')
      .bind(session.userId, id)
      .first()

    if (existing) {
      // Update existing rating
      await db
        .prepare('UPDATE ratings SET rating = ? WHERE user_id = ? AND document_id = ?')
        .bind(rating, session.userId, id)
        .run()
    } else {
      // Create new rating
      const ratingId = crypto.randomUUID()
      await db
        .prepare('INSERT INTO ratings (id, user_id, document_id, rating, created_at) VALUES (?, ?, ?, ?, ?)')
        .bind(ratingId, session.userId, id, rating, new Date().toISOString())
        .run()
    }

    // Get updated stats
    const stats = await db
      .prepare(
        `SELECT
           COUNT(*) as total_ratings,
           COALESCE(AVG(rating), 0) as average_rating
         FROM ratings WHERE document_id = ?`
      )
      .bind(id)
      .first()

    return NextResponse.json({ success: true, stats })
  } catch (error) {
    console.error('Rate error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
