import { cn } from '@/lib/utils'

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('bg-surface rounded-xl border border-border shadow-sm', className)}>{children}</div>
}

export function CardHeader({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('p-6 border-b border-border', className)}>{children}</div>
}

export function CardBody({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('p-6', className)}>{children}</div>
}

export function CardFooter({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('p-6 border-t border-border bg-background-alt', className)}>{children}</div>
}
