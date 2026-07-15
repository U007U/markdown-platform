'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface TocItem {
  id: string
  text: string
  level: number
}

interface TableOfContentsProps {
  content: string
  className?: string
}

export function TableOfContents({ content, className }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<TocItem[]>([])
  const [activeId, setActiveId] = useState('')

  useEffect(() => {
    const items: TocItem[] = []
    const regex = /^(#{1,6})\s+(.+)$/gm
    let match
    while ((match = regex.exec(content)) !== null) {
      const level = match[1].length
      const text = match[2].replace(/\*\*|__|\*|_|~~|`/g, '').trim()
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
      items.push({ id, text, level })
    }
    setHeadings(items)
  }, [content])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: '-80px 0px -80% 0px' }
    )

    headings.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [headings])

  if (headings.length < 2) return null

  return (
    <nav className={cn('text-sm', className)}>
      <h4 className="font-semibold mb-3 text-gray-900">On this page</h4>
      <ul className="space-y-1">
        {headings.map((heading) => (
          <li
            key={heading.id}
            style={{ paddingLeft: `${(heading.level - 1) * 12}px` }}
          >
            <a
              href={`#${heading.id}`}
              className={cn(
                'block py-1 transition-colors hover:text-primary',
                activeId === heading.id
                  ? 'text-primary font-medium'
                  : 'text-gray-500'
              )}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
