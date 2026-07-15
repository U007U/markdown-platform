import { NextRequest, NextResponse } from 'next/server'
import { createDB } from '@/lib/db/client'
import { getSessionFromRequest } from '@/lib/auth/middleware'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = createDB()
    const { id } = await params

    // Get the document
    const doc = await db
      .prepare('SELECT id, title, content, download_count FROM documents WHERE id = ? AND deleted_at IS NULL')
      .bind(id)
      .first<{ id: string; title: string; content: string | null; download_count: number }>()

    if (!doc) {
      return NextResponse.json({ success: false, message: 'Document not found' }, { status: 404 })
    }

    // Track the download
    const session = await getSessionFromRequest(request, db)
    const downloadId = crypto.randomUUID()
    const now = new Date().toISOString()

    await db
      .prepare(
        'INSERT INTO downloads (id, user_id, document_id, created_at) VALUES (?, ?, ?, ?)'
      )
      .bind(downloadId, session?.userId || null, id, now)
      .run()

    // Increment download count
    await db
      .prepare('UPDATE documents SET download_count = download_count + 1 WHERE id = ?')
      .bind(id)
      .run()

    // Return the markdown content as a file
    const content = (doc as unknown as Record<string, unknown>).content as string || ''
    const title = (doc as unknown as Record<string, unknown>).title as string

    return new NextResponse(content, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': `attachment; filename="${title.replace(/[^a-zA-Z0-9]/g, '_')}.md"`,
      },
    })
  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
