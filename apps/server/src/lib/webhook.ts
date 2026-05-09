import crypto from 'crypto'

interface WebhookPayload {
  event: 'payment.confirmed'
  endpoint: string
  amount: number
  currency: 'USDC'
  network: string
  txHash: string
  payerWallet?: string
  timestamp: string
}

export async function sendWebhook(
  url: string,
  secret: string | null,
  payload: WebhookPayload
) {
  const body = JSON.stringify(payload)

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'User-Agent': 'Gate402-Webhook/1.0',
    'X-Gate402-Event': payload.event,
    'X-Gate402-Timestamp': payload.timestamp,
  }

  // Assina o payload com HMAC SHA256 se tiver secret
  if (secret) {
    const signature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex')
    headers['X-Gate402-Signature'] = `sha256=${signature}`
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10_000) // 10s timeout

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body,
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (!res.ok) {
      console.error(`[webhook] Failed — ${url} returned ${res.status}`)
    } else {
      console.log(`[webhook] Delivered to ${url} — ${res.status}`)
    }
  } catch (error) {
    clearTimeout(timeout)
    console.error(`[webhook] Error delivering to ${url}:`, error)
    // Não lança erro — webhook falhou mas pagamento foi confirmado
  }
}
