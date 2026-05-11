'use client'

import { useEffect } from 'react'

export default function PostLoginClient({
  userId,
  defaultRedirect,
}: {
  userId: string
  defaultRedirect: string
}) {
  useEffect(() => {
    const intent = localStorage.getItem('gate402_intent')
    localStorage.removeItem('gate402_intent')

    if (intent === 'checkout') {
      const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://api.gate402.dev'
      fetch(`${SERVER_URL}/api/billing/checkout`, {
        method: 'POST',
        headers: { 'x-user-id': userId },
      })
        .then(res => res.json())
        .then(data => {
          window.location.href = data.url || '/dashboard'
        })
        .catch(() => {
          window.location.href = '/dashboard'
        })
    } else {
      window.location.href = defaultRedirect
    }
  }, [userId, defaultRedirect])

  return (
    <div style={{
      background: '#000',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'monospace',
      color: '#555',
      fontSize: 13,
    }}>
      Loading...
    </div>
  )
}
