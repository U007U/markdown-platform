import { NextResponse } from 'next/server'

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: string
  meta?: {
    page?: number
    limit?: number
    total?: number
    totalPages?: number
  }
}

export class ApiResponseBuilder {
  static success<T>(data: T, meta?: ApiResponse['meta']): NextResponse<ApiResponse<T>> {
    return NextResponse.json({
      success: true,
      data,
      meta,
    })
  }

  static created<T>(data: T): NextResponse<ApiResponse<T>> {
    return NextResponse.json({
      success: true,
      data,
    }, { status: 201 })
  }

  static error(message: string, status: number = 400): NextResponse<ApiResponse> {
    return NextResponse.json({
      success: false,
      message,
      error: message,
    }, { status })
  }

  static unauthorized(message: string = 'Unauthorized'): NextResponse<ApiResponse> {
    return this.error(message, 401)
  }

  static forbidden(message: string = 'Forbidden'): NextResponse<ApiResponse> {
    return this.error(message, 403)
  }

  static notFound(message: string = 'Not found'): NextResponse<ApiResponse> {
    return this.error(message, 404)
  }

  static tooManyRequests(message: string = 'Too many requests'): NextResponse<ApiResponse> {
    return this.error(message, 429)
  }

  static paginated<T>(
    data: T[],
    total: number,
    page: number,
    limit: number
  ): NextResponse<ApiResponse<T[]>> {
    return NextResponse.json({
      success: true,
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  }
}
