import { NextResponse } from 'next/server'
import { createClient } from '../../../../lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const intent = searchParams.get('intent') || ''
  const type = searchParams.get('type') || ''
  const defaultNext = type === 'recovery' ? '/auth/update-password' : '/post-login'
  const next = searchParams.get('next') || defaultNext

  if (code) {
    const supabase = await createClient()
    const { error, data } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Sync user for non-recovery flows (signup confirmation, magic link, etc.)
      if (data.user && type !== 'recovery') {
        const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001'
        try {
          await fetch(`${SERVER_URL}/api/users/sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ supabaseId: data.user.id, email: data.user.email }),
          })
        } catch {}
      }

      const redirectUrl = intent
        ? `${origin}${next}?intent=${intent}`
        : `${origin}${next}`
      return NextResponse.redirect(redirectUrl)
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=callback_failed`)
}
