'use client'

import { useEffect, useState } from 'react'

declare global {
  interface Window {
    MoonPayWebSdk: any
  }
}

interface UseMoonPayOptions {
  walletAddress: string
  amount?: string
}

export function useMoonPay() {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (document.getElementById('moonpay-sdk')) {
      if (window.MoonPayWebSdk) setLoaded(true)
      return
    }
    const script = document.createElement('script')
    script.id = 'moonpay-sdk'
    script.src = 'https://static.moonpay.com/web-sdk/v1/moonpay-web-sdk.min.js'
    script.defer = true
    script.onload = () => setLoaded(true)
    document.head.appendChild(script)
  }, [])

  async function openWidget({ walletAddress, amount = '50' }: UseMoonPayOptions) {
    if (!loaded || !window.MoonPayWebSdk) {
      console.error('MoonPay SDK not loaded')
      return
    }

    const apiKey = process.env.NEXT_PUBLIC_MOONPAY_API_KEY
    if (!apiKey) {
      console.error('MoonPay API key not configured')
      return
    }

    const params = new URLSearchParams({
      apiKey,
      currencyCode: 'usdc_sol',
      walletAddress,
      baseCurrencyAmount: amount,
      colorCode: '%237AF279',
      theme: 'dark',
    })

    const baseUrl = `https://buy-sandbox.moonpay.com?${params.toString()}`

    let signature = ''
    try {
      const API_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://api.gate402.dev'
      const res = await fetch(`${API_URL}/api/moonpay/sign-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: baseUrl }),
      })
      const data = await res.json()
      signature = data.signature ?? ''
    } catch (e) {
      console.error('Failed to sign MoonPay URL:', e)
    }

    const widget = window.MoonPayWebSdk.init({
      flow: 'buy',
      environment: 'sandbox',
      variant: 'overlay',
      params: {
        apiKey,
        currencyCode: 'usdc_sol',
        walletAddress,
        baseCurrencyAmount: amount,
        signature,
        theme: 'dark',
        colorCode: '#7AF279',
        showAllCurrencies: true,
      },
      handlers: {
        onTransactionCompleted: (transaction: any) => {
          console.log('MoonPay transaction completed:', transaction)
          window.dispatchEvent(new CustomEvent('moonpay:completed', { detail: transaction }))
        },
        onCloseOverlay: () => {
          console.log('MoonPay widget closed')
        },
      },
    })

    widget.show()
  }

  return { openWidget, loaded }
}
