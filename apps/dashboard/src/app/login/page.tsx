'use client'
import { createClient } from '../../../lib/supabase/client'

export default function LoginPage() {
  async function handleGitHub() {
    const supabase = createClient()
    const next = new URLSearchParams(window.location.search).get('next') || ''
    const callbackUrl = next
      ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
      : `${window.location.origin}/auth/callback`
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: callbackUrl },
    })
  }

  return (
    <div style={{
      background: '#0a0a0a',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'monospace',
      color: '#fff',
    }}>
      {/* Logo + subtitle */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <img src="/logo-gate.png" alt="Gate402" style={{ height: 52, width: 'auto', marginBottom: 16 }} />
        <p style={{ color: '#888', fontSize: 14, margin: 0 }}>
          Billing infrastructure for AI agents
        </p>
      </div>

      {/* GitHub button */}
      <button
        onClick={handleGitHub}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: '#fff',
          color: '#000',
          border: 'none',
          borderRadius: 8,
          padding: '12px 24px',
          fontSize: 15,
          fontWeight: 500,
          fontFamily: 'monospace',
          cursor: 'pointer',
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
        </svg>
        Continue with GitHub
      </button>

      {/* Footer */}
      <footer style={{
        position: 'fixed',
        bottom: 24,
        color: '#444',
        fontSize: 12,
      }}>
        x402 Protocol · Solana · May 2026
      </footer>
    </div>
  )
}
