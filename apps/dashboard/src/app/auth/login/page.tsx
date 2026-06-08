'use client'

import * as React from 'react'
import { useState, useEffect } from 'react'
import { createClient } from '../../../../lib/supabase/client'
import { useRouter } from 'next/navigation'
import { DitheringShader } from '../../../components/v2/dithering-shader'
import '../../../styles/v2/tokens.css'

// ─── Tokens ───────────────────────────────────────────────────────────────────

const BG    = '#1B1E1B'
const CARD  = 'rgba(27,30,27,0.82)'
const LINE  = '1px solid #2A2E2A'
const TEXT  = '#E8F4EE'
const MUTED = '#7A8C79'
const DIM   = '#4A5549'
const GREEN = '#7AF279'
const RED   = '#f87171'
const SANS  = "'Inter', sans-serif"
const MONO  = "'JetBrains Mono', monospace"

// ─── Input ────────────────────────────────────────────────────────────────────

function Field({
  id, label, type, placeholder, value, onChange, right, extra,
}: {
  id: string; label: string; type: string; placeholder: string
  value: string; onChange: (v: string) => void
  right?: React.ReactNode; extra?: React.ReactNode
}) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label htmlFor={id} style={{ fontSize: 12, color: MUTED, fontFamily: SANS, fontWeight: 300 }}>{label}</label>
        {extra}
      </div>
      <div style={{ position: 'relative' }}>
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          required
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%', boxSizing: 'border-box',
            background: 'rgba(0,0,0,0.35)',
            border: `1px solid ${focused ? '#4A5549' : '#2A2E2A'}`,
            borderRadius: 6,
            padding: right ? '10px 40px 10px 12px' : '10px 12px',
            fontSize: 14, color: TEXT, fontFamily: SANS, fontWeight: 300,
            outline: 'none', transition: 'border-color 0.15s',
          }}
        />
        {right && (
          <div style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)' }}>
            {right}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── GitHub icon ──────────────────────────────────────────────────────────────

function GithubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  )
}

function EyeIcon({ off }: { off?: boolean }) {
  return off
    ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
    : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AuthPage() {
  const [tab,                setTab]                = useState<'login' | 'signup'>('login')
  const [showPassword,       setShowPassword]       = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading,            setLoading]            = useState(false)
  const [error,              setError]              = useState<string | null>(null)
  const [success,            setSuccess]            = useState<string | null>(null)
  const [shaderReady,        setShaderReady]        = useState(true)

  const [loginEmail,    setLoginEmail]    = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  const [signupEmail,    setSignupEmail]    = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [signupConfirm,  setSignupConfirm]  = useState('')
  const [signupName,     setSignupName]     = useState('')

  const supabase = createClient()
  const router   = useRouter()

  useEffect(() => {
    const intent = new URLSearchParams(window.location.search).get('intent')
    if (intent) sessionStorage.setItem('gate402_intent', intent)
    return () => {}
  }, [])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword })
    if (error) {
      if (error.message.includes('Invalid login credentials'))
        setError('Invalid email or password. If you signed up recently, confirm your email first.')
      else if (error.message.includes('Email not confirmed'))
        setError('Please confirm your email before signing in. Check your inbox.')
      else
        setError(error.message)
      setLoading(false); return
    }
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supabaseId: user.id, email: user.email })
      })
    }
    const intent = sessionStorage.getItem('gate402_intent') || new URLSearchParams(window.location.search).get('intent')
    sessionStorage.removeItem('gate402_intent')
    window.location.href = intent ? `/post-login?intent=${intent}` : '/post-login'
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError(null)
    if (signupPassword !== signupConfirm) { setError('Passwords do not match'); setLoading(false); return }
    if (signupPassword.length < 8) { setError('Password must be at least 8 characters'); setLoading(false); return }
    const { error, data } = await supabase.auth.signUp({
      email: signupEmail, password: signupPassword,
      options: { data: { full_name: signupName } }
    })
    if (error) { setError(error.message); setLoading(false); return }
    if (data.user) {
      await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supabaseId: data.user.id, email: data.user.email })
      })
    }
    setSuccess('Account created! Check your email to confirm.')
    setLoading(false)
  }

  async function handleGitHub() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    })
    if (error) { setError(error.message); setLoading(false) }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: BG, fontFamily: SANS, color: TEXT, overflow: 'hidden' }}>

      {/* ── DitheringShader background ── */}
      <DitheringShader
        shape="wave"
        type="8x8"
        colorBack={BG}
        colorFront="#BC86FF"
        pxSize={3}
        speed={0.6}
        style={{
          opacity: shaderReady ? 0.18 : 0,
          pointerEvents: 'none',
          transition: 'opacity 0.6s ease',
          position: 'absolute', inset: 0, zIndex: 0,
        }}
        onFirstFrame={() => setShaderReady(true)}
      />

      {/* ── vignette ── */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at center, transparent 40%, rgba(27,30,27,0.85) 100%)',
      }} />

      {/* ── back link ── */}
      <a href="/v2" style={{
        position: 'absolute', top: 20, left: 24, zIndex: 10,
        display: 'inline-flex', alignItems: 'center', gap: 6,
        fontSize: 13, color: MUTED, textDecoration: 'none',
        fontFamily: SANS, transition: 'color 0.15s',
      }}
        onMouseEnter={e => (e.currentTarget.style.color = TEXT)}
        onMouseLeave={e => (e.currentTarget.style.color = MUTED)}
      >
        <svg width="12" height="12" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 1L2 5.5 7 10" />
        </svg>
        Home
      </a>

      {/* ── centered card ── */}
      <div style={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
        <div style={{
          width: '100%', maxWidth: 400,
          background: CARD,
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          border: LINE,
          borderRadius: 10,
          overflow: 'hidden',
          boxShadow: '0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03)',
        }}>

          {/* header */}
          <div style={{ padding: '28px 28px 20px', borderBottom: LINE }}>
            <a href="/v2" style={{ display: 'inline-block', marginBottom: 20, textDecoration: 'none' }}>
              <img src="/logo-metera.png" alt="Metera" style={{ height: 22, width: 'auto', filter: 'brightness(0) invert(1)', display: 'block' }} />
            </a>
            <h1 style={{ fontSize: 20, fontWeight: 300, letterSpacing: '-0.03em', color: TEXT, margin: '0 0 4px', fontFamily: SANS }}>
              {tab === 'login' ? 'Welcome back' : 'Create account'}
            </h1>
            <p style={{ fontSize: 13, color: MUTED, margin: 0, fontWeight: 300, fontFamily: SANS }}>
              {tab === 'login' ? 'Sign in to your Metera account' : 'Start monetizing your API in minutes'}
            </p>
          </div>

          {/* tab switcher */}
          <div style={{ display: 'flex', borderBottom: LINE }}>
            {(['login', 'signup'] as const).map(t => (
              <button key={t} onClick={() => { setTab(t); setError(null); setSuccess(null) }}
                style={{
                  flex: 1, background: 'none', border: 'none', cursor: 'pointer',
                  padding: '10px 0',
                  fontFamily: MONO, fontSize: 12, letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: tab === t ? GREEN : DIM,
                  borderBottom: `2px solid ${tab === t ? GREEN : 'transparent'}`,
                  transition: 'color 0.15s, border-color 0.15s',
                  marginBottom: -1,
                }}
              >
                {t === 'login' ? 'Sign in' : 'Sign up'}
              </button>
            ))}
          </div>

          {/* form body */}
          <div style={{ padding: '24px 28px 28px' }}>

            {tab === 'login' ? (
              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <Field id="login-email" label="Email" type="email" placeholder="you@example.com"
                  value={loginEmail} onChange={setLoginEmail} />
                <Field id="login-password" label="Password" type={showPassword ? 'text' : 'password'} placeholder="••••••••"
                  value={loginPassword} onChange={setLoginPassword}
                  extra={
                    <a href="/auth/reset" style={{ fontSize: 12, color: MUTED, textDecoration: 'none', fontFamily: SANS, transition: 'color 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.color = TEXT)}
                      onMouseLeave={e => (e.currentTarget.style.color = MUTED)}
                    >
                      Forgot password?
                    </a>
                  }
                  right={
                    <button type="button" onClick={() => setShowPassword(v => !v)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: MUTED, display: 'flex', padding: 0, transition: 'color 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.color = TEXT)}
                      onMouseLeave={e => (e.currentTarget.style.color = MUTED)}
                    >
                      <EyeIcon off={showPassword} />
                    </button>
                  }
                />

                {error && <Alert type="error">{error}</Alert>}

                <SubmitBtn loading={loading} label="Sign in" loadingLabel="Signing in..." />
              </form>
            ) : (
              <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <Field id="signup-name" label="Full name" type="text" placeholder="Your name"
                  value={signupName} onChange={setSignupName} />
                <Field id="signup-email" label="Email" type="email" placeholder="you@example.com"
                  value={signupEmail} onChange={setSignupEmail} />
                <Field id="signup-password" label="Password" type={showPassword ? 'text' : 'password'} placeholder="Min. 8 characters"
                  value={signupPassword} onChange={setSignupPassword}
                  right={
                    <button type="button" onClick={() => setShowPassword(v => !v)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: MUTED, display: 'flex', padding: 0, transition: 'color 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.color = TEXT)}
                      onMouseLeave={e => (e.currentTarget.style.color = MUTED)}
                    >
                      <EyeIcon off={showPassword} />
                    </button>
                  }
                />
                <Field id="signup-confirm" label="Confirm password" type={showConfirmPassword ? 'text' : 'password'} placeholder="••••••••"
                  value={signupConfirm} onChange={setSignupConfirm}
                  right={
                    <button type="button" onClick={() => setShowConfirmPassword(v => !v)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: MUTED, display: 'flex', padding: 0, transition: 'color 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.color = TEXT)}
                      onMouseLeave={e => (e.currentTarget.style.color = MUTED)}
                    >
                      <EyeIcon off={showConfirmPassword} />
                    </button>
                  }
                />

                {error   && <Alert type="error">{error}</Alert>}
                {success && <Alert type="success">{success}</Alert>}

                <SubmitBtn loading={loading} label="Create account" loadingLabel="Creating account..." />

                <p style={{ fontSize: 12, color: DIM, textAlign: 'center', fontFamily: SANS, margin: 0 }}>
                  By creating an account you agree to our{' '}
                  <a href="/v2/terms"   style={{ color: MUTED, textDecoration: 'none' }}>Terms</a>
                  {' '}and{' '}
                  <a href="/v2/privacy" style={{ color: MUTED, textDecoration: 'none' }}>Privacy Policy</a>
                </p>
              </form>
            )}

            {/* divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '20px 0' }}>
              <div style={{ flex: 1, height: 1, background: '#2A2E2A' }} />
              <span style={{ fontSize: 10, fontFamily: MONO, color: DIM, letterSpacing: '0.1em', textTransform: 'uppercase' }}>or</span>
              <div style={{ flex: 1, height: 1, background: '#2A2E2A' }} />
            </div>

            {/* GitHub */}
            <button type="button" onClick={handleGitHub} disabled={loading}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                background: 'rgba(255,255,255,0.05)', border: LINE, borderRadius: 6,
                padding: '10px 0', cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: 13, fontFamily: SANS, color: TEXT, fontWeight: 400,
                transition: 'background 0.15s, border-color 0.15s',
                opacity: loading ? 0.5 : 1,
              }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = '#4A5549' } }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = '#2A2E2A' }}
            >
              <GithubIcon />
              Continue with GitHub
            </button>

          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Alert({ type, children }: { type: 'error' | 'success'; children: React.ReactNode }) {
  const color = type === 'error' ? '#f87171' : GREEN
  return (
    <div style={{ fontSize: 13, color, background: `${color}12`, border: `1px solid ${color}30`, borderRadius: 6, padding: '9px 12px', fontFamily: 'Inter, sans-serif', fontWeight: 300, lineHeight: 1.5 }}>
      {children}
    </div>
  )
}

function SubmitBtn({ loading, label, loadingLabel }: { loading: boolean; label: string; loadingLabel: string }) {
  return (
    <button type="submit" disabled={loading}
      style={{
        width: '100%', background: GREEN, border: 'none', borderRadius: 6,
        padding: '11px 0', fontSize: 14, fontFamily: 'Inter, sans-serif', fontWeight: 500,
        color: '#1B1E1B', cursor: loading ? 'not-allowed' : 'pointer',
        transition: 'opacity 0.15s', opacity: loading ? 0.65 : 1,
      }}
      onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = '0.85' }}
      onMouseLeave={e => { e.currentTarget.style.opacity = loading ? '0.65' : '1' }}
    >
      {loading ? loadingLabel : label}
    </button>
  )
}
