import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm'
import { cookies } from 'next/headers'

export default function ResetPasswordPage({ searchParams }: { searchParams: { token: string } }) {
  const { token } = searchParams

  if (!token) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Invalid or expired reset link</h1>
          <p className="text-muted-foreground mb-4">
            Please request a new password reset link.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
      <ResetPasswordForm token={token} />
    </div>
  )
}
