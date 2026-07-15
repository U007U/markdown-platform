import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { ComponentPropsWithoutRef, forwardRef } from 'react'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-white hover:bg-primary-700',
        secondary: 'bg-secondary text-white hover:bg-secondary-700',
        ghost: 'hover:bg-background-alt hover:text-text-primary',
        outline: 'border border-border hover:bg-background-alt',
        destructive: 'bg-error text-white hover:bg-error-700',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        base: 'h-10 px-4 py-2 text-sm',
        lg: 'h-12 px-6 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'base',
    },
  }
)

export interface ButtonProps
  extends ComponentPropsWithoutRef<'button'>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'
