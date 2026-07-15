import { cn } from '@/lib/utils'

export interface FooterProps {
  children?: React.ReactNode
  className?: string
}

export function Footer({ children, className }: FooterProps) {
  return (
    <footer className={cn('border-t border-border bg-background', className)}>
      <div className="container mx-auto px-4 py-8">
        {children}
      </div>
    </footer>
  )
}
