'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import type { DocumentVersion } from '@/types/database'

interface VersionHistoryProps {
  documentId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onRestore: (versionId: string) => void
}

export function VersionHistory({ documentId, open, onOpenChange, onRestore }: VersionHistoryProps) {
  const [versions, setVersions] = useState<DocumentVersion[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedVersion, setSelectedVersion] = useState<DocumentVersion | null>(null)

  useEffect(() => {
    if (open) {
      fetchVersions()
    }
  }, [open, documentId])

  const fetchVersions = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/documents/${documentId}/versions`)
      const data = await res.json()
      if (data.success) {
        setVersions(data.versions)
      }
    } catch (err) {
      console.error('Failed to fetch versions:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRestore = (versionId: string) => {
    if (confirm('Are you sure you want to restore this version? Current changes will be saved as a new version.')) {
      onRestore(versionId)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Version History</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading versions...</div>
          ) : versions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No versions saved yet. Save a version to start tracking changes.
            </div>
          ) : (
            <div className="space-y-2">
              {versions.map((version) => (
                <div
                  key={version.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedVersion?.id === version.id
                      ? 'border-primary bg-primary/5'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedVersion(version)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">v{version.version_number}</span>
                      <span className="text-sm text-gray-500 ml-2">
                        {new Date(version.created_at).toLocaleString()}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRestore(version.id)
                      }}
                    >
                      Restore
                    </Button>
                  </div>
                  {version.changelog && (
                    <p className="text-sm text-gray-600 mt-1">{version.changelog}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedVersion && (
          <div className="border-t pt-4 mt-4">
            <h4 className="font-medium mb-2">Version {selectedVersion.version_number} Preview</h4>
            <div className="max-h-60 overflow-y-auto bg-gray-50 p-3 rounded text-sm font-mono whitespace-pre-wrap">
              {selectedVersion.content?.substring(0, 2000) || 'No content'}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
