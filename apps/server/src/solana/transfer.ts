import { Connection, PublicKey, Transaction, sendAndConfirmTransaction } from '@solana/web3.js'
import { getOrCreateAssociatedTokenAccount, createTransferInstruction, getMint } from '@solana/spl-token'
import { wallet } from './wallet'

const USDC_MINT: Record<string, string> = {
  devnet: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU',
  mainnet: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
}

interface TransferResult {
  success: boolean
  txHash?: string
  error?: string
}

export async function transferUsdc(
  toAddress: string,
  amountUsdc: number,
  network: 'devnet' | 'mainnet' = 'devnet'
): Promise<TransferResult> {
  try {
    const privateKeyStr = process.env.SOLANA_WALLET_PRIVATE_KEY
    if (!privateKeyStr) throw new Error('SOLANA_WALLET_PRIVATE_KEY not configured')
    console.log('[transfer] Private key length:', privateKeyStr.length)
    console.log('[transfer] Private key prefix:', privateKeyStr.slice(0, 8))

    const rpcUrl = network === 'mainnet'
      ? (process.env.SOLANA_MAINNET_RPC_URL || 'https://api.mainnet-beta.solana.com')
      : (process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com')

    console.log('[transfer] Using RPC:', rpcUrl)
    console.log('[transfer] To address:', toAddress)
    console.log('[transfer] Amount USDC:', amountUsdc)

    console.log('[transfer] Connecting to RPC:', rpcUrl)
    const connection = new Connection(rpcUrl, 'confirmed')
    const mintAddress = new PublicKey(USDC_MINT[network])
    const toPublicKey = new PublicKey(toAddress)

    console.log('[transfer] Getting mint info...')
    const mintInfo = await getMint(connection, mintAddress)
    console.log('[transfer] Mint decimals:', mintInfo.decimals)
    const amount = Math.floor(amountUsdc * Math.pow(10, mintInfo.decimals))
    console.log('[transfer] Amount (raw):', amount)

    console.log('[transfer] Getting from token account...')
    const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      wallet,
      mintAddress,
      wallet.publicKey
    )
    console.log('[transfer] From token account:', fromTokenAccount.address.toBase58())
    console.log('[transfer] From balance:', fromTokenAccount.amount.toString())

    console.log('[transfer] Getting to token account...')
    const toTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      wallet,
      mintAddress,
      toPublicKey
    )
    console.log('[transfer] To token account:', toTokenAccount.address.toBase58())

    console.log('[transfer] Sending transaction...')
    const transaction = new Transaction().add(
      createTransferInstruction(
        fromTokenAccount.address,
        toTokenAccount.address,
        wallet.publicKey,
        amount
      )
    )

    const txHash = await sendAndConfirmTransaction(connection, transaction, [wallet], {
      commitment: 'confirmed',
    })

    console.log(`[transfer] Sent ${amountUsdc} USDC to ${toAddress} — ${txHash}`)
    return { success: true, txHash }
  } catch (error: any) {
    const msg = error?.message || error?.toString() || JSON.stringify(error) || 'Unknown error'
    console.error('[transfer] Error details:', msg)
    console.error('[transfer] Error stack:', error?.stack)
    return { success: false, error: msg }
  }
}
