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
  private _keypair: Keypair | null = null
  private privateKeyStr: string
  private connection: Connection
  private network: 'devnet' | 'mainnet'

  constructor(privateKeyBase58: string, network: 'devnet' | 'mainnet' = 'devnet', rpcUrl?: string) {
    this.privateKeyStr = privateKeyBase58
    this.network = network

    const endpoint = rpcUrl || (
      network === 'mainnet'
        ? 'https://api.mainnet-beta.solana.com'
        : clusterApiUrl('devnet')
    )
    this.connection = new Connection(endpoint, 'confirmed')
  }

  private getKeypair(): Keypair {
    if (this._keypair) return this._keypair

    let secretKey: Uint8Array
    try {
      const bs58 = require('bs58')
      secretKey = bs58.decode(this.privateKeyStr)
    } catch {
      try {
        secretKey = new Uint8Array(JSON.parse(this.privateKeyStr))
      } catch {
        secretKey = Buffer.from(this.privateKeyStr, 'base64')
      }
    }

    this._keypair = Keypair.fromSecretKey(secretKey)
    return this._keypair
  }

  get publicKey(): string {
    try {
      return this.getKeypair().publicKey.toBase58()
    } catch {
      return 'invalid-key'
    }
  }

  async getUsdcBalance(): Promise<number> {
    try {
      const keypair = this.getKeypair()
      const mintAddress = new PublicKey(USDC_MINT[this.network])
      const tokenAccount = await getOrCreateAssociatedTokenAccount(
        this.connection,
        keypair,
        mintAddress,
        keypair.publicKey
      )
      const accountInfo = await getAccount(this.connection, tokenAccount.address)
      const mint = await getMint(this.connection, mintAddress)
      return Number(accountInfo.amount) / Math.pow(10, mint.decimals)
    } catch {
      return 0
    }
  }

  async sendUsdc(toAddress: string, amount: number): Promise<string> {
    const keypair = this.getKeypair()
    const mintAddress = new PublicKey(USDC_MINT[this.network])
    const toPublicKey = new PublicKey(toAddress)

    const mint = await getMint(this.connection, mintAddress)
    const amountLamports = Math.floor(amount * Math.pow(10, mint.decimals))

    const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
      this.connection,
      keypair,
      mintAddress,
      keypair.publicKey
    )

    const toTokenAccount = await getOrCreateAssociatedTokenAccount(
      this.connection,
      keypair,
      mintAddress,
      toPublicKey
    )

    console.log('[wallet] sender:', keypair.publicKey.toBase58())
    console.log('[wallet] recipient:', toPublicKey.toBase58())
    console.log('[wallet] fromATA:', fromTokenAccount.address.toBase58())
    console.log('[wallet] toATA:', toTokenAccount.address.toBase58())
    console.log('[wallet] fromATA === toATA:', fromTokenAccount.address.toBase58() === toTokenAccount.address.toBase58())

    const transaction = new Transaction().add(
      createTransferInstruction(
        fromTokenAccount.address,
        toTokenAccount.address,
        keypair.publicKey,
        amountLamports
      )
    )

    const txHash = await sendAndConfirmTransaction(
      this.connection,
      transaction,
      [keypair],
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
