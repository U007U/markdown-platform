'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface ReportButtonProps {
  targetType: 'document' | 'user' | 'comment'
  targetId: string
  className?: string
}

const REPORT_REASONS = {
  document: [
    'Spam or misleading content',
    'Copyright infringement',
    'Inappropriate content',
    'Incorrect information',
    'Other',
  ],
  user: [
    'Spam or fake account',
    'Harassment or bullying',
    'Inappropriate profile',
    'Impersonation',
    'Other',
  ],
  comment: [
    'Spam',
    'Harassment or bullying',
    'Inappropriate content',
    'Off-topic or irrelevant',
    'Other',
  ],
}

export function ReportButton({ targetType, targetId, className }: ReportButtonProps) {
  const [showForm, setShowForm] = useState(false)
  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason || submitting) return

    setSubmitting(true)
    try {
      const res = await fetch(`/api/reports/${targetType}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetId,
          reason,
          description: description.trim() || undefined,
        }),
      })

      if (res.ok) {
        setSubmitted(true)
        setShowForm(false)
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <span className="text-sm text-green-600">Report submitted</span>
    )
  }

  if (showForm) {
    return (
      <div className={cn('border rounded-lg p-4 bg-gray-50', className)}>
        <h4 className="font-medium text-sm mb-3">Report {targetType}</h4>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Reason</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a reason</option>
              {REPORT_REASONS[targetType].map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Provide additional details..."
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={submitting || !reason}>
              {submitting ? 'Submitting...' : 'Submit Report'}
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setShowForm(true)}
      className={cn('text-gray-500 hover:text-red-500', className)}
    >
      Report
    </Button>
  )
}
