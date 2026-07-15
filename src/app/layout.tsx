import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Markdown Platform - Publish and Discover Documents',
    template: '%s | Markdown Platform',
  },
  description: 'A platform for publishing and discovering high-quality Markdown documents. Share your knowledge with the world.',
  keywords: ['markdown', 'documents', 'publishing', 'knowledge sharing', 'documentation'],
  authors: [{ name: 'Markdown Platform' }],
  creator: 'Markdown Platform',
  publisher: 'Markdown Platform',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Markdown Platform',
    title: 'Markdown Platform - Publish and Discover Documents',
    description: 'A platform for publishing and discovering high-quality Markdown documents.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Markdown Platform - Publish and Discover Documents',
    description: 'A platform for publishing and discovering high-quality Markdown documents.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body>{children}</body>
    </html>
  )
}
