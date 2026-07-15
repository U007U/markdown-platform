import Link from 'next/link'
import type { Document } from '@/types/database'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'

interface DocumentCardProps {
  document: Document
  className?: string
}

export function DocumentCard({ document, className }: DocumentCardProps) {
  const statusVariant = {
    draft: 'warning' as const,
    published: 'default' as const,
    archived: 'secondary' as const,
  }

  return (
    <Link href={`/documents/${document.slug}`}>
      <div className={cn(
        'p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer',
        className
      )}>
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-lg line-clamp-1">{document.title}</h3>
          <Badge variant={statusVariant[document.status]}>
            {document.status}
          </Badge>
        </div>

        {document.description && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-3">
            {document.description}
          </p>
        )}

        <div className="flex items-center gap-4 text-xs text-gray-400">
          {document.category && (
            <span className="bg-gray-100 px-2 py-0.5 rounded">{document.category}</span>
          )}
          <span>{document.view_count} views</span>
          <span>{new Date(document.created_at).toLocaleDateString()}</span>
        </div>
      </div>
    </Link>
  )
}
