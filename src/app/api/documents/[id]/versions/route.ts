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

    const result = await service.getVersions(id)

    if (result.success) {
      return NextResponse.json(result)
    }

    return NextResponse.json(result, { status: 404 })
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}

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
    const data = await request.json()

    const result = await service.saveVersion(id, session.userId, {
      title: data.title,
      content: data.content,
      changelog: data.changelog,
    })

    if (result.success) {
      return NextResponse.json(result, { status: 201 })
    }

    return NextResponse.json(result, { status: 400 })
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
