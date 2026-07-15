import { NextRequest, NextResponse } from 'next/server'
import { createDB } from '@/lib/db/client'
import { getSessionFromRequest } from '@/lib/auth/middleware'
import { DocumentRepository } from '@/lib/documents/repository'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = createDB()
    const repo = new DocumentRepository(db)
    const { id } = await params

    const collection = await repo.getCollectionById(id)
    if (!collection) {
      return NextResponse.json({ success: false, message: 'Collection not found' }, { status: 404 })
    }

    const documents = await repo.getCollectionDocuments(id)
    return NextResponse.json({ success: true, collection, documents })
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}

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

    const repo = new DocumentRepository(db)
    const { id } = await params
    const collection = await repo.getCollectionById(id) as Record<string, unknown> | null

    if (!collection || collection.author_id !== session.userId) {
      return NextResponse.json({ success: false, message: 'Not authorized' }, { status: 403 })
    }

    const data = await request.json()
    const updated = await repo.updateCollection(id, data)
    return NextResponse.json({ success: true, collection: updated })
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = createDB()
    const session = await getSessionFromRequest(request, db)
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const repo = new DocumentRepository(db)
    const { id } = await params
    const collection = await repo.getCollectionById(id) as Record<string, unknown> | null

    if (!collection || collection.author_id !== session.userId) {
      return NextResponse.json({ success: false, message: 'Not authorized' }, { status: 403 })
    }

    await repo.deleteCollection(id)
    return NextResponse.json({ success: true, message: 'Collection deleted' })
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
