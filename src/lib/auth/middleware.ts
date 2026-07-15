import { type D1Database } from '@cloudflare/workers-types'
import { AuthSessionManager } from './sessions'

export async function getSessionFromRequest(request: Request, db: D1Database) {
  const sessionToken = request.headers.get('Authorization')?.replace('Bearer ', '')

  if (!sessionToken) {
    return null
  }

  const sessionManager = new AuthSessionManager(db)
  return await sessionManager.getSession(sessionToken)
}

export async function requireAuth(request: Request, db: D1Database) {
  const session = await getSessionFromRequest(request, db)

  if (!session) {
    return { error: 'Unauthorized' }
  }

  return { session }
}

export async function requireRole(request: Request, db: D1Database, requiredRole: string) {
  const auth = await requireAuth(request, db)

  if (auth.error) {
    return { error: auth.error }
  }

  const user = await db.prepare('SELECT role FROM users WHERE id = ?').bind(auth.session!.userId).first<{ role: string }>()

  if (!user || user.role !== requiredRole) {
    return { error: 'Forbidden' }
  }

  return { user }
}
