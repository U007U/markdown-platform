export { hashPassword, verifyPassword } from './password'
export { generateToken, generateEmailVerificationToken, generatePasswordResetToken, verifyToken, hashToken } from './tokens'
export { AuthSessionManager } from './sessions'
export { UserRepository } from './userRepository'
export { AuthService } from './authService'
export { getSessionFromRequest, requireAuth, requireRole } from './middleware'

import { createDB } from '../db/client'
import { AuthService } from './authService'
import { UserRepository } from './userRepository'
import { AuthSessionManager } from './sessions'
import { verifyToken } from './tokens'

function getAuthService() {
  const db = createDB()
  return new AuthService(db)
}

export async function register(input: {
  email: string
  username: string
  password: string
  display_name?: string
}) {
  return getAuthService().register(input)
}

export async function login(email: string, password: string, userAgent?: string, ip?: string) {
  return getAuthService().login(email, password, userAgent, ip)
}

export async function logout(sessionId: string) {
  return getAuthService().logout(sessionId)
}

export async function forgotPassword(email: string) {
  return getAuthService().forgotPassword(email)
}

export async function resetPassword(token: string, newPassword: string) {
  return getAuthService().resetPassword(token, newPassword)
}

export async function verifyEmail(token: string) {
  return getAuthService().verifyEmail(token)
}

export async function updateProfile(userId: string, data: {
  display_name?: string
  bio?: string
  website?: string
  social_links?: string
}) {
  return getAuthService().updateProfile(userId, data)
}

export async function deleteAccount(userId: string) {
  return getAuthService().deleteAccount(userId)
}
