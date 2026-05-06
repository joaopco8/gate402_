import { NextResponse } from 'next/server'
import { createClient } from '../../../../lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { error, data } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001'}/api/endpoints`,
          { headers: { 'x-user-id': data.user.id } }
        )
        const endpoints = await res.json()

        if (!endpoints || endpoints.length === 0) {
          return NextResponse.redirect(`${origin}/onboarding`)
        }
      } catch {
        return NextResponse.redirect(`${origin}/onboarding`)
      }

      return NextResponse.redirect(`${origin}/dashboard`)
    }
  }

  return NextResponse.redirect(`${origin}/login`)
}
