import { Connection } from '@solana/web3.js';
import dotenv from 'dotenv';
dotenv.config();

const USDC_DEVNET_MINT = '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU';
const USDC_MAINNET_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

const RPC_URLS: Record<string, string> = {
  devnet: process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
  mainnet: process.env.SOLANA_MAINNET_RPC_URL || 'https://api.mainnet-beta.solana.com',
};

const MAX_TX_AGE_SECONDS = 15 * 60; // 15 minutes

interface VerifyResult {
  valid: boolean;
  payerWallet?: string;
  amount?: number;
  reason?: string;
}

async function getTransactionWithRetry(
  connection: Connection,
  txHash: string,
  maxRetries = 2
) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const tx = await Promise.race([
        connection.getParsedTransaction(txHash, {
          commitment: 'confirmed',
          maxSupportedTransactionVersion: 0,
        }),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000)),
      ]);
      if (tx) return tx;

      if (attempt < maxRetries) {
        console.log(`[solana] tx not found, retry ${attempt}/${maxRetries} — ${txHash}`);
        await new Promise(r => setTimeout(r, 1000 * attempt));
      }
    } catch (e: any) {
      console.error(`[solana] RPC error attempt ${attempt}:`, e.message);
      if (attempt < maxRetries) {
        await new Promise(r => setTimeout(r, 1000 * attempt));
      }
    }
  }
  return null;
}

export async function verifyPayment({
  txHash,
  expectedAmountUsdc,
  recipientAddress,
  network = 'devnet',
}: {
  txHash: string;
  expectedAmountUsdc: number;
  recipientAddress: string;
  network?: string;
}): Promise<VerifyResult> {
  try {
    const rpcUrl = RPC_URLS[network] ?? RPC_URLS.devnet;
    const usdcMint = network === 'mainnet' ? USDC_MAINNET_MINT : USDC_DEVNET_MINT;
    const connection = new Connection(rpcUrl, 'confirmed');

    const tx = await getTransactionWithRetry(connection, txHash);

    if (!tx) {
      return { valid: false, reason: 'Transaction not found' };
    }

    // Verify recency — max 15 minutes
    if (tx.blockTime) {
      const txAgeSeconds = Math.floor(Date.now() / 1000) - tx.blockTime;
      if (txAgeSeconds > MAX_TX_AGE_SECONDS) {
        console.warn(`[solana] tx too old: ${txAgeSeconds}s — hash: ${txHash}`);
        return {
          valid: false,
          reason: `Transaction is too old (${Math.floor(txAgeSeconds / 60)} minutes). Max allowed: 15 minutes.`,
        };
      }
      console.log(`[solana] tx age: ${txAgeSeconds}s ✓`);
    }

    const accountKeys = tx.transaction.message.accountKeys;
    const payerWallet = accountKeys[0].pubkey.toBase58();

    const tokenBalances = tx.meta?.postTokenBalances ?? [];
    const preTokenBalances = tx.meta?.preTokenBalances ?? [];

    // Find recipient USDC balance change
    const recipientPost = tokenBalances.find(
      (b) => b.mint === usdcMint && b.owner === recipientAddress
    );
    const recipientPre = preTokenBalances.find(
      (b) => b.mint === usdcMint && b.owner === recipientAddress
    );

    if (!recipientPost) {
      return { valid: false, reason: 'no USDC transfer to recipient' };
    }

    const postAmount = Number(recipientPost.uiTokenAmount.uiAmount ?? 0);
    const preAmount = Number(recipientPre?.uiTokenAmount.uiAmount ?? 0);
    const received = postAmount - preAmount;

    if (received < expectedAmountUsdc) {
      return { valid: false, reason: `insufficient amount: received ${received}, expected ${expectedAmountUsdc}` };
    }

    return { valid: true, payerWallet, amount: received };
  } catch {
    return { valid: false, reason: 'error' };
  }
}
