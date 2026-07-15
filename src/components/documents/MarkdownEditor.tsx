'use client'

import { useState, useCallback, useRef } from 'react'
import { MarkdownRenderer } from './MarkdownRenderer'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

const TOOLBAR_ITEMS = [
  { label: 'B', title: 'Bold', prefix: '**', suffix: '**', placeholder: 'bold text' },
  { label: 'I', title: 'Italic', prefix: '*', suffix: '*', placeholder: 'italic text' },
  { label: 'S', title: 'Strikethrough', prefix: '~~', suffix: '~~', placeholder: 'strikethrough' },
  { label: 'H1', title: 'Heading 1', prefix: '# ', suffix: '', placeholder: 'Heading 1', block: true },
  { label: 'H2', title: 'Heading 2', prefix: '## ', suffix: '', placeholder: 'Heading 2', block: true },
  { label: 'H3', title: 'Heading 3', prefix: '### ', suffix: '', placeholder: 'Heading 3', block: true },
  { label: '—', title: 'Horizontal Rule', prefix: '\n---\n', suffix: '', placeholder: '', block: true },
  { label: '"', title: 'Quote', prefix: '> ', suffix: '', placeholder: 'quote', block: true },
  { label: '</>', title: 'Code', prefix: '`', suffix: '`', placeholder: 'code' },
  { label: '{ }', title: 'Code Block', prefix: '```\n', suffix: '\n```', placeholder: 'code block', block: true },
  { label: '•', title: 'Unordered List', prefix: '- ', suffix: '', placeholder: 'list item', block: true },
  { label: '1.', title: 'Ordered List', prefix: '1. ', suffix: '', placeholder: 'list item', block: true },
  { label: '☑', title: 'Task List', prefix: '- [ ] ', suffix: '', placeholder: 'task', block: true },
  { label: '🔗', title: 'Link', prefix: '[', suffix: '](url)', placeholder: 'link text' },
  { label: '📷', title: 'Image', prefix: '![', suffix: '](url)', placeholder: 'alt text' },
  { label: '📊', title: 'Table', prefix: '\n| Header | Header |\n| ------ | ------ |\n| Cell   | Cell   |\n', suffix: '', placeholder: '', block: true },
]

export function MarkdownEditor({ value, onChange, placeholder, className }: MarkdownEditorProps) {
  const [showPreview, setShowPreview] = useState(true)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const insertMarkdown = useCallback((prefix: string, suffix: string, placeholderText: string, isBlock: boolean) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    const text = selectedText || placeholderText

    const newText = value.substring(0, start) + prefix + text + suffix + value.substring(end)
    onChange(newText)

    setTimeout(() => {
      textarea.focus()
      const newCursorPos = start + prefix.length + text.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }, [value, onChange])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const start = e.currentTarget.selectionStart
      const end = e.currentTarget.selectionEnd
      const newValue = value.substring(0, start) + '  ' + value.substring(end)
      onChange(newValue)
      setTimeout(() => {
        e.currentTarget.selectionStart = e.currentTarget.selectionEnd = start + 2
      }, 0)
    }

    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
      e.preventDefault()
      insertMarkdown('**', '**', 'bold text', false)
    }

    if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
      e.preventDefault()
      insertMarkdown('*', '*', 'italic text', false)
    }
  }, [value, onChange, insertMarkdown])

  return (
    <div className={cn('border rounded-lg overflow-hidden', className)}>
      <div className="flex items-center justify-between border-b bg-gray-50 px-2 py-1">
        <div className="flex items-center gap-0.5 flex-wrap">
          {TOOLBAR_ITEMS.map((item) => (
            <button
              key={item.title}
              type="button"
              title={item.title}
              onClick={() => insertMarkdown(item.prefix, item.suffix, item.placeholder, item.block || false)}
              className="px-2 py-1 text-xs font-mono text-gray-600 hover:bg-gray-200 rounded transition-colors"
            >
              {item.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className="ml-2 px-2 py-1 text-xs text-gray-600 hover:bg-gray-200 rounded"
        >
          {showPreview ? 'Edit' : 'Preview'}
        </button>
      </div>

      <div className={cn('flex', showPreview ? 'h-[600px]' : 'h-[400px]')}>
        <div className={cn('flex flex-col', showPreview ? 'w-1/2 border-r' : 'w-full')}>
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || 'Write your markdown here...'}
            className="flex-1 w-full p-4 font-mono text-sm resize-none focus:outline-none"
          />
        </div>
        {showPreview && (
          <div className="w-1/2 overflow-y-auto p-4">
            <MarkdownRenderer content={value || '*Nothing to preview*'} />
          </div>
        )}
      </div>
    </div>
  )
}
