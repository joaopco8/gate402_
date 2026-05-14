export interface SpendingPolicy {
  name: string
  condition: (endpoint: string, amount: number) => boolean
  action: 'allow' | 'block'
  limit?: number
}

export interface Gate402AgentConfig {
  privateKey: string
  network?: 'devnet' | 'mainnet'
  rpcUrl?: string
  limits?: SpendingLimits
  policies?: SpendingPolicy[]
  paymentTimeout?: number
  debug?: boolean
}

export interface SpendingLimits {
  maxPerCall?: number
  maxPerDay?: number
  maxPerHour?: number
  blockedEndpoints?: string[]
  allowedEndpoints?: string[]
}

export interface PaymentRequired402 {
  error: string
  price: {
    total: number
    currency: string
    network: string
  }
  splits?: {
    provider: { wallet: string; amount: number }
    platform: { wallet: string; amount: number }
  }
  payTo?: string
  endpoint?: string
}

export interface PaymentResult {
  success: boolean
  txHashProvider?: string
  txHashPlatform?: string
  totalPaid: number
  error?: string
}

export interface SpendingLog {
  timestamp: Date
  endpoint: string
  amount: number
  txHash: string
  success: boolean
  meteringCost?: number
}
