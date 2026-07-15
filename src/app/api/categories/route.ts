import { NextResponse } from 'next/server'
import { createDB } from '@/lib/db/client'
import { DocumentRepository } from '@/lib/documents/repository'

export async function GET() {
  try {
    const db = createDB()
    const repo = new DocumentRepository(db)
    const categories = await repo.getCategories()
    return NextResponse.json({ success: true, categories })
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
