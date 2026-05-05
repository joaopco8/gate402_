'use client'
import { useEffect, useState } from 'react'
import { createClient } from '../../../lib/supabase/client'
import DashboardLayout from '../components/DashboardLayout'
import PageContainer from '../components/PageContainer'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'

const SNIPPETS = [
  {
    label: 'Express',
    code: `npm install gate402

import { gate402 } from 'gate402'
import express from 'express'

const app = express()

app.use(gate402({
  apiKey: 'SEU_API_KEY',
  walletAddress: 'SUA_CARTEIRA_SOLANA',
  endpoints: {
    '/api/weather': 0.001,  // 0.001 USDC per call
    '/api/data': 0.005,
  }
}))

app.get('/api/weather', (req, res) => {
  res.json({ city: 'São Paulo', temp: '28°C' })
})`,
  },
  {
    label: 'Next.js',
    code: `npm install gate402

// app/api/weather/route.ts
import { gate402 } from 'gate402'
import { NextRequest } from 'next/server'

const billing = gate402({
  apiKey: 'SEU_API_KEY',
  walletAddress: 'SUA_CARTEIRA_SOLANA',
  endpoints: { '/api/weather': 0.001 }
})

export async function GET(req: NextRequest) {
  // Check payment
  const paymentHeader = req.headers.get('x-payment-payload')
  if (!paymentHeader) {
    return Response.json({
      error: 'Payment Required',
      price: { amount: '0.001', currency: 'USDC' }
    }, { status: 402 })
  }
  return Response.json({ city: 'São Paulo', temp: '28°C' })
}`,
  },
  {
    label: 'MCP Server',
    code: `npm install gate402 @modelcontextprotocol/sdk

import { gate402 } from 'gate402'
import { Server } from '@modelcontextprotocol/sdk/server/index.js'

// Wrap your MCP tool with gate402
const billing = gate402({
  apiKey: 'SEU_API_KEY',
  walletAddress: 'SUA_CARTEIRA_SOLANA',
  endpoints: { '/tools/weather': 0.001 }
})

// Agent pays before tool executes
server.setRequestHandler(CallToolRequestSchema, async (req) => {
  // gate402 handles payment verification automatically
  return { content: [{ type: 'text', text: 'Weather data here' }] }
})`,
  },
]

function CodeCard({ label, code }: { label: string; code: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{
        background: '#0f0f0f',
        border: '1px solid #222',
        borderRadius: 8,
        overflow: 'hidden',
      }}>
        {/* toolbar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 16px',
          borderBottom: '1px solid #222',
        }}>
          <span style={{ color: '#00ff88', fontSize: 11, fontFamily: 'monospace', letterSpacing: '0.08em' }}>
            {label}
          </span>
          <button
            onClick={handleCopy}
            style={{
              background: copied ? '#00ff8820' : 'transparent',
              border: `1px solid ${copied ? '#00ff8840' : '#333'}`,
              color: copied ? '#00ff88' : '#666',
              borderRadius: 4,
              padding: '3px 10px',
              fontFamily: 'monospace',
              fontSize: 11,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {copied ? 'Copied ✓' : 'Copy'}
          </button>
        </div>
        {/* code */}
        <pre style={{
          margin: 0,
          padding: 16,
          fontFamily: 'monospace',
          fontSize: 12,
          color: '#ccc',
          overflowX: 'auto',
          lineHeight: 1.7,
          whiteSpace: 'pre',
        }}>
          {code}
        </pre>
      </div>
    </div>
  )
}

export default function DocsPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [copiedKey, setCopiedKey] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserId(user.id)
    }
    load()
  }, [])

  async function handleCopyKey() {
    if (!userId) return
    await navigator.clipboard.writeText(userId)
    setCopiedKey(true)
    setTimeout(() => setCopiedKey(false), 2000)
  }

  return (
    <DashboardLayout>
      <PageContainer>
        <PageHeader eyebrow="DOCS" title="Documentation" subtitle="Add pay-per-call billing to any API in minutes." />

        {SNIPPETS.map((s) => (
          <CodeCard key={s.label} label={s.label} code={s.code} />
        ))}

        {/* Credentials card */}
        <Card style={{ marginTop: 16 }}>
          <p style={{ color: '#00ff88', fontSize: 11, letterSpacing: '0.1em', margin: '0 0 16px' }}>
            YOUR CREDENTIALS
          </p>

          {/* API Key */}
          <div style={{ marginBottom: 16 }}>
            <p style={{ color: '#555', fontSize: 11, margin: '0 0 6px' }}>API KEY</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#ccc', wordBreak: 'break-all', flex: 1 }}>
                {userId ?? '— login to see your key —'}
              </span>
              {userId && (
                <button
                  onClick={handleCopyKey}
                  style={{
                    background: copiedKey ? '#00ff8820' : '#1a1a1a',
                    border: `1px solid ${copiedKey ? '#00ff8840' : '#333'}`,
                    color: copiedKey ? '#00ff88' : '#666',
                    borderRadius: 4,
                    padding: '4px 10px',
                    fontFamily: 'monospace',
                    fontSize: 11,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s',
                  }}
                >
                  {copiedKey ? 'Copied ✓' : 'Copy'}
                </button>
              )}
            </div>
          </div>

          {/* Wallet */}
          <div style={{ marginBottom: 16 }}>
            <p style={{ color: '#555', fontSize: 11, margin: '0 0 6px' }}>WALLET</p>
            <a
              href="https://phantom.app"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#00ff88', fontSize: 12, textDecoration: 'none' }}
            >
              Create a Solana wallet at phantom.app →
            </a>
          </div>

          {/* Network */}
          <div>
            <p style={{ color: '#555', fontSize: 11, margin: '0 0 6px' }}>NETWORK</p>
            <span style={{ fontSize: 12, color: '#ccc' }}>Solana Devnet</span>
            <span style={{ fontSize: 11, color: '#555', marginLeft: 8 }}>(for testing — no real money)</span>
          </div>
        </Card>
      </PageContainer>
    </DashboardLayout>
  )
}
