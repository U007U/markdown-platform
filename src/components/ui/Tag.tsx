import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { ComponentPropsWithoutRef, forwardRef } from 'react'

const tagVariants = cva(
  'inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
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

export interface TagProps extends ComponentPropsWithoutRef<'div'>, VariantProps<typeof tagVariants> {}

export const Tag = forwardRef<HTMLDivElement, TagProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div className={cn(tagVariants({ variant, className }))} ref={ref} {...props} />
    )
  }
)

Tag.displayName = 'Tag'
