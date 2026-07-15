import { NextRequest, NextResponse } from 'next/server'
import { createDB } from '@/lib/db/client'

export async function POST(request: NextRequest) {
  try {
    const db = createDB()
    const { forgotPassword } = await import('@/lib/auth')
    const data = await request.json()

    const result = await forgotPassword(data.email)

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
