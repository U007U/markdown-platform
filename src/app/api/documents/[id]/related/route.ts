import { NextRequest, NextResponse } from 'next/server'
import { createDB } from '@/lib/db/client'
import { DocumentRepository } from '@/lib/documents/repository'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = createDB()
    const repo = new DocumentRepository(db)
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '5', 10)

    const documents = await repo.getRelatedDocuments(id, limit)
    return NextResponse.json({ success: true, documents })
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
