import { NextRequest, NextResponse } from 'next/server'
import { forgotPassword } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const result = await forgotPassword(data.email)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
