import { NextRequest, NextResponse } from 'next/server'
import { createDB } from '@/lib/db/client'

export async function POST(request: NextRequest) {
  try {
    const db = createDB()
    const { register } = await import('@/lib/auth')
    const data = await request.json()

    const result = await register(data)

    if (result.success) {
      return NextResponse.json(result)
    }

    return NextResponse.json(result, { status: 400 })
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
