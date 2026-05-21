'use client'
import { useState } from 'react'
import { createClient } from '../../../../lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setTimeout(() => router.push('/dashboard'), 2000)
  }

  return (
    <section style={{
      minHeight: '100vh',
      background: '#000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      fontFamily: 'Space Grotesk, sans-serif',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 400,
        background: '#0a0a0a',
        border: '1px solid #1a1a1a',
        borderRadius: 12,
        padding: 32,
      }}>
        <div style={{ fontSize: 18, fontWeight: 600, color: '#fff', marginBottom: 4 }}>
          gate<span style={{ color: '#00bc7d' }}>402</span>
        </div>

        <div style={{
          fontFamily: 'monospace',
          fontSize: 10,
          color: '#f59e0b',
          background: 'rgba(245,158,11,0.1)',
          border: '1px solid rgba(245,158,11,0.2)',
          borderRadius: 3,
          padding: '2px 8px',
          display: 'inline-block',
          letterSpacing: '0.1em',
          marginBottom: 32,
        }}>
          PASSWORD RESET
        </div>

        {success ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{
              width: 48, height: 48,
              borderRadius: '50%',
              background: 'rgba(0,188,125,0.1)',
              border: '1px solid rgba(0,188,125,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 10l4 4 8-8" stroke="#00bc7d" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 8 }}>
              Password updated
            </div>
            <div style={{ fontSize: 13, color: '#555' }}>
              Redirecting to dashboard...
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 20 }}>
              <label style={{
                display: 'block',
                fontFamily: 'monospace',
                fontSize: 11,
                color: '#444',
                letterSpacing: '0.08em',
                textTransform: 'uppercase' as const,
                marginBottom: 8,
              }}>
                New password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                required
                style={{
                  width: '100%',
                  background: '#000',
                  border: '1px solid #1a1a1a',
                  borderRadius: 6,
                  padding: '10px 14px',
                  fontFamily: 'monospace',
                  fontSize: 13,
                  color: '#fff',
                  outline: 'none',
                  boxSizing: 'border-box' as const,
                }}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{
                display: 'block',
                fontFamily: 'monospace',
                fontSize: 11,
                color: '#444',
                letterSpacing: '0.08em',
                textTransform: 'uppercase' as const,
                marginBottom: 8,
              }}>
                Confirm password
              </label>
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Repeat password"
                required
                style={{
                  width: '100%',
                  background: '#000',
                  border: '1px solid #1a1a1a',
                  borderRadius: 6,
                  padding: '10px 14px',
                  fontFamily: 'monospace',
                  fontSize: 13,
                  color: '#fff',
                  outline: 'none',
                  boxSizing: 'border-box' as const,
                }}
              />
            </div>

            {error && (
              <div style={{
                padding: '10px 14px',
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: 6,
                fontFamily: 'monospace',
                fontSize: 12,
                color: '#ef4444',
                marginBottom: 16,
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                background: loading ? 'rgba(0,188,125,0.5)' : '#00bc7d',
                color: '#000',
                border: 'none',
                borderRadius: 6,
                fontFamily: 'monospace',
                fontSize: 13,
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Updating...' : 'Update password →'}
            </button>
          </form>
        )}

        <div style={{
          marginTop: 24,
          textAlign: 'center',
          fontFamily: 'monospace',
          fontSize: 11,
          color: '#333',
        }}>
          <a href="/auth/login" style={{ color: '#555', textDecoration: 'none' }}>
            ← Back to sign in
          </a>
        </div>
      </div>
    </section>
  )
}
