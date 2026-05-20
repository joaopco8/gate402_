'use client'

import * as React from 'react'
import { useState, useRef, useEffect, useCallback } from 'react'
import { createClient } from '../../../../lib/supabase/client'
import { useRouter } from 'next/navigation'
import {
  Card, CardHeader, CardTitle, CardDescription,
  CardContent
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react'

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  )
}

interface Dot {
  x: number; y: number; baseColor: string
  targetOpacity: number; currentOpacity: number; opacitySpeed: number
  baseRadius: number; currentRadius: number
}

function InteractiveDots() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number | null>(null)
  const dotsRef = useRef<Dot[]>([])
  const gridRef = useRef<Record<string, number[]>>({})
  const sizeRef = useRef({ width: 0, height: 0 })
  const mouseRef = useRef<{ x: number | null; y: number | null }>({ x: null, y: null })

  const DOT_SPACING = 25
  const BASE_MIN = 0.40; const BASE_MAX = 0.50; const BASE_R = 1
  const IR = 150; const IR_SQ = IR * IR
  const GRID_CELL = Math.max(50, Math.floor(IR / 1.5))

  const createDots = useCallback(() => {
    const { width, height } = sizeRef.current
    if (!width || !height) return
    const dots: Dot[] = []; const grid: Record<string, number[]> = {}
    const cols = Math.ceil(width / DOT_SPACING); const rows = Math.ceil(height / DOT_SPACING)
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const x = i * DOT_SPACING + DOT_SPACING / 2
        const y = j * DOT_SPACING + DOT_SPACING / 2
        const key = `${Math.floor(x / GRID_CELL)}_${Math.floor(y / GRID_CELL)}`
        if (!grid[key]) grid[key] = []
        grid[key].push(dots.length)
        const op = Math.random() * (BASE_MAX - BASE_MIN) + BASE_MIN
        dots.push({ x, y, baseColor: `rgba(87,220,205,${BASE_MAX})`, targetOpacity: op, currentOpacity: op, opacitySpeed: Math.random() * 0.005 + 0.002, baseRadius: BASE_R, currentRadius: BASE_R })
      }
    }
    dotsRef.current = dots; gridRef.current = grid
  }, [DOT_SPACING, GRID_CELL, BASE_MIN, BASE_MAX, BASE_R])

  const handleResize = useCallback(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const w = canvas.parentElement?.clientWidth ?? window.innerWidth
    const h = canvas.parentElement?.clientHeight ?? window.innerHeight
    canvas.width = w; canvas.height = h
    sizeRef.current = { width: w, height: h }
    createDots()
  }, [createDots])

  const animate = useCallback(() => {
    const canvas = canvasRef.current; const ctx = canvas?.getContext('2d')
    const dots = dotsRef.current; const grid = gridRef.current
    const { width, height } = sizeRef.current; const { x: mx, y: my } = mouseRef.current
    if (!ctx || !width || !height) { rafRef.current = requestAnimationFrame(animate); return }
    ctx.clearRect(0, 0, width, height)
    const active = new Set<number>()
    if (mx !== null && my !== null) {
      const cx = Math.floor(mx / GRID_CELL); const cy = Math.floor(my / GRID_CELL)
      const sr = Math.ceil(IR / GRID_CELL)
      for (let i = -sr; i <= sr; i++) for (let j = -sr; j <= sr; j++) {
        const k = `${cx + i}_${cy + j}`; grid[k]?.forEach(idx => active.add(idx))
      }
    }
    dots.forEach((dot, idx) => {
      dot.currentOpacity += dot.opacitySpeed
      if (dot.currentOpacity >= dot.targetOpacity || dot.currentOpacity <= BASE_MIN) {
        dot.opacitySpeed = -dot.opacitySpeed
        dot.currentOpacity = Math.max(BASE_MIN, Math.min(dot.currentOpacity, BASE_MAX))
        dot.targetOpacity = Math.random() * (BASE_MAX - BASE_MIN) + BASE_MIN
      }
      let factor = 0; dot.currentRadius = dot.baseRadius
      if (mx !== null && my !== null && active.has(idx)) {
        const dx = dot.x - mx; const dy = dot.y - my; const dSq = dx * dx + dy * dy
        if (dSq < IR_SQ) { const d = Math.sqrt(dSq); factor = (1 - d / IR) ** 2 }
      }
      const m = dot.baseColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
      ctx.beginPath()
      ctx.fillStyle = `rgba(${m?.[1] ?? 87},${m?.[2] ?? 220},${m?.[3] ?? 205},${Math.min(1, dot.currentOpacity + factor * 0.6).toFixed(3)})`
      ctx.arc(dot.x, dot.y, dot.baseRadius + factor * 2.5, 0, Math.PI * 2)
      ctx.fill()
    })
    rafRef.current = requestAnimationFrame(animate)
  }, [GRID_CELL, IR, IR_SQ, BASE_MIN, BASE_MAX])

  useEffect(() => {
    handleResize()
    const onMove = (e: MouseEvent) => {
      const canvas = canvasRef.current; if (!canvas) return
      const r = canvas.getBoundingClientRect()
      mouseRef.current = { x: e.clientX - r.left, y: e.clientY - r.top }
    }
    const onLeave = () => { mouseRef.current = { x: null, y: null } }
    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('resize', handleResize)
    document.documentElement.addEventListener('mouseleave', onLeave)
    rafRef.current = requestAnimationFrame(animate)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('resize', handleResize)
      document.documentElement.removeEventListener('mouseleave', onLeave)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [handleResize, animate])

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', opacity: 0.8 }} />
}

export default function AuthPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [tab, setTab] = useState<'login' | 'signup'>('login')

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [signupConfirm, setSignupConfirm] = useState('')
  const [signupName, setSignupName] = useState('')

  const supabase = createClient()
  const router = useRouter()

  // Persist intent from URL into sessionStorage so it survives async auth flow
  useEffect(() => {
    const intent = new URLSearchParams(window.location.search).get('intent')
    if (intent) sessionStorage.setItem('gate402_intent', intent)
  }, [])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
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
    setLoading(true)
    setError(null)

    if (signupPassword !== signupConfirm) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (signupPassword.length < 8) {
      setError('Password must be at least 8 characters')
      setLoading(false)
      return
    }

    const { error, data } = await supabase.auth.signUp({
      email: signupEmail,
      password: signupPassword,
      options: { data: { full_name: signupName } }
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

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
    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <section className="fixed inset-0 text-zinc-50" style={{ backgroundColor: '#111111' }}>
      <style>{`
        .card-animate{opacity:0;transform:translateY(20px);animation:fadeUp 0.8s cubic-bezier(.22,.61,.36,1) 0.4s forwards}
        @keyframes fadeUp{to{opacity:1;transform:translateY(0)}}
      `}</style>

      <InteractiveDots />

      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1, background: 'linear-gradient(to bottom, transparent 0%, #111111 90%), radial-gradient(ellipse at center, transparent 40%, #111111 95%)' }} />

      <a href="/" style={{ position: 'absolute', top: 20, left: 20, zIndex: 20, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: '1px solid #2a2a2a', background: 'rgba(17,17,17,0.7)', backdropFilter: 'blur(8px)', color: '#999', fontSize: 13, textDecoration: 'none', transition: 'color 0.15s, border-color 0.15s' }}
        onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#fff'; (e.currentTarget as HTMLAnchorElement).style.borderColor = '#444' }}
        onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#999'; (e.currentTarget as HTMLAnchorElement).style.borderColor = '#2a2a2a' }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        Home
      </a>

      <div className="h-full w-full grid place-items-center px-4" style={{ position: 'relative', zIndex: 10 }}>
        <Card className="card-animate w-full max-w-sm border-zinc-800 bg-zinc-900/70 backdrop-blur">

          <CardHeader className="space-y-1 pb-2">
<CardTitle className="text-2xl">
              {tab === 'login' ? 'Welcome back' : 'Create account'}
            </CardTitle>
            <CardDescription className="text-zinc-400">
              {tab === 'login'
                ? 'Sign in to your Gate402 account'
                : 'Start monetizing your API in minutes'}
            </CardDescription>
          </CardHeader>

          <CardContent className="grid gap-4">
            <Tabs
              value={tab}
              onValueChange={(v) => {
                setTab(v as 'login' | 'signup')
                setError(null)
                setSuccess(null)
              }}
            >
              <TabsList className="w-full bg-zinc-950 border border-zinc-800">
                <TabsTrigger
                  value="login"
                  className="flex-1 data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-50"
                >
                  Sign in
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="flex-1 data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-50"
                >
                  Sign up
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="grid gap-4 mt-4">
                  <div className="grid gap-2">
                    <Label htmlFor="login-email" className="text-zinc-300">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="you@example.com"
                        required
                        value={loginEmail}
                        onChange={e => setLoginEmail(e.target.value)}
                        className="pl-10 bg-zinc-950 border-zinc-800 text-zinc-50 placeholder:text-zinc-600"
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="login-password" className="text-zinc-300">Password</Label>
                      <a href="/auth/reset" className="text-xs text-zinc-400 hover:text-zinc-200">
                        Forgot password?
                      </a>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                      <Input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        required
                        value={loginPassword}
                        onChange={e => setLoginPassword(e.target.value)}
                        className="pl-10 pr-10 bg-zinc-950 border-zinc-800 text-zinc-50 placeholder:text-zinc-600"
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-zinc-400 hover:text-zinc-200"
                        onClick={() => setShowPassword(v => !v)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-md px-3 py-2">
                      {error}
                    </p>
                  )}

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-10 rounded-lg bg-zinc-50 text-zinc-900 hover:bg-zinc-200 font-medium"
                  >
                    {loading ? 'Signing in...' : 'Sign in'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="grid gap-4 mt-4">
                  <div className="grid gap-2">
                    <Label htmlFor="signup-name" className="text-zinc-300">Full name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="João Camargo"
                        value={signupName}
                        onChange={e => setSignupName(e.target.value)}
                        className="pl-10 bg-zinc-950 border-zinc-800 text-zinc-50 placeholder:text-zinc-600"
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="signup-email" className="text-zinc-300">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="you@example.com"
                        required
                        value={signupEmail}
                        onChange={e => setSignupEmail(e.target.value)}
                        className="pl-10 bg-zinc-950 border-zinc-800 text-zinc-50 placeholder:text-zinc-600"
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="signup-password" className="text-zinc-300">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                      <Input
                        id="signup-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Min. 8 characters"
                        required
                        value={signupPassword}
                        onChange={e => setSignupPassword(e.target.value)}
                        className="pl-10 pr-10 bg-zinc-950 border-zinc-800 text-zinc-50 placeholder:text-zinc-600"
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-zinc-400 hover:text-zinc-200"
                        onClick={() => setShowPassword(v => !v)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="signup-confirm" className="text-zinc-300">Confirm password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                      <Input
                        id="signup-confirm"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        required
                        value={signupConfirm}
                        onChange={e => setSignupConfirm(e.target.value)}
                        className="pl-10 pr-10 bg-zinc-950 border-zinc-800 text-zinc-50 placeholder:text-zinc-600"
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-zinc-400 hover:text-zinc-200"
                        onClick={() => setShowConfirmPassword(v => !v)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-md px-3 py-2">
                      {error}
                    </p>
                  )}

                  {success && (
                    <p className="text-xs text-green-400 bg-green-400/10 border border-green-400/20 rounded-md px-3 py-2">
                      {success}
                    </p>
                  )}

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-10 rounded-lg bg-zinc-50 text-zinc-900 hover:bg-zinc-200 font-medium"
                  >
                    {loading ? 'Creating account...' : 'Create account'}
                  </Button>

                  <p className="text-xs text-zinc-500 text-center">
                    By creating an account you agree to our{' '}
                    <a href="/terms" className="text-zinc-400 hover:text-zinc-200">Terms</a>
                    {' '}and{' '}
                    <a href="/privacy" className="text-zinc-400 hover:text-zinc-200">Privacy Policy</a>
                  </p>
                </form>
              </TabsContent>
            </Tabs>

            <div className="relative">
              <Separator className="bg-zinc-800" />
              <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-zinc-900/70 px-2 text-[11px] uppercase tracking-widest text-zinc-500">
                or
              </span>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleGitHub}
              disabled={loading}
              className="w-full h-10 rounded-lg border-zinc-800 bg-zinc-950 text-zinc-50 hover:bg-zinc-900/80"
            >
              <GithubIcon className="h-4 w-4 mr-2" />
              Continue with GitHub
            </Button>
          </CardContent>

        </Card>
      </div>
    </section>
  )
}
