import { type D1Database } from '@cloudflare/workers-types'
import { hashPassword, verifyPassword } from './index'
import { AuthSessionManager } from './sessions'

export class UserRepository {
  constructor(private db: D1Database) {}

  async findByEmail(email: string) {
    return this.db.prepare('SELECT * FROM users WHERE email = ?').bind(email).first()
  }

  async findByUsername(username: string) {
    return this.db.prepare('SELECT * FROM users WHERE username = ?').bind(username).first()
  }

  async findById(id: string) {
    return this.db.prepare('SELECT * FROM users WHERE id = ?').bind(id).first()
  }

  async create(data: {
    email: string
    username: string
    password: string
    display_name?: string
    avatar_url?: string
    role?: string
  }) {
    const id = crypto.randomUUID()
    const createdAt = new Date().toISOString()

    await this.db
      .prepare(
        'INSERT INTO users (id, email, username, display_name, avatar_url, role, email_verified, created_at) VALUES (?, ?, ?, ?, ?, ?, 0, ?)'
      )
      .bind(id, data.email, data.username, data.display_name || null, data.avatar_url || null, data.role || 'user', createdAt)
      .run()

    return this.findById(id)
  }

  async update(id: string, data: {
    display_name?: string
    bio?: string
    website?: string
    social_links?: string
  }) {
    const updates: string[] = []
    const bindings: any[] = []

    if (data.display_name !== undefined) {
      updates.push('display_name = ?')
      bindings.push(data.display_name)
    }
    if (data.bio !== undefined) {
      updates.push('bio = ?')
      bindings.push(data.bio)
    }
    if (data.website !== undefined) {
      updates.push('website = ?')
      bindings.push(data.website)
    }
    if (data.social_links !== undefined) {
      updates.push('social_links = ?')
      bindings.push(data.social_links)
    }

    if (updates.length > 0) {
      bindings.push(id)
      await this.db.prepare(`UPDATE users SET ${updates.join(', ')}, updated_at = ? WHERE id = ?`).bind(...bindings, new Date().toISOString(), id).run()
    }

    return this.findById(id)
  }

  async updatePassword(userId: string, password: string) {
    await this.db
      .prepare('UPDATE users SET password = ? WHERE id = ?')
      .bind(password, userId)
      .run()
  }

  async verifyEmail(userId: string) {
    await this.db
      .prepare('UPDATE users SET email_verified = 1, updated_at = ? WHERE id = ?')
      .bind(new Date().toISOString(), userId)
      .run()
  }

  async delete(userId: string) {
    await this.db
      .prepare('UPDATE users SET deleted_at = ? WHERE id = ?')
      .bind(new Date().toISOString(), userId)
      .run()
  }

  async incrementFailedLoginAttempts(email: string) {
    const user = await this.findByEmail(email)
    if (!user) return 1

    const attempts = ((user as Record<string, unknown>).failed_login_attempts as number || 0) + 1
    await this.db
      .prepare('UPDATE users SET failed_login_attempts = ?, last_failed_login = ? WHERE email = ?')
      .bind(attempts, new Date().toISOString(), email)
      .run()

    return attempts
  }

  async resetFailedLoginAttempts(email: string) {
    await this.db
      .prepare('UPDATE users SET failed_login_attempts = 0, last_failed_login = NULL WHERE email = ?')
      .bind(email)
      .run()
  }

  async isLockedOut(email: string, maxAttempts: number = 5, lockoutMinutes: number = 15) {
    const user = await this.findByEmail(email) as Record<string, unknown> | null
    if (!user) return false

    const attempts = (user.failed_login_attempts as number) || 0
    if (attempts < maxAttempts) {
      return false
    }

    if (!user.last_failed_login) return false

    const lockoutTime = new Date(user.last_failed_login as string)
    lockoutTime.setMinutes(lockoutTime.getMinutes() + lockoutMinutes)
    return lockoutTime > new Date()
  }
}
