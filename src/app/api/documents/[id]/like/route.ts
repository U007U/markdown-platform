import { NextRequest, NextResponse } from 'next/server'
import { createDB } from '@/lib/db/client'
import { getSessionFromRequest } from '@/lib/auth/middleware'
import { DocumentRepository } from '@/lib/documents/repository'

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

    const repo = new DocumentRepository(db)
    const { id } = await params

    const liked = await repo.likeDocument(session.userId, id)
    const count = await repo.getLikeCount(id)

    return NextResponse.json({ success: true, liked, count })
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

    await repo.unlikeDocument(session.userId, id)
    const count = await repo.getLikeCount(id)

    return NextResponse.json({ success: true, liked: false, count })
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
