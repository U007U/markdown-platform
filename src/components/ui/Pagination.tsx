import { cn } from '@/lib/utils'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

export function Pagination({ currentPage, totalPages, onPageChange, className }: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <div className={cn('flex items-center justify-center space-x-2', className)}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={cn(
          'inline-flex items-center justify-center rounded-md border border-border bg-transparent px-3 py-2 text-sm font-medium hover:bg-background-alt disabled:opacity-50 disabled:cursor-not-allowed',
          currentPage === 1 && 'opacity-50'
        )}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={cn(
            'inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium hover:bg-background-alt',
            currentPage === page && 'bg-primary text-white hover:bg-primary-700'
          )}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={cn(
          'inline-flex items-center justify-center rounded-md border border-border bg-transparent px-3 py-2 text-sm font-medium hover:bg-background-alt disabled:opacity-50 disabled:cursor-not-allowed',
          currentPage === totalPages && 'opacity-50'
        )}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  )
}
