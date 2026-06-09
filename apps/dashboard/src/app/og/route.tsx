import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#000000',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'monospace',
        }}
      >
        <div style={{
          fontSize: 72,
          fontWeight: 700,
          color: '#ffffff',
          letterSpacing: '-2px',
        }}>
          Metera
        </div>
        <div style={{
          fontSize: 28,
          color: '#666666',
          marginTop: 24,
          textAlign: 'center',
          maxWidth: 800,
        }}>
          Billing infrastructure for AI agents
        </div>
        <div style={{
          fontSize: 20,
          color: '#00bc7d',
          marginTop: 16,
          fontFamily: 'monospace',
        }}>
          npm install gate402
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
