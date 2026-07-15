import { NextRequest, NextResponse } from 'next/server'
import { createDB } from '@/lib/db/client'
import { getSessionFromRequest } from '@/lib/auth/middleware'
import { DocumentService } from '@/lib/documents'
import { withCache } from '@/lib/cache/memory'

export async function GET(request: NextRequest) {
  try {
    const db = createDB()
    const service = new DocumentService(db)

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || undefined
    const visibility = searchParams.get('visibility') || undefined
    const author_id = searchParams.get('author_id') || undefined
    const search = searchParams.get('search') || undefined
    const sort = searchParams.get('sort') || undefined
    const category = searchParams.get('category') || undefined
    const tag = searchParams.get('tag') || undefined
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    // Cache key based on query params
    const cacheKey = `docs:${status}:${visibility}:${author_id}:${search}:${sort}:${category}:${tag}:${limit}:${offset}`

    const result = await withCache(cacheKey, async () => {
      return service.listDocuments({
        status,
        visibility,
        author_id,
        sort,
        category,
        tag,
        limit,
        offset,
        search,
      } as Parameters<typeof service.listDocuments>[0])
    }, 30000) // 30 seconds cache

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    })
  } catch (error) {
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

    const service = new DocumentService(db)
    const data = await request.json()

    const result = await service.createDocument(session.userId, data)

    if (result.success) {
      return NextResponse.json(result, { status: 201 })
    }

    return NextResponse.json(result, { status: 400 })
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
