import { NextRequest, NextResponse } from 'next/server'
import { createDB } from '@/lib/db/client'

export async function GET(request: NextRequest) {
  try {
    const db = createDB()
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q') || ''

    if (q.length < 2) {
      return NextResponse.json({ success: true, suggestions: [] })
    }

    // Get document title suggestions
    const titleResults = await db
      .prepare(
        `SELECT title, slug FROM documents
         WHERE deleted_at IS NULL AND status = 'published'
         AND title LIKE ?
         ORDER BY view_count DESC
         LIMIT 5`
      )
      .bind(`%${q}%`)
      .all()

    // Get tag suggestions
    const tagResults = await db
      .prepare(
        `SELECT name, slug FROM tags
         WHERE name LIKE ?
         ORDER BY usage_count DESC
         LIMIT 3`
      )
      .bind(`%${q}%`)
      .all()

    // Get category suggestions
    const categoryResults = await db
      .prepare(
        `SELECT DISTINCT category FROM documents
         WHERE deleted_at IS NULL AND status = 'published'
         AND category IS NOT NULL AND category LIKE ?
         ORDER BY category
         LIMIT 3`
      )
      .bind(`%${q}%`)
      .all()

    const suggestions = [
      ...titleResults.results.map((r) => ({ type: 'document' as const, title: r.title, slug: r.slug })),
      ...tagResults.results.map((r) => ({ type: 'tag' as const, name: r.name, slug: r.slug })),
      ...categoryResults.results.map((r) => ({ type: 'category' as const, name: r.category })),
    ]

    return NextResponse.json({ success: true, suggestions })
  } catch (error) {
    console.error('Suggestions error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
