import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title') || 'Markdown Platform';
  const description = searchParams.get('description') || 'Publish and discover Markdown documents';

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#ffffff',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 80px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: 64,
              fontWeight: 'bold',
              color: '#111827',
              lineHeight: 1.2,
              marginBottom: 24,
              maxWidth: 900,
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 28,
              color: '#6b7280',
              maxWidth: 700,
            }}
          >
            {description}
          </div>
          <div
            style={{
              position: 'absolute',
              bottom: 40,
              fontSize: 20,
              color: '#9ca3af',
            }}
          >
            Markdown Platform
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
