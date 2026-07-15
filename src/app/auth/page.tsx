import { AuthModal } from '@/components/auth/AuthModal'
import { Button } from '@/components/ui/Button'

export default function AuthPage() {
  return (
    <div className="container mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md">
        <AuthModal />
      </div>
    </div>
  )
}
