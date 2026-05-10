import { Connection } from '@solana/web3.js';
import dotenv from 'dotenv';
dotenv.config();

const USDC_DEVNET_MINT = '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU';
const USDC_MAINNET_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

const RPC_URLS: Record<string, string> = {
  devnet: process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
  mainnet: process.env.SOLANA_MAINNET_RPC_URL || 'https://api.mainnet-beta.solana.com',
};

interface VerifyResult {
  valid: boolean;
  payerWallet?: string;
  amount?: number;
  reason?: string;
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

    const txPromise = connection.getParsedTransaction(txHash, {
      maxSupportedTransactionVersion: 0,
    });

    const tx = await Promise.race([
      txPromise,
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000)),
    ]);

    if (!tx) {
      return { valid: false, reason: 'not found' };
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
