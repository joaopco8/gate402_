import {
  Gate402AgentConfig,
  PaymentRequired402,
  PaymentResult,
  SpendingLog,
  SpendingPolicy,
} from './types'
import {
  SpendingLimitError,
  PaymentFailedError,
  InsufficientBalanceError,
} from './errors'
import { SolanaWallet } from './wallet'

export class Gate402Agent {
  private wallet: SolanaWallet
  private config: Gate402AgentConfig
  private spendingLog: SpendingLog[] = []

  constructor(config: Gate402AgentConfig) {
    this.config = {
      network: 'devnet',
      paymentTimeout: 30000,
      debug: false,
      ...config,
    }

    this.wallet = new SolanaWallet(
      config.privateKey,
      this.config.network,
      this.config.rpcUrl
    )
  }

  private log(...args: any[]) {
    if (this.config.debug) {
      console.log('[gate402-agent]', ...args)
    }
  }

  private getSpentInWindow(windowMs: number): number {
    const since = new Date(Date.now() - windowMs)
    return this.spendingLog
      .filter(l => l.timestamp > since && l.success)
      .reduce((sum, l) => sum + l.amount, 0)
  }

  private checkLimits(amount: number, endpoint: string): void {
    const limits = this.config.limits
    if (!limits) return

    if (limits.maxPerCall && amount > limits.maxPerCall) {
      throw new SpendingLimitError(
        `Payment of ${amount} USDC exceeds maxPerCall limit of ${limits.maxPerCall} USDC`
      )
    }

    if (limits.maxPerHour) {
      const hourlySpent = this.getSpentInWindow(3600 * 1000)
      if (hourlySpent + amount > limits.maxPerHour) {
        throw new SpendingLimitError(
          `Hourly spending limit reached. Spent: ${hourlySpent}, Limit: ${limits.maxPerHour}`
        )
      }
    }

    if (limits.maxPerDay) {
      const dailySpent = this.getSpentInWindow(24 * 3600 * 1000)
      if (dailySpent + amount > limits.maxPerDay) {
        throw new SpendingLimitError(
          `Daily spending limit reached. Spent: ${dailySpent}, Limit: ${limits.maxPerDay}`
        )
      }
    }

    if (limits.blockedEndpoints?.some(e => endpoint.includes(e))) {
      throw new SpendingLimitError(`Endpoint ${endpoint} is blocked`)
    }

    if (limits.allowedEndpoints &&
        !limits.allowedEndpoints.some(e => endpoint.includes(e))) {
      throw new SpendingLimitError(`Endpoint ${endpoint} is not in allowedEndpoints`)
    }

    if (this.config.policies) {
      for (const policy of this.config.policies) {
        if (policy.condition(endpoint, amount)) {
          if (policy.action === 'block') {
            throw new SpendingLimitError(
              `Policy "${policy.name}" blocked payment of ${amount} USDC to ${endpoint}`
            )
          }
        }
      }
    }
  }

  async pay(response402: PaymentRequired402, endpoint: string): Promise<PaymentResult> {
    const totalAmount = response402.price.total

    this.log('Processing payment for', endpoint, '— amount:', totalAmount)

    this.checkLimits(totalAmount, endpoint)

    const balance = await this.wallet.getUsdcBalance()
    this.log('Current USDC balance:', balance)

    if (balance < totalAmount) {
      throw new InsufficientBalanceError(balance, totalAmount)
    }

    try {
      let txHashProvider: string
      let txHashPlatform: string | undefined

      if (response402.splits) {
        const { provider, platform } = response402.splits
        this.log('Paying split — provider:', provider.amount, 'platform:', platform.amount)

        const result = await this.wallet.sendSplitPayment(
          provider.wallet,
          provider.amount,
          platform.wallet,
          platform.amount
        )

        txHashProvider = result.txHashProvider
        txHashPlatform = result.txHashPlatform

      } else if (response402.payTo) {
        this.log('Paying legacy format — wallet:', response402.payTo)
        txHashProvider = await this.wallet.sendUsdc(response402.payTo, totalAmount)
      } else {
        throw new PaymentFailedError('Invalid 402 response — missing splits and payTo')
      }

      this.spendingLog.push({
        timestamp: new Date(),
        endpoint,
        amount: totalAmount,
        txHash: txHashProvider,
        success: true,
      })

      this.log('Payment successful — txHash:', txHashProvider)

      return {
        success: true,
        txHashProvider,
        txHashPlatform,
        totalPaid: totalAmount,
      }

    } catch (error: any) {
      this.spendingLog.push({
        timestamp: new Date(),
        endpoint,
        amount: totalAmount,
        txHash: '',
        success: false,
      })

      throw new PaymentFailedError(`Payment failed: ${error.message}`)
    }
  }

  async fetch(url: string, options: RequestInit = {}): Promise<Response> {
    this.log('Fetching:', url)

    const response = await fetch(url, options)

    if (response.status !== 402) {
      return response
    }

    this.log('Received 402 — processing payment')

    const body402 = await response.json() as PaymentRequired402

    const paymentResult = await this.pay(body402, new URL(url).pathname)

    const paymentHeader = paymentResult.txHashPlatform
      ? `${paymentResult.txHashProvider},${paymentResult.txHashPlatform}`
      : paymentResult.txHashProvider!

    this.log('Retrying with payment header:', paymentHeader)

    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'X-Payment-Payload': paymentHeader,
        'X-Agent-Wallet': this.wallet.publicKey,
      },
    })
  }

  private extractBilling(responseBody: unknown): {
    hasBilling: boolean
    totalCost: number
    type: string
  } {
    const body = responseBody as Record<string, any>
    if (!body?._billing) return { hasBilling: false, totalCost: 0, type: '' }
    return {
      hasBilling: true,
      totalCost: body._billing.totalCost || 0,
      type: body._billing.type || 'unknown',
    }
  }

  async fetchWithMetering(url: string, options: RequestInit = {}): Promise<{
    response: Response
    data: unknown
    meteringCost?: number
  }> {
    const response = await this.fetch(url, options)
    const data = await response.json() as Record<string, unknown>

    const billing = this.extractBilling(data)

    if (billing.hasBilling && billing.totalCost > 0) {
      this.log(`Post-execution billing: ${billing.totalCost} USDC (${billing.type})`)

      const { _billing, ...cleanData } = data

      // Log metering cost against last spending entry
      const last = this.spendingLog[this.spendingLog.length - 1]
      if (last) last.meteringCost = billing.totalCost

      return { response, data: cleanData, meteringCost: billing.totalCost }
    }

    return { response, data }
  }

  async demoFetch(url: string, options: RequestInit = {}): Promise<Response> {
    this.log('Demo fetch:', url)

    const response = await fetch(url, options)

    if (response.status !== 402) {
      return response
    }

    const demoHash = `demo_agent_${Date.now()}_${Math.random().toString(36).slice(2)}`
    this.log('Demo payment hash:', demoHash)

    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'X-Payment-Payload': demoHash,
        'X-Agent-Wallet': this.wallet.publicKey,
      },
    })
  }

  getStats() {
    const successful = this.spendingLog.filter(l => l.success)
    return {
      totalCalls: this.spendingLog.length,
      successfulPayments: successful.length,
      totalSpent: successful.reduce((sum, l) => sum + l.amount, 0),
      lastHourSpent: this.getSpentInWindow(3600 * 1000),
      lastDaySpent: this.getSpentInWindow(24 * 3600 * 1000),
      meteringCosts: successful.reduce((sum, l) => sum + (l.meteringCost || 0), 0),
      walletAddress: this.wallet.publicKey,
      log: this.spendingLog,
    }
  }

  async getBalance(): Promise<number> {
    return this.wallet.getUsdcBalance()
  }
}
