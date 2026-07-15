import { NextRequest, NextResponse } from 'next/server'
import { verifyEmail } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const result = await verifyEmail(data.token)

    if (result.success) {
      return NextResponse.json(result)
    }

    return NextResponse.json(result, { status: 400 })
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
