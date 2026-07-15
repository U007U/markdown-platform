import { NextRequest, NextResponse } from 'next/server'
import { createDB } from '@/lib/db/client'
import { authLimiter } from '@/lib/security/rateLimit'

export async function POST(request: NextRequest) {
  try {
    const db = createDB()

    // Rate limit by IP
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const limiter = authLimiter(db)
    const { allowed, remaining } = await limiter.check(ip)

    if (!allowed) {
      return NextResponse.json(
        { success: false, message: 'Too many login attempts. Please try again later.' },
        { status: 429, headers: { 'X-RateLimit-Remaining': '0' } }
      )
    }

    const { login } = await import('@/lib/auth')
    const data = await request.json()
    const userAgent = request.headers.get('user-agent') || ''

    const result = await login(data.email, data.password, userAgent, ip)

    if (result.success) {
      const response = NextResponse.json(result)
      if (result.session) {
        response.cookies.set('session_id', result.session.id, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60,
          path: '/',
        })
      }
      return response
    }

    return NextResponse.json(result, { status: 400 })
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
