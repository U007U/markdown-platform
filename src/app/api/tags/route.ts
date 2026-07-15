import { NextResponse } from 'next/server'
import { createDB } from '@/lib/db/client'
import { DocumentRepository } from '@/lib/documents/repository'

export async function GET() {
  try {
    const db = createDB()
    const repo = new DocumentRepository(db)
    const tags = await repo.getAllTags()
    return NextResponse.json({ success: true, tags })
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
