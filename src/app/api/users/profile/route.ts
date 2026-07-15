import { NextRequest, NextResponse } from 'next/server'
import { createDB } from '@/lib/db/client'

export async function GET(request: NextRequest) {
  try {
    const db = createDB()
    const { requireAuth } = await import('@/lib/auth')
    const auth = await requireAuth(request, db)

    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    const user = await db.prepare('SELECT id, email, username, display_name, avatar_url, role, email_verified, bio, website, social_links, created_at FROM users WHERE id = ?').bind(auth.session!.userId).first()

    return NextResponse.json({ success: true, user })
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const db = createDB()
    const { requireAuth, updateProfile } = await import('@/lib/auth')
    const auth = await requireAuth(request, db)

    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    const data = await request.json()
    const result = await updateProfile(auth.session!.userId, data)

    if (result.success) {
      return NextResponse.json(result)
    }

    return NextResponse.json(result, { status: 400 })
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const db = createDB()
    const { requireAuth, deleteAccount } = await import('@/lib/auth')
    const auth = await requireAuth(request, db)

    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    const result = await deleteAccount(auth.session!.userId)
    const response = NextResponse.json(result)

    response.cookies.set('session_id', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    })

    return response
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
