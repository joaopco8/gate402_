'use client'

import * as React from 'react'
import { useState, useRef, useEffect, useCallback } from 'react'
import { createClient } from '../../../../lib/supabase/client'
import {
  Card, CardHeader, CardTitle, CardDescription,
  CardContent, CardFooter
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Mail, ArrowLeft } from 'lucide-react'

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

export default function ResetPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const supabase = createClient()

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  return (
    <section className="fixed inset-0 text-zinc-50" style={{ backgroundColor: '#111111' }}>
      <style>{`
        .card-animate{opacity:0;transform:translateY(20px);animation:fadeUp 0.8s cubic-bezier(.22,.61,.36,1) 0.4s forwards}
        @keyframes fadeUp{to{opacity:1;transform:translateY(0)}}
      `}</style>

      <InteractiveDots />

      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1, background: 'linear-gradient(to bottom, transparent 0%, #111111 90%), radial-gradient(ellipse at center, transparent 40%, #111111 95%)' }} />

      <a href="/" style={{ position: 'absolute', top: 20, left: 20, zIndex: 20, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 6, border: '1px solid #2a2a2a', background: 'rgba(17,17,17,0.7)', backdropFilter: 'blur(8px)', color: '#999', fontSize: 13, textDecoration: 'none', transition: 'color 0.15s, border-color 0.15s' }}
        onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#fff'; (e.currentTarget as HTMLAnchorElement).style.borderColor = '#444' }}
        onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#999'; (e.currentTarget as HTMLAnchorElement).style.borderColor = '#2a2a2a' }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        Home
      </a>

      <div className="h-full w-full grid place-items-center px-4" style={{ position: 'relative', zIndex: 10 }}>
      <Card className="card-animate w-full max-w-sm border-zinc-800 bg-zinc-900/70 backdrop-blur">
        <CardHeader className="space-y-1 pb-2">
          <CardTitle className="text-2xl">Reset password</CardTitle>
          <CardDescription className="text-zinc-400">
            Enter your email and we&apos;ll send you a reset link.
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-4">
          {success ? (
            <div className="text-sm text-green-400 bg-green-400/10 border border-green-400/20 rounded-md px-4 py-3">
              Check your email for a reset link.
            </div>
          ) : (
            <form onSubmit={handleReset} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="reset-email" className="text-zinc-300">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="pl-10 bg-zinc-950 border-zinc-800 text-zinc-50 placeholder:text-zinc-600"
                  />
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
                {loading ? 'Sending...' : 'Send reset link'}
              </Button>
            </form>
          )}
        </CardContent>

        <CardFooter className="flex items-center justify-center">
          <a
            href="/auth/login"
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to sign in
          </a>
        </CardFooter>
      </Card>
      </div>
    </section>
  )
}
