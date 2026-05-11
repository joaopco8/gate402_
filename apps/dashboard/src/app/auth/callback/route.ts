import { NextResponse } from 'next/server'
import { createClient } from '../../../../lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next')

  if (code) {
    const supabase = await createClient()
    const { error, data } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001'

      try {
        // Ensure user record exists
        await fetch(`${SERVER_URL}/api/users/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ supabaseId: data.user.id, email: data.user.email }),
        })

        // Checkout intent: call billing API server-side and redirect straight to Stripe
        if (next === 'checkout_pro') {
          const checkoutRes = await fetch(`${SERVER_URL}/api/billing/checkout`, {
            method: 'POST',
            headers: { 'x-user-id': data.user.id },
          })
          const checkoutData = await checkoutRes.json()
          if (checkoutData.url) {
            return NextResponse.redirect(checkoutData.url)
          }
          // Already pro or error — fall through to dashboard
          return NextResponse.redirect(`${origin}/dashboard`)
        }

        // Fetch user profile to decide where to redirect
        const res = await fetch(`${SERVER_URL}/api/users/me`, {
          headers: { 'x-user-id': data.user.id },
        })

        if (res.ok) {
          const user = await res.json()
          if (user.totalEndpoints === 0 && user.totalCalls === 0) {
            return NextResponse.redirect(`${origin}/onboarding`)
          }
          return NextResponse.redirect(`${origin}/dashboard`)
        }
      } catch {
        // Fall through to onboarding on any error
      }

      return NextResponse.redirect(`${origin}/onboarding`)
    }
  }

  return NextResponse.redirect(`${origin}/login`)
}
