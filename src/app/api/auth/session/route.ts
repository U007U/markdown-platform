import { NextRequest, NextResponse } from 'next/server'
import { createDB } from '@/lib/db/client'

export async function GET(request: NextRequest) {
  try {
    const db = createDB()
    const { getSessionFromRequest } = await import('@/lib/auth')
    const session = await getSessionFromRequest(request, db)

    if (!session) {
      return NextResponse.json({ authenticated: false, user: null })
    }

    const user = await db.prepare('SELECT id, email, username, display_name, avatar_url, role, email_verified, created_at FROM users WHERE id = ?').bind(session.userId).first()

    if (!user) {
      return NextResponse.json({ authenticated: false, user: null })
    }

    return NextResponse.json({ authenticated: true, user })
  } catch (error) {
    return NextResponse.json({ authenticated: false, user: null })
  }
}
