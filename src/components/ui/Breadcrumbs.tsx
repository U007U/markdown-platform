import { cn } from '@/lib/utils'
import Link from 'next/link'

export interface BreadcrumbsProps {
  items: { label: string; href?: string }[]
  className?: string
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav className={cn('flex items-center space-x-2 text-sm text-text-secondary', className)} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center space-x-2">
            {index > 0 && <span className="text-text-tertiary">/</span>}
            {item.href ? (
              <Link href={item.href} className="hover:text-text-primary">
                {item.label}
              </Link>
            ) : (
              <span className="text-text-primary font-medium">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
