export interface Gate402Config {
  apiKey: string
  endpoints: Record<string, number>  // { "/rota": 0.001 }
  serverUrl?: string                  // default: https://api.gate402.dev
  network?: 'devnet' | 'mainnet'     // default: devnet
  walletAddress?: string             // override wallet para receber pagamentos
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
