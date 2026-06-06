import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { redis } from '../lib/redis'
import { getHourBucket, getDayBucket, getMonthBucket } from '../services/spendingLimits'

const router = Router()

// ─── FETCH PROXY ─────────────────────────────────────────────────────────────
// POST /agent/:agentKey/fetch
// One-step payment proxy: detect 402 → sign → retry → return result
router.post('/:agentKey/fetch', async (req, res) => {
  try {
    const { agentKey } = req.params
    const { url, method = 'GET', body, headers = {} } = req.body

    if (!url) {
      return res.status(400).json({ error: 'url is required', code: 'MISSING_URL' })
    }

    const wallet = await prisma.agentWallet.findFirst({
      where: { agentKey, isActive: true },
      select: {
        id: true,
        walletAddress: true,
        privyWalletId: true,
        network: true,
        maxPerCall: true,
        maxPerHour: true,
        maxPerDay: true,
        maxPerMonth: true,
        allowedEndpoints: true,
        blockedEndpoints: true,
      },
    })

    if (!wallet) {
      return res.status(404).json({ error: 'Agent wallet not found or inactive', code: 'WALLET_NOT_FOUND' })
    }

    // Check blocked endpoints
    if (wallet.blockedEndpoints.length > 0) {
      const isBlocked = wallet.blockedEndpoints.some(ep => url.includes(ep))
      if (isBlocked) {
        return res.status(403).json({ error: 'Endpoint is blocked for this wallet', code: 'ENDPOINT_BLOCKED' })
      }
    }

    // Check allowed endpoints (if whitelist set)
    if (wallet.allowedEndpoints.length > 0) {
      const isAllowed = wallet.allowedEndpoints.some(ep => url.includes(ep))
      if (!isAllowed) {
        return res.status(403).json({ error: 'Endpoint not in allowed list', code: 'ENDPOINT_NOT_ALLOWED' })
      }
    }

    // Step 1 — call target
    const targetRes = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', ...headers },
      ...(body ? { body: JSON.stringify(body) } : {}),
    })

    // Step 2 — not 402, return directly
    if (targetRes.status !== 402) {
      const responseBody = await targetRes.json().catch(() => ({}))
      return res.json({
        success: true,
        response: { status: targetRes.status, body: responseBody },
        paid: false,
      })
    }

    // Step 3 — parse payment amount from headers
    // x-price header format: "0.001" (USDC amount)
    const priceHeader = targetRes.headers.get('x-price') ||
                        targetRes.headers.get('x-payment-required')
    const amount = priceHeader ? parseFloat(priceHeader) : 0.001

    // Step 4 — check spending limits
    if (wallet.maxPerCall && amount > wallet.maxPerCall) {
      return res.status(402).json({
        success: false,
        error: `Amount $${amount} exceeds per-call limit $${wallet.maxPerCall}`,
        code: 'MAX_PER_CALL_EXCEEDED',
      })
    }

    if (redis) {
      const hourKey  = `agent:${wallet.id}:spent:hour:${getHourBucket()}`
      const dayKey   = `agent:${wallet.id}:spent:day:${getDayBucket()}`
      const monthKey = `agent:${wallet.id}:spent:month:${getMonthBucket()}`

      const [hourRaw, dayRaw, monthRaw] = await Promise.all([
        redis.get(hourKey).catch(() => null),
        redis.get(dayKey).catch(() => null),
        redis.get(monthKey).catch(() => null),
      ])

      const spentHour  = parseFloat(hourRaw  || '0')
      const spentDay   = parseFloat(dayRaw   || '0')
      const spentMonth = parseFloat(monthRaw || '0')

      if (wallet.maxPerHour  && spentHour  + amount > wallet.maxPerHour) {
        return res.status(402).json({ success: false, error: 'Hourly spending limit exceeded', code: 'MAX_PER_HOUR_EXCEEDED' })
      }
      if (wallet.maxPerDay   && spentDay   + amount > wallet.maxPerDay) {
        return res.status(402).json({ success: false, error: 'Daily spending limit exceeded', code: 'MAX_PER_DAY_EXCEEDED' })
      }
      if (wallet.maxPerMonth && spentMonth + amount > wallet.maxPerMonth) {
        return res.status(402).json({ success: false, error: 'Monthly spending limit exceeded', code: 'MAX_PER_MONTH_EXCEEDED' })
      }
    }

    // Step 5 — sign payment via Privy
    // TODO: implement real Solana USDC transfer via Privy server wallet
    // For now: mock txHash — replace with actual Privy signing in Phase 5
    const txHash = `mock_${wallet.id}_${Date.now()}`

    // Step 6 — retry with payment proof
    const paidRes = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'x-payment-signature': txHash,
        'x-payment-amount': amount.toString(),
        'x-payment-token': 'USDC',
        ...headers,
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    })

    const paidBody = await paidRes.json().catch(() => ({}))

    // Step 7 — record spending on success
    if (paidRes.status === 200 && redis) {
      const hourKey  = `agent:${wallet.id}:spent:hour:${getHourBucket()}`
      const dayKey   = `agent:${wallet.id}:spent:day:${getDayBucket()}`
      const monthKey = `agent:${wallet.id}:spent:month:${getMonthBucket()}`

      const newHour  = parseFloat(await redis.get(hourKey).catch(() => null)  || '0') + amount
      const newDay   = parseFloat(await redis.get(dayKey).catch(() => null)   || '0') + amount
      const newMonth = parseFloat(await redis.get(monthKey).catch(() => null) || '0') + amount

      await Promise.all([
        redis.setex(hourKey,  3600,       newHour.toString()),
        redis.setex(dayKey,   86400,      newDay.toString()),
        redis.setex(monthKey, 86400 * 31, newMonth.toString()),
      ]).catch(() => {})

      // Update DB totals async — don't block response
      prisma.agentWallet.update({
        where: { id: wallet.id },
        data: {
          totalCalls: { increment: 1 },
          totalSpent: { increment: amount },
          lastCallAt: new Date(),
        },
      }).catch(err => console.error('[agentProxy] db update error:', err))
    }

    return res.json({
      success: true,
      response: { status: paidRes.status, body: paidBody },
      payment: {
        amount: amount.toString(),
        token: 'USDC',
        chain: 'solana',
        txHash,
      },
      paid: true,
    })

  } catch (error) {
    console.error('[agentProxy] fetch error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// ─── BALANCE ─────────────────────────────────────────────────────────────────
// GET /agent/:agentKey/balance
router.get('/:agentKey/balance', async (req, res) => {
  try {
    const { agentKey } = req.params

    const wallet = await prisma.agentWallet.findFirst({
      where: { agentKey, isActive: true },
      select: { walletAddress: true, totalSpent: true, totalCalls: true, network: true },
    })

    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found', code: 'NOT_FOUND' })
    }

    let usdcBalance = '0'
    try {
      const heliusUrl = `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`
      const balRes = await fetch(heliusUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0', id: 1,
          method: 'getTokenAccountsByOwner',
          params: [
            wallet.walletAddress,
            { mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' },
            { encoding: 'jsonParsed' },
          ],
        }),
      })
      const data = await balRes.json() as any
      const accounts = data?.result?.value || []
      if (accounts.length > 0) {
        usdcBalance = accounts[0].account.data.parsed.info.tokenAmount.uiAmount?.toString() || '0'
      }
    } catch { /* continue with 0 */ }

    return res.json({
      walletAddress: wallet.walletAddress,
      balance: { usdc: usdcBalance, currency: 'USDC', chain: 'solana' },
      stats: { totalCalls: wallet.totalCalls, totalSpent: wallet.totalSpent },
    })

  } catch (error) {
    console.error('[agentProxy] balance error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
