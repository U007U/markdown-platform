import { NextRequest, NextResponse } from 'next/server'
import { createDB } from '@/lib/db/client'
import { getSessionFromRequest } from '@/lib/auth/middleware'
import { DocumentRepository } from '@/lib/documents/repository'

export async function GET(request: NextRequest) {
  try {
    const db = createDB()
    const repo = new DocumentRepository(db)
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || undefined

    const collections = await repo.getCollections(userId)
    return NextResponse.json({ success: true, collections })
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

    const repo = new DocumentRepository(db)
    const data = await request.json()

    if (!data.title || data.title.trim().length === 0) {
      return NextResponse.json({ success: false, message: 'Title is required' }, { status: 400 })
    }

    const collection = await repo.createCollection({
      author_id: session.userId,
      title: data.title.trim(),
      description: data.description,
      cover_image_url: data.cover_image_url,
      is_private: data.is_private,
    })

    return NextResponse.json({ success: true, collection }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
