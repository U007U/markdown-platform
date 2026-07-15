import { NextRequest, NextResponse } from 'next/server'
import { createDB } from '@/lib/db/client'
import { DocumentRepository } from '@/lib/documents/repository'
import { withCache } from '@/lib/cache/memory'

export async function GET(request: NextRequest) {
  try {
    const db = createDB()
    const repo = new DocumentRepository(db)
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '6')

    const documents = await withCache(`featured:${limit}`, async () => {
      return repo.getFeatured(limit)
    }, 300000) // 5 minutes cache

    return NextResponse.json({ success: true, documents }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    })
  } catch (error) {
    console.error('Featured documents error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
