import { redirect } from 'next/navigation'
import { createClient } from '../../../lib/supabase/server'
import PostLoginClient from './client'

export default async function PostLoginPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://api.gate402.dev'

  let defaultRedirect = '/dashboard'
  try {
    const res = await fetch(`${SERVER_URL}/api/users/me`, {
      headers: { 'x-user-id': user.id },
    })
    if (res.ok) {
      const userData = await res.json()
      if (userData.totalEndpoints === 0 && userData.totalCalls === 0) {
        defaultRedirect = '/onboarding'
      }
    }
  } catch {}

  return <PostLoginClient userId={user.id} defaultRedirect={defaultRedirect} />
}
