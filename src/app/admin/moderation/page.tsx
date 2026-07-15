'use client'

import { useState, useEffect } from 'react'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

interface Report {
  id: string
  reporter_id: string
  reporter_username: string
  target_type: 'document' | 'user' | 'comment'
  target_id: string
  reason: string
  description: string | null
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed'
  created_at: string
}

export default function ModerationPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'pending' | 'reviewed' | 'resolved' | 'dismissed'>('pending')
  const [isModerator, setIsModerator] = useState(false)

  useEffect(() => {
    checkAuth()
    fetchReports()
  }, [filter])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/session')
      const data = await res.json()
      if (data.authenticated && ['moderator', 'admin'].includes(data.user?.role)) {
        setIsModerator(true)
      }
    } catch (err) {
      // Not logged in
    }
  }

  const fetchReports = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/reports/document?status=${filter}`)
      const data = await res.json()
      if (data.success) {
        setReports(data.reports || [])
      }
    } catch (err) {
      console.error('Failed to fetch reports:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (reportId: string, status: string) => {
    try {
      const res = await fetch(`/api/moderation/${reportId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      if (res.ok) {
        fetchReports()
      }
    } catch (err) {
      console.error('Failed to update report:', err)
    }
  }

  if (!isModerator) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="text-gray-500">You need moderator privileges to access this page.</p>
      </div>
    )
  }

  const statusColors = {
    pending: 'warning',
    reviewed: 'secondary',
    resolved: 'success',
    dismissed: 'outline',
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-3xl font-bold mb-6">Moderation Dashboard</h1>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {(['pending', 'reviewed', 'resolved', 'dismissed'] as const).map((status) => (
          <Button
            key={status}
            variant={filter === status ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter(status)}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Button>
        ))}
      </div>

      {/* Reports List */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No {filter} reports</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <Card key={report.id}>
              <CardBody>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={statusColors[report.status] as 'warning' | 'secondary' | 'success' | 'outline'}>
                        {report.target_type}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        Reported by @{report.reporter_username}
                      </span>
                      <span className="text-sm text-gray-400">
                        {new Date(report.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="font-medium mb-1">{report.reason}</h3>

                    {report.description && (
                      <p className="text-sm text-gray-600 mb-2">{report.description}</p>
                    )}

                    <p className="text-xs text-gray-400">
                      Target ID: {report.target_id}
                    </p>
                  </div>

                  {report.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusUpdate(report.id, 'reviewed')}
                      >
                        Review
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleStatusUpdate(report.id, 'resolved')}
                      >
                        Resolve
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleStatusUpdate(report.id, 'dismissed')}
                      >
                        Dismiss
                      </Button>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
