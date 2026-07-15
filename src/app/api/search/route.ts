import { NextRequest, NextResponse } from 'next/server'
import { createDB } from '@/lib/db/client'
import { DocumentRepository } from '@/lib/documents/repository'

export async function GET(request: NextRequest) {
  try {
    const db = createDB()
    const repo = new DocumentRepository(db)
    const { searchParams } = new URL(request.url)

    const q = searchParams.get('q') || ''
    const category = searchParams.get('category') || undefined
    const tag = searchParams.get('tag') || undefined
    const author = searchParams.get('author') || undefined
    const sort = (searchParams.get('sort') as 'relevance' | 'newest' | 'popular' | 'downloads') || 'relevance'
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    // Build search conditions
    const conditions: string[] = ['d.deleted_at IS NULL', "d.status = 'published'"]
    const bindings: unknown[] = []
    let joinClause = ''

    // Text search - search in title, description, and content
    if (q) {
      conditions.push('(d.title LIKE ? OR d.description LIKE ? OR d.content LIKE ?)')
      bindings.push(`%${q}%`, `%${q}%`, `%${q}%`)
    }

    // Category filter
    if (category) {
      conditions.push('d.category = ?')
      bindings.push(category)
    }

    // Tag filter
    if (tag) {
      joinClause = 'INNER JOIN document_tags dt ON d.id = dt.document_id INNER JOIN tags t ON dt.tag_id = t.id'
      conditions.push('t.slug = ?')
      bindings.push(tag)
    }

    // Author filter (username)
    if (author) {
      joinClause += ' INNER JOIN users u ON d.author_id = u.id'
      conditions.push('u.username = ?')
      bindings.push(author)
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    // Sort options
    let orderBy: string
    if (sort === 'relevance' && q) {
      // Simple relevance: title match > description match > content match
      orderBy = `CASE
        WHEN d.title LIKE ? THEN 1
        WHEN d.description LIKE ? THEN 2
        ELSE 3
      END, d.view_count DESC`
      bindings.push(`%${q}%`, `%${q}%`)
    } else {
      const sortMap: Record<string, string> = {
        newest: 'd.created_at DESC',
        popular: 'd.view_count DESC',
        downloads: 'd.download_count DESC',
        relevance: 'd.view_count DESC',
      }
      orderBy = sortMap[sort] || sortMap.newest
    }

    // Get total count
    const countResult = await db
      .prepare(`SELECT COUNT(*) as count FROM documents d ${joinClause} ${where}`)
      .bind(...bindings)
      .first<{ count: number }>()

    const total = (countResult as unknown as Record<string, unknown>)?.count as number || 0

    // Get documents
    const result = await db
      .prepare(`SELECT d.* FROM documents d ${joinClause} ${where} ORDER BY ${orderBy} LIMIT ? OFFSET ?`)
      .bind(...bindings, limit, offset)
      .all()

    const documents = result.results as unknown as { id: string; title: string; slug: string; description: string | null; category: string | null; view_count: number; created_at: string; author_id: string }[]

    return NextResponse.json({
      success: true,
      documents,
      total,
      query: q,
      filters: { category, tag, author, sort },
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
