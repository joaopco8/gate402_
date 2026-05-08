export interface Gate402Config {
  apiKey: string
  walletAddress: string
  endpoints: Record<string, number>
  network?: 'devnet' | 'mainnet'
  serverUrl?: string
}

export interface PaymentRequiredResponse {
  error: 'Payment Required'
  price: {
    amount: string
    currency: 'USDC'
    network: string
  }
  payTo: string
  endpoint: string
  instructions: string
}
