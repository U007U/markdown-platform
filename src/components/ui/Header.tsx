import { cn } from '@/lib/utils'

export interface HeaderProps {
  children?: React.ReactNode
  className?: string
  fixed?: boolean
}

export function Header({ children, className, fixed = false }: HeaderProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        fixed && 'fixed',
        className
      )}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {children}
      </div>
    </header>
  )
}
