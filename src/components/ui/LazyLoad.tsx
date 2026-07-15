'use client'

import { useState, useEffect, useRef, ComponentType, ReactNode } from 'react'
import { Skeleton } from '@/components/ui/Skeleton'

interface LazyLoadProps {
  children: ReactNode
  fallback?: ReactNode
  rootMargin?: string
  threshold?: number
}

export function LazyLoad({
  children,
  fallback,
  rootMargin = '100px',
  threshold = 0.1,
}: LazyLoadProps) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin, threshold }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [rootMargin, threshold])

  return (
    <div ref={ref}>
      {isVisible ? children : (fallback || <Skeleton className="h-40" />)}
    </div>
  )
}

// Higher-order component for lazy loading
export function withLazyLoad<P extends object>(
  Component: ComponentType<P>,
  fallback?: ReactNode
) {
  return function LazyLoadedComponent(props: P) {
    return (
      <LazyLoad fallback={fallback}>
        <Component {...props} />
      </LazyLoad>
    )
  }
}
