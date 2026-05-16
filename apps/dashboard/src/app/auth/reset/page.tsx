'use client'

import * as React from 'react'
import { useState } from 'react'
import { createClient } from '../../../../lib/supabase/client'
import {
  Card, CardHeader, CardTitle, CardDescription,
  CardContent, CardFooter
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Mail, ArrowLeft } from 'lucide-react'

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
    <section className="fixed inset-0 bg-zinc-950 text-zinc-50 grid place-items-center px-4">
      <style>{`
        .card-animate{opacity:0;transform:translateY(20px);animation:fadeUp 0.8s cubic-bezier(.22,.61,.36,1) 0.2s forwards}
        @keyframes fadeUp{to{opacity:1;transform:translateY(0)}}
      `}</style>

      <div className="absolute inset-0 pointer-events-none [background:radial-gradient(80%_60%_at_50%_30%,rgba(255,255,255,0.06),transparent_60%)]" />

      <header className="absolute left-0 right-0 top-0 flex items-center px-6 py-4 border-b border-zinc-800/80">
        <a href="/" className="text-sm font-semibold tracking-tight text-zinc-50">gate402</a>
      </header>

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
    </section>
  )
}
