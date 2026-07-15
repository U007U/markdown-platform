import { NextRequest, NextResponse } from 'next/server'
import { createDB } from '@/lib/db/client'
import { getSessionFromRequest } from '@/lib/auth/middleware'
import { DocumentService } from '@/lib/documents'

export async function POST(
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
    const body = await request.json().catch(() => ({}))

    let result
    if (body.action === 'unpublish') {
      result = await service.unpublishDocument(id, session.userId)
    } else {
      result = await service.publishDocument(id, session.userId)
    }

    if (result.success) {
      return NextResponse.json(result)
    }

    return NextResponse.json(result, { status: 400 })
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
