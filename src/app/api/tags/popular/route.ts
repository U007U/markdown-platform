import { NextRequest, NextResponse } from 'next/server'
import { createDB } from '@/lib/db/client'
import { DocumentRepository } from '@/lib/documents/repository'

export async function GET(request: NextRequest) {
  try {
    const db = createDB()
    const repo = new DocumentRepository(db)
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const tags = await repo.getPopularTags(limit)
    return NextResponse.json({ success: true, tags })
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
