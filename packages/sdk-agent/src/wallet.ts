import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
  clusterApiUrl,
} from '@solana/web3.js'
import {
  getOrCreateAssociatedTokenAccount,
  createTransferInstruction,
  getMint,
  getAccount,
} from '@solana/spl-token'

const USDC_MINT = {
  devnet: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU',
  mainnet: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
}

export class SolanaWallet {
  private keypair: Keypair
  private connection: Connection
  private network: 'devnet' | 'mainnet'

  constructor(privateKeyBase58: string, network: 'devnet' | 'mainnet' = 'devnet', rpcUrl?: string) {
    let secretKey: Uint8Array

    try {
      const bs58 = require('bs58')
      secretKey = bs58.decode(privateKeyBase58)
    } catch {
      try {
        secretKey = new Uint8Array(JSON.parse(privateKeyBase58))
      } catch {
        secretKey = Buffer.from(privateKeyBase58, 'base64')
      }
    }

    this.keypair = Keypair.fromSecretKey(secretKey)
    this.network = network

    const endpoint = rpcUrl || (
      network === 'mainnet'
        ? 'https://api.mainnet-beta.solana.com'
        : clusterApiUrl('devnet')
    )

    this.connection = new Connection(endpoint, 'confirmed')
  }

  get publicKey(): string {
    return this.keypair.publicKey.toBase58()
  }

  async getUsdcBalance(): Promise<number> {
    try {
      const mintAddress = new PublicKey(USDC_MINT[this.network])
      const tokenAccount = await getOrCreateAssociatedTokenAccount(
        this.connection,
        this.keypair,
        mintAddress,
        this.keypair.publicKey
      )
      const accountInfo = await getAccount(this.connection, tokenAccount.address)
      const mint = await getMint(this.connection, mintAddress)
      return Number(accountInfo.amount) / Math.pow(10, mint.decimals)
    } catch {
      return 0
    }
  }

  async sendUsdc(toAddress: string, amount: number): Promise<string> {
    const mintAddress = new PublicKey(USDC_MINT[this.network])
    const toPublicKey = new PublicKey(toAddress)

    const mint = await getMint(this.connection, mintAddress)
    const amountLamports = Math.floor(amount * Math.pow(10, mint.decimals))

    const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
      this.connection,
      this.keypair,
      mintAddress,
      this.keypair.publicKey
    )

    const toTokenAccount = await getOrCreateAssociatedTokenAccount(
      this.connection,
      this.keypair,
      mintAddress,
      toPublicKey
    )

    const transaction = new Transaction().add(
      createTransferInstruction(
        fromTokenAccount.address,
        toTokenAccount.address,
        this.keypair.publicKey,
        amountLamports
      )
    )

    const txHash = await sendAndConfirmTransaction(
      this.connection,
      transaction,
      [this.keypair],
      { commitment: 'confirmed' }
    )

    return txHash
  }

  async sendSplitPayment(
    providerWallet: string,
    providerAmount: number,
    platformWallet: string,
    platformAmount: number
  ): Promise<{ txHashProvider: string; txHashPlatform: string }> {
    const [txHashProvider, txHashPlatform] = await Promise.all([
      this.sendUsdc(providerWallet, providerAmount),
      this.sendUsdc(platformWallet, platformAmount),
    ])

    return { txHashProvider, txHashPlatform }
  }
}
