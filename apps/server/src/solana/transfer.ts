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
    const rpcUrl = network === 'mainnet'
      ? (process.env.SOLANA_MAINNET_RPC_URL || 'https://api.mainnet-beta.solana.com')
      : (process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com')

    const connection = new Connection(rpcUrl, 'confirmed')
    const mintAddress = new PublicKey(USDC_MINT[network])
    const toPublicKey = new PublicKey(toAddress)

    const mintInfo = await getMint(connection, mintAddress)
    const amount = Math.floor(amountUsdc * Math.pow(10, mintInfo.decimals))

    const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      wallet,
      mintAddress,
      wallet.publicKey
    )

    const toTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      wallet,
      mintAddress,
      toPublicKey
    )

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
    console.error('[transfer] Error:', error.message)
    return { success: false, error: error.message }
  }
}
