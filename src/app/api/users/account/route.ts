import { NextRequest, NextResponse } from 'next/server'
import { createDB } from '@/lib/db/client'
import { getSessionFromRequest } from '@/lib/auth/middleware'
import { AuthSessionManager } from '@/lib/auth/sessions'
import { UserRepository } from '@/lib/auth/userRepository'

export async function DELETE(request: NextRequest) {
  try {
    const db = createDB()
    const session = await getSessionFromRequest(request, db)

    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const userId = session.userId
    const sessionManager = new AuthSessionManager(db)
    const userRepository = new UserRepository(db)

    await sessionManager.deleteAllUserSessions(userId)
    await userRepository.delete(userId)

    const response = NextResponse.json({
      success: true,
      message: 'Account deleted successfully',
    })

    response.cookies.set('session_id', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Delete account error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
