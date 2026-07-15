import { cn } from '@/lib/utils'
import { Menu } from 'lucide-react'

export interface MobileMenuProps {
  isOpen: boolean
  onToggle: () => void
  children?: React.ReactNode
  className?: string
}

export function MobileMenu({ isOpen, onToggle, children, className }: MobileMenuProps) {
  return (
    <div className={cn('relative', className)}>
      <button
        onClick={onToggle}
        className="inline-flex items-center justify-center rounded-md p-2 text-text-secondary hover:bg-background-alt focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <Menu className="h-6 w-6" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 z-50 mt-2 w-48 rounded-md border border-border bg-surface shadow-lg py-1">
          {children}
        </div>
      )}
    </div>
  )
}
