import { NextRequest, NextResponse } from 'next/server'
import { createDB } from '@/lib/db/client'
import { getSessionFromRequest } from '@/lib/auth/middleware'
import { DocumentService } from '@/lib/documents'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = createDB()
    const service = new DocumentService(db)
    const { id } = await params

    const doc = await service.getDocument(id)

    if (!doc) {
      return NextResponse.json({ success: false, message: 'Document not found' }, { status: 404 })
    }

    if (doc.status !== 'published') {
      const session = await getSessionFromRequest(request, db)
      if (!session || session.userId !== doc.author_id) {
        return NextResponse.json({ success: false, message: 'Document not found' }, { status: 404 })
      }
    }

    await service.repository.incrementViewCount(doc.id)

    return NextResponse.json({ success: true, document: doc })
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

    const service = new DocumentService(db)
    const { id } = await params
    const data = await request.json()

    const result = await service.updateDocument(id, session.userId, data)

    if (result.success) {
      return NextResponse.json(result)
    }

    return NextResponse.json(result, { status: 400 })
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

    const service = new DocumentService(db)
    const { id } = await params

    const result = await service.deleteDocument(id, session.userId)

    if (result.success) {
      return NextResponse.json(result)
    }

    return NextResponse.json(result, { status: 400 })
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
