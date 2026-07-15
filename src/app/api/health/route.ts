import { NextResponse } from 'next/server'

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  version: string
  uptime: number
  checks: {
    database: { status: 'up' | 'down'; latency?: number }
    memory: { used: number; total: number; percentage: number }
  }
}

export async function GET() {
  const startTime = Date.now()

  try {
    // Check database
    let dbStatus: 'up' | 'down' = 'down'
    let dbLatency: number | undefined

    try {
      const { createDB } = await import('@/lib/db/client')
      const db = createDB()
      const dbStart = Date.now()
      await db.prepare('SELECT 1').first()
      dbLatency = Date.now() - dbStart
      dbStatus = 'up'
    } catch (error) {
      dbStatus = 'down'
    }

    // Memory usage (approximate for Node.js)
    const memUsage = process.memoryUsage()
    const memory = {
      used: Math.round(memUsage.heapUsed / 1024 / 1024),
      total: Math.round(memUsage.heapTotal / 1024 / 1024),
      percentage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100),
    }

    const overallStatus = dbStatus === 'down' ? 'unhealthy' : 'healthy'

    const response: HealthStatus = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '0.1.0',
      uptime: process.uptime(),
      checks: {
        database: { status: dbStatus, latency: dbLatency },
        memory,
      },
    }

    return NextResponse.json(response, {
      status: overallStatus === 'healthy' ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: (error as Error).message,
      },
      { status: 503 }
    )
  }
}
