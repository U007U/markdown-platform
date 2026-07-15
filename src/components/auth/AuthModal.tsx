'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { LoginForm } from './LoginForm'
import { RegisterForm } from './RegisterForm'

export function AuthModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [view, setView] = useState<'login' | 'register'>('login')

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Sign in</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {view === 'login' ? 'Welcome back' : 'Create an account'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-6">
          {view === 'login' ? <LoginForm /> : <RegisterForm />}
        </div>

        <div className="mt-6 text-center">
          {view === 'login' ? (
            <p>
              Don't have an account?{' '}
              <Button variant="ghost" onClick={() => setView('register')} className="p-0 h-auto font-semibold text-primary hover:text-primary-700">
                Sign up
              </Button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <Button variant="ghost" onClick={() => setView('login')} className="p-0 h-auto font-semibold text-primary hover:text-primary-700">
                Sign in
              </Button>
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
