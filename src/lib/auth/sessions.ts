import { type D1Database } from '@cloudflare/workers-types'

export interface AuthSession {
  id: string
  userId: string
  expiresAt: string
  createdAt: string
  userAgent?: string
  ip?: string
}

export class AuthSessionManager {
  constructor(private db: D1Database) {}

  async createSession(userId: string, userAgent?: string, ip?: string): Promise<AuthSession> {
    const id = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    const createdAt = new Date().toISOString()

    await this.db
      .prepare(
        'INSERT INTO sessions (id, user_id, expires_at, created_at, user_agent, ip) VALUES (?, ?, ?, ?, ?, ?)'
      )
      .bind(id, userId, expiresAt, createdAt, userAgent || null, ip || null)
      .run()

    return { id, userId, expiresAt, createdAt, userAgent, ip }
  }

  async getSession(sessionId: string): Promise<AuthSession | null> {
    return this.db
      .prepare('SELECT * FROM sessions WHERE id = ? AND expires_at > ?')
      .bind(sessionId, new Date().toISOString())
      .first<AuthSession>()
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.db
      .prepare('DELETE FROM sessions WHERE id = ?')
      .bind(sessionId)
      .run()
  }

  async deleteAllUserSessions(userId: string): Promise<void> {
    await this.db
      .prepare('DELETE FROM sessions WHERE user_id = ?')
      .bind(userId)
      .run()
  }

  async getActiveSessions(userId: string): Promise<AuthSession[]> {
    const result = await this.db
      .prepare('SELECT * FROM sessions WHERE user_id = ? AND expires_at > ? ORDER BY created_at DESC')
      .bind(userId, new Date().toISOString())
      .all()

    return result.results as unknown as AuthSession[]
  }

  async cleanupExpiredSessions(): Promise<void> {
    await this.db
      .prepare('DELETE FROM sessions WHERE expires_at < ?')
      .bind(new Date().toISOString())
      .run()
  }
}
