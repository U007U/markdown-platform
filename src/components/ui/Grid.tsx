import { cn } from '@/lib/utils'

export interface GridProps {
  children: React.ReactNode
  className?: string
  columns?: number
  gap?: 'sm' | 'md' | 'lg'
}

const gapClasses = {
  sm: 'gap-4',
  md: 'gap-6',
  lg: 'gap-8',
}

export function Grid({ children, className, columns = 12, gap = 'md' }: GridProps) {
  return (
    <div
      className={cn(
        'grid',
        `grid-cols-${columns}`,
        gapClasses[gap],
        className
      )}
    >
      {children}
    </div>
  )
}
