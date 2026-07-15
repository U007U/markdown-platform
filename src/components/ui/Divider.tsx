import { cn } from '@/lib/utils'

export function Divider({ className, orientation = 'horizontal' }: { className?: string; orientation?: 'horizontal' | 'vertical' }) {
  return (
    <div
      className={cn(
        'bg-border',
        orientation === 'horizontal'
          ? 'h-px w-full'
          : 'w-px h-full'
      )}
      style={{ margin: orientation === 'horizontal' ? '1rem 0' : '0 1rem' }}
      role="separator"
      aria-orientation={orientation}
    />
  )
}
