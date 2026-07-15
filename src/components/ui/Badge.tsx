import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { ComponentPropsWithoutRef, forwardRef } from 'react'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary-700',
        secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary-700',
        success: 'border-transparent bg-success text-white hover:bg-success-700',
        warning: 'border-transparent bg-warning text-white hover:bg-warning-700',
        error: 'border-transparent bg-error text-white hover:bg-error-700',
        outline: 'text-text-secondary',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps extends ComponentPropsWithoutRef<'div'>, VariantProps<typeof badgeVariants> {}

export const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div className={cn(badgeVariants({ variant, className }))} ref={ref} {...props} />
    )
  }
)

Badge.displayName = 'Badge'
