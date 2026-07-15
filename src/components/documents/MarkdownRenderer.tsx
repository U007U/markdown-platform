'use client'

import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import { cn } from '@/lib/utils'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div className={cn('prose prose-slate dark:prose-invert max-w-none', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSanitize, rehypeHighlight]}
        components={{
          h1: ({ children, ...props }) => (
            <h1 id={slugifyChildren(children)} {...props}>{children}</h1>
          ),
          h2: ({ children, ...props }) => (
            <h2 id={slugifyChildren(children)} {...props}>{children}</h2>
          ),
          h3: ({ children, ...props }) => (
            <h3 id={slugifyChildren(children)} {...props}>{children}</h3>
          ),
          h4: ({ children, ...props }) => (
            <h4 id={slugifyChildren(children)} {...props}>{children}</h4>
          ),
          h5: ({ children, ...props }) => (
            <h5 id={slugifyChildren(children)} {...props}>{children}</h5>
          ),
          h6: ({ children, ...props }) => (
            <h6 id={slugifyChildren(children)} {...props}>{children}</h6>
          ),
          a: ({ href, children, ...props }) => (
            <a
              href={href}
              target={href?.startsWith('http') ? '_blank' : undefined}
              rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
              {...props}
            >
              {children}
            </a>
          ),
          img: ({ src, alt, ...props }) => (
            <img
              src={src}
              alt={alt || ''}
              loading="lazy"
              className="rounded-lg"
              {...props}
            />
          ),
          table: ({ children, ...props }) => (
            <div className="overflow-x-auto">
              <table {...props}>{children}</table>
            </div>
          ),
          input: ({ ...props }) => (
            <input
              {...props}
              disabled
              className="mr-2"
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

function slugifyChildren(children: React.ReactNode): string {
  const text = extractText(children)
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

function extractText(node: React.ReactNode): string {
  if (typeof node === 'string') return node
  if (typeof node === 'number') return String(node)
  if (React.isValidElement(node)) {
    const props = node.props as { children?: React.ReactNode }
    return extractText(props.children)
  }
  if (Array.isArray(node)) {
    return node.map(extractText).join('')
  }
  return ''
}
