import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '../../../lib/supabase/server'

export default async function PostLoginPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const cookieStore = await cookies()
  const intent = cookieStore.get('gate402_intent')?.value
  const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://api.gate402.dev'

  // If checkout intent was set before login, call billing API and redirect to Stripe
  if (intent === 'checkout') {
    try {
      const res = await fetch(`${SERVER_URL}/api/billing/checkout`, {
        method: 'POST',
        headers: { 'x-user-id': user.id },
      })
      const data = await res.json()
      if (data.url) {
        // Clear the intent cookie and redirect to Stripe
        redirect(data.url)
      }
    } catch {}
  }

  // No intent — decide based on user profile
  try {
    const res = await fetch(`${SERVER_URL}/api/users/me`, {
      headers: { 'x-user-id': user.id },
    })
    if (res.ok) {
      const userData = await res.json()
      if (userData.totalEndpoints === 0 && userData.totalCalls === 0) {
        redirect('/onboarding')
      }
    }
  } catch {}

  redirect('/dashboard')
}
