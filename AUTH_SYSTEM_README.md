# Authentication System Documentation

## Overview
This authentication system provides comprehensive user authentication with email/password, OAuth providers, and role-based access control.

## Files Created/Modified

### Core Auth Files
- `src/lib/auth/config.ts` - NextAuth configuration
- `src/lib/auth/d1-adapter.ts` - D1 database adapter for NextAuth
- `src/lib/auth/database.ts` - Database operations for auth
- `src/lib/auth/rbac.ts` - Role-based access control utilities
- `src/lib/auth/middleware.ts` - Authentication middleware

### Database Schema
- `src/lib/db/schema.ts` - Auth database schema

### API Routes
- `src/app/api/auth/[...nextauth]/route.ts` - NextAuth handler
- `src/app/api/auth/login/route.ts` - User login
- `src/app/api/auth/register/route.ts` - User registration
- `src/app/api/auth/logout/route.ts` - User logout
- `src/app/api/auth/forgot-password/route.ts` - Password reset request
- `src/app/api/auth/reset-password/route.ts` - Password reset
- `src/app/api/auth/verify-email/route.ts` - Email verification
- `src/app/api/auth/session/route.ts` - Get current session
- `src/app/api/users/profile/route.ts` - Get user profile
- `src/app/api/users/profile/route.ts` - Update user profile (PUT)
- `src/app/api/users/account/route.ts` - Delete account

### Components
- `src/components/auth/LoginForm.tsx` - Login form
- `src/components/auth/RegisterForm.tsx` - Registration form
- `src/components/auth/ForgotPasswordForm.tsx` - Password reset request form
- `src/components/auth/ResetPasswordForm.tsx` - Password reset form
- `src/components/auth/EmailVerificationPage.tsx` - Email verification page
- `src/components/auth/ProfilePage.tsx` - User profile page
- `src/components/auth/AuthModal.tsx` - Auth modal component
- `src/components/ui/Dialog.tsx` - Dialog component for auth modal

### Pages
- `src/app/auth/page.tsx` - Main auth page
- `src/app/auth/signin/page.tsx` - Login page
- `src/app/auth/signup/page.tsx` - Registration page
- `src/app/auth/forgot-password/page.tsx` - Forgot password page
- `src/app/auth/reset-password/page.tsx` - Reset password page
- `src/app/auth/verify-email/page.tsx` - Email verification page
- `src/app/profile/page.tsx` - User profile page

### Types
- `src/types/auth.ts` - Auth types and interfaces

## How to Start the Authentication Flow

1. **Install Dependencies**:
   ```bash
   npm install next-auth@beta @auth/core bcrypt
   ```

2. **Set up Environment Variables**:
   Copy `.env.example` to `.env.local` and fill in the values:
   ```bash
   cp .env.example .env.local
   ```

3. **Run Database Migrations**:
   ```bash
   npm run db:migrate
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```

5. **Access Auth Pages**:
   - Login: http://localhost:3000/auth/signin
   - Register: http://localhost:3000/auth/signup
   - Profile: http://localhost:3000/profile

## How to Configure OAuth Providers

### Google OAuth
1. Go to Google Cloud Console
2. Create a new project or select an existing one
3. Go to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Configure the consent screen if prompted
6. Select "Web application"
7. Add authorized origins:
   - `http://localhost:3000` (development)
8. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
9. Copy the Client ID and Client Secret to your `.env.local`

### GitHub OAuth
1. Go to GitHub Developer Settings
2. Click "New OAuth App" or "New GitHub App"
3. Fill in the application details
4. Set Authorization callback URL to:
   - `http://localhost:3000/api/auth/callback/github`
5. Click "Register application"
6. Copy the Client ID and Client Secret to your `.env.local`

### Discord OAuth
1. Go to Discord Developer Portal
2. Click "New Application"
3. Go to "OAuth2" > "General"
4. Copy the Client ID and Client Secret
5. Go to "OAuth2" > "Redirects"
6. Add redirect URI:
   - `http://localhost:3000/api/auth/callback/discord`
7. Add the scopes: `identify`, `email`
8. Save the changes

## How to Configure Email Services

### Option 1: SMTP (Recommended for Development)
Update these environment variables in `.env.local`:
```env
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM=Markdown Platform <no-reply@example.com>
```

### Option 2: Resend (Production)
Update these environment variables:
```env
RESEND_API_KEY=re_123456789_xxxxxxxxxxxxx
```

## How to Run Email Verification Flow

1. **Register a new user** through `/auth/signup`
2. **Check your email** for the verification link
3. **Click the verification link** which will redirect to `/auth/verify-email?token=...`
4. **The email will be verified** automatically

For development, you can manually verify an email by visiting:
```
http://localhost:3000/auth/verify-email?token=<your-token>
```

## How to Test OAuth Providers

1. Go to the login page (`/auth/signin`)
2. Click on "Continue with Google/GitHub/Discord"
3. You'll be redirected to the OAuth provider's consent screen
4. After granting permission, you'll be redirected back to your app
5. An account will be created/linked automatically

## Role-Based Access Control

The system supports 5 roles in hierarchy:
1. `guest` - 0 (lowest)
2. `user` - 1
3. `author` - 2
4. `moderator` - 3
5. `admin` - 4 (highest)

### Usage in API Routes
```typescript
import { requireAuth, requireRole } from '@/lib/auth/middleware'

export async function POST(req: Request) {
  const session = await requireRole({ role: 'author' })
  if (!session) return new Response('Unauthorized', { status: 401 })
  
  // Your protected code here
}
```

### RBAC Utility Functions
```typescript
import { 
  canCreateDocuments, 
  canEditDocuments, 
  canDeleteDocuments,
  canManageUsers,
  isAdmin,
  isModerator,
  isAuthor
} from '@/lib/auth/rbac'

// Check permissions
if (canCreateDocuments(userRole)) {
  // User can create documents
}

if (isAdmin(session)) {
  // User is admin
}
```

## Security Features

### Implemented
- Password hashing with bcrypt (10 rounds)
- CSRF protection via NextAuth
- Rate limiting (implement in your proxy or API routes)
- Input validation with Zod
- XSS protection (Next.js auto-escaping)
- Email verification flow
- Session management with JWT
- OAuth providers with proper scopes

### Recommended Additions
1. Rate Limiting - Implement with a middleware or use a service like Cloudflare Rate Limiting
2. Brute Force Protection - Add login attempt tracking
3. 2FA/MFA - Implement two-factor authentication
4. Password Strength - Enforce stronger password policies
5. Account Lockout - Lock accounts after multiple failed attempts

## Troubleshooting

### Common Issues

1. **OAuth Callback Errors**
   - Check redirect URIs in provider settings
   - Ensure `NEXTAUTH_URL` is correct
   - Verify Client ID and Secret

2. **Email Not Sending**
   - Check SMTP credentials
   - Verify email from address format
   - Check email server logs

3. **Session Not Persisting**
   - Check `NEXTAUTH_SECRET` is set
   - Verify database connection
   - Check browser cookies

4. **Migration Errors**
   - Ensure database is accessible
   - Check migration order
   - Review D1 dashboard for errors

### Debug Mode
Enable debug logging in `.env.local`:
```env
NODE_ENV=development
```

## Next Steps

1. Test all authentication flows
2. Configure production environment variables
3. Set up email templates
4. Implement additional security measures
5. Add audit logging
6. Create admin panel for user management

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review NextAuth.js documentation: https://next-auth.js.org/
3. Check D1 documentation: https://developers.cloudflare.com/d1/
