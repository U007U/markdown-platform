import { type D1Database } from '@cloudflare/workers-types'
import { UserRepository } from './userRepository'
import { AuthSessionManager } from './sessions'
import { generateEmailVerificationToken, generatePasswordResetToken, verifyToken } from './tokens'
import { hashPassword, verifyPassword } from './index'
import type { User } from '@/types/auth'

export class AuthService {
  private userRepository: UserRepository

  constructor(private db: D1Database) {
    this.userRepository = new UserRepository(db)
  }

  async register(input: {
    email: string
    username: string
    password: string
    display_name?: string
  }) {
    const existingEmail = await this.userRepository.findByEmail(input.email)
    if (existingEmail) {
      return { success: false, message: 'Email already registered' }
    }

    const existingUsername = await this.userRepository.findByUsername(input.username)
    if (existingUsername) {
      return { success: false, message: 'Username already taken' }
    }

    const hashedPassword = await hashPassword(input.password)

    const user = await this.userRepository.create({
      email: input.email,
      username: input.username,
      password: hashedPassword,
      display_name: input.display_name,
      role: 'user',
    })

    if (!user) {
      return { success: false, message: 'Failed to create user' }
    }

    await generateEmailVerificationToken((user as unknown as User).id)

    return { success: true, user: user as unknown as User }
  }

  async login(email: string, password: string, userAgent?: string, ip?: string) {
    const isLockedOut = await this.userRepository.isLockedOut(email)
    if (isLockedOut) {
      return { success: false, message: 'Account temporarily locked' }
    }

    const user = await this.userRepository.findByEmail(email) as User | null
    if (!user) {
      await this.userRepository.incrementFailedLoginAttempts(email)
      return { success: false, message: 'Invalid email or password' }
    }

    const isValidPassword = await verifyPassword(password, user.password)
    if (!isValidPassword) {
      await this.userRepository.incrementFailedLoginAttempts(email)
      return { success: false, message: 'Invalid email or password' }
    }

    await this.userRepository.resetFailedLoginAttempts(email)

    const sessionManager = new AuthSessionManager(this.db)
    const session = await sessionManager.createSession(user.id, userAgent, ip)

    return { success: true, user, session }
  }

  async logout(sessionId: string) {
    const sessionManager = new AuthSessionManager(this.db)
    await sessionManager.deleteSession(sessionId)
    return { success: true }
  }

  async forgotPassword(email: string) {
    const user = await this.userRepository.findByEmail(email) as User | null
    if (!user) {
      return { success: true, message: 'If email exists, reset link has been sent' }
    }

    await generatePasswordResetToken(user.id)

    return { success: true, message: 'If email exists, reset link has been sent' }
  }

  async resetPassword(token: string, newPassword: string) {
    const verified = verifyToken(token)
    if (!verified) {
      return { success: false, message: 'Invalid or expired token' }
    }

    const user = await this.userRepository.findById(verified.userId) as User | null
    if (!user) {
      return { success: false, message: 'User not found' }
    }

    const hashedPassword = await hashPassword(newPassword)
    await this.userRepository.updatePassword(user.id, hashedPassword)

    return { success: true, message: 'Password has been reset' }
  }

  async verifyEmail(token: string) {
    const verified = verifyToken(token)
    if (!verified) {
      return { success: false, message: 'Invalid or expired token' }
    }

    const user = await this.userRepository.findById(verified.userId) as User | null
    if (!user) {
      return { success: false, message: 'User not found' }
    }

    await this.userRepository.verifyEmail(user.id)

    return { success: true, message: 'Email has been verified' }
  }

  async updateProfile(userId: string, data: {
    display_name?: string
    bio?: string
    website?: string
    social_links?: string
  }) {
    const user = await this.userRepository.update(userId, data)
    if (!user) {
      return { success: false, message: 'User not found' }
    }

    return { success: true, user }
  }

  async deleteAccount(userId: string) {
    await this.userRepository.delete(userId)
    return { success: true, message: 'Account has been deleted' }
  }

  async isRoleAllowed(userRole: string, requiredRoles: string[]) {
    const roleHierarchy = ['guest', 'user', 'author', 'moderator', 'admin']
    const userLevel = roleHierarchy.indexOf(userRole)
    const requiredLevels = requiredRoles.map((role) => roleHierarchy.indexOf(role))
    return requiredLevels.some((level) => userLevel >= level)
  }
}
