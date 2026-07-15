'use client'

import { useState } from 'react'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

interface Endpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  path: string
  description: string
  auth?: boolean
  params?: { name: string; type: string; required: boolean; description: string }[]
}

const API_SECTIONS: { title: string; endpoints: Endpoint[] }[] = [
  {
    title: 'Documents',
    endpoints: [
      { method: 'GET', path: '/api/documents', description: 'List all published documents', params: [
        { name: 'search', type: 'string', required: false, description: 'Search query' },
        { name: 'category', type: 'string', required: false, description: 'Filter by category' },
        { name: 'tag', type: 'string', required: false, description: 'Filter by tag slug' },
        { name: 'sort', type: 'string', required: false, description: 'Sort: newest, popular, downloads, featured' },
        { name: 'limit', type: 'number', required: false, description: 'Results per page (default: 20)' },
        { name: 'offset', type: 'number', required: false, description: 'Offset for pagination' },
      ]},
      { method: 'POST', path: '/api/documents', description: 'Create a new document', auth: true },
      { method: 'GET', path: '/api/documents/:id', description: 'Get document by ID or slug' },
      { method: 'PUT', path: '/api/documents/:id', description: 'Update a document', auth: true },
      { method: 'DELETE', path: '/api/documents/:id', description: 'Delete a document', auth: true },
      { method: 'POST', path: '/api/documents/:id/publish', description: 'Publish or unpublish document', auth: true },
      { method: 'GET', path: '/api/documents/:id/versions', description: 'Get version history' },
      { method: 'POST', path: '/api/documents/:id/versions', description: 'Create a new version', auth: true },
    ],
  },
  {
    title: 'Search',
    endpoints: [
      { method: 'GET', path: '/api/search', description: 'Search documents with filters', params: [
        { name: 'q', type: 'string', required: false, description: 'Search query' },
        { name: 'category', type: 'string', required: false, description: 'Filter by category' },
        { name: 'tag', type: 'string', required: false, description: 'Filter by tag' },
        { name: 'sort', type: 'string', required: false, description: 'Sort by: relevance, newest, popular, downloads' },
      ]},
      { method: 'GET', path: '/api/search/suggestions', description: 'Get search suggestions', params: [
        { name: 'q', type: 'string', required: true, description: 'Search query (min 2 chars)' },
      ]},
    ],
  },
  {
    title: 'Interactions',
    endpoints: [
      { method: 'POST', path: '/api/documents/:id/like', description: 'Like a document', auth: true },
      { method: 'DELETE', path: '/api/documents/:id/like', description: 'Unlike a document', auth: true },
      { method: 'POST', path: '/api/documents/:id/bookmark', description: 'Bookmark a document', auth: true },
      { method: 'DELETE', path: '/api/documents/:id/bookmark', description: 'Remove bookmark', auth: true },
      { method: 'POST', path: '/api/documents/:id/download', description: 'Download document as Markdown' },
      { method: 'POST', path: '/api/documents/:id/rate', description: 'Rate a document (1-5)', auth: true },
      { method: 'GET', path: '/api/documents/:id/rate', description: 'Get document ratings' },
    ],
  },
  {
    title: 'Comments',
    endpoints: [
      { method: 'GET', path: '/api/comments', description: 'Get comments for a document', params: [
        { name: 'documentId', type: 'string', required: true, description: 'Document ID' },
      ]},
      { method: 'POST', path: '/api/comments', description: 'Add a comment', auth: true },
      { method: 'PUT', path: '/api/comments/:id', description: 'Edit a comment', auth: true },
      { method: 'DELETE', path: '/api/comments/:id', description: 'Delete a comment', auth: true },
    ],
  },
  {
    title: 'Users',
    endpoints: [
      { method: 'GET', path: '/api/users/public/:username', description: 'Get public user profile' },
      { method: 'GET', path: '/api/users/profile', description: 'Get current user profile', auth: true },
      { method: 'PUT', path: '/api/users/profile', description: 'Update profile', auth: true },
      { method: 'POST', path: '/api/users/:id/follow', description: 'Follow a user', auth: true },
      { method: 'DELETE', path: '/api/users/:id/follow', description: 'Unfollow a user', auth: true },
    ],
  },
  {
    title: 'Collections',
    endpoints: [
      { method: 'GET', path: '/api/collections', description: 'List public collections' },
      { method: 'POST', path: '/api/collections', description: 'Create a collection', auth: true },
      { method: 'GET', path: '/api/collections/:id', description: 'Get collection with documents' },
      { method: 'PUT', path: '/api/collections/:id', description: 'Update collection', auth: true },
      { method: 'DELETE', path: '/api/collections/:id', description: 'Delete collection', auth: true },
      { method: 'POST', path: '/api/collections/:id/documents', description: 'Add document to collection', auth: true },
      { method: 'DELETE', path: '/api/collections/:id/documents', description: 'Remove document from collection', auth: true },
    ],
  },
  {
    title: 'Feeds',
    endpoints: [
      { method: 'GET', path: '/api/feeds/documents', description: 'RSS feed of recent documents' },
    ],
  },
]

const methodColors: Record<string, string> = {
  GET: 'bg-green-100 text-green-800',
  POST: 'bg-blue-100 text-blue-800',
  PUT: 'bg-yellow-100 text-yellow-800',
  DELETE: 'bg-red-100 text-red-800',
}

export default function ApiDocsPage() {
  const [expandedEndpoint, setExpandedEndpoint] = useState<string | null>(null)

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">API Documentation</h1>
        <p className="text-gray-500">
          RESTful API for the Markdown Platform. All endpoints return JSON responses.
        </p>
      </div>

      {/* Authentication Info */}
      <Card className="mb-8">
        <CardHeader>
          <h2 className="text-lg font-semibold">Authentication</h2>
        </CardHeader>
        <CardBody>
          <p className="text-sm text-gray-600 mb-4">
            Most endpoints require authentication. Include your session token in the Authorization header:
          </p>
          <pre className="bg-gray-100 p-3 rounded text-sm font-mono">
            Authorization: Bearer {'<session_token>'}
          </pre>
          <p className="text-sm text-gray-500 mt-4">
            Or use the session_id cookie for browser-based requests.
          </p>
        </CardBody>
      </Card>

      {/* Rate Limiting Info */}
      <Card className="mb-8">
        <CardHeader>
          <h2 className="text-lg font-semibold">Rate Limiting</h2>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="font-medium">Auth endpoints</p>
              <p className="text-gray-500">10 requests / 15 min</p>
            </div>
            <div>
              <p className="font-medium">API endpoints</p>
              <p className="text-gray-500">100 requests / min</p>
            </div>
            <div>
              <p className="font-medium">Comments</p>
              <p className="text-gray-500">10 requests / min</p>
            </div>
            <div>
              <p className="font-medium">Downloads</p>
              <p className="text-gray-500">20 requests / min</p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* API Sections */}
      {API_SECTIONS.map((section) => (
        <div key={section.title} className="mb-8">
          <h2 className="text-xl font-bold mb-4">{section.title}</h2>
          <div className="space-y-2">
            {section.endpoints.map((endpoint) => {
              const key = `${endpoint.method}-${endpoint.path}`
              const isExpanded = expandedEndpoint === key

              return (
                <Card key={key}>
                  <div
                    className="p-4 cursor-pointer hover:bg-gray-50"
                    onClick={() => setExpandedEndpoint(isExpanded ? null : key)}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded text-xs font-mono font-bold ${methodColors[endpoint.method]}`}>
                        {endpoint.method}
                      </span>
                      <code className="text-sm font-mono flex-1">{endpoint.path}</code>
                      {endpoint.auth && (
                        <Badge variant="warning" className="text-xs">Auth required</Badge>
                      )}
                      <span className="text-sm text-gray-500">{endpoint.description}</span>
                    </div>
                  </div>

                  {isExpanded && endpoint.params && endpoint.params.length > 0 && (
                    <div className="border-t p-4">
                      <h4 className="font-medium text-sm mb-2">Parameters</h4>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-gray-500">
                            <th className="pb-2">Name</th>
                            <th className="pb-2">Type</th>
                            <th className="pb-2">Required</th>
                            <th className="pb-2">Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          {endpoint.params.map((param) => (
                            <tr key={param.name} className="border-t">
                              <td className="py-2 font-mono text-xs">{param.name}</td>
                              <td className="py-2 text-gray-500">{param.type}</td>
                              <td className="py-2">
                                {param.required ? (
                                  <span className="text-red-500 text-xs">Required</span>
                                ) : (
                                  <span className="text-gray-400 text-xs">Optional</span>
                                )}
                              </td>
                              <td className="py-2 text-gray-600">{param.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
