import { cn } from '@/lib/utils'

export interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circle' | 'rect'
  width?: string
  height?: string
}

export function Skeleton({ className, variant = 'rect', width, height }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-text-tertiary/20',
        variant === 'circle' && 'rounded-full',
        variant === 'text' && 'h-4 w-full',
        variant === 'rect' && 'h-8 w-full',
        width && `w-${width}`,
        height && `h-${height}`,
        className
      )}
    />
  )
}
