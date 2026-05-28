import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';
import dotenv from 'dotenv';
dotenv.config();

function decodePrivateKey(privateKeyStr: string): Uint8Array {
  // Format 1: JSON array [1,2,3,...]
  try {
    const arr = JSON.parse(privateKeyStr);
    if (Array.isArray(arr)) {
      return new Uint8Array(arr);
    }
  } catch {}

  // Format 2: base64 (64 bytes)
  try {
    const buf = Buffer.from(privateKeyStr, 'base64');
    if (buf.length === 64) {
      return new Uint8Array(buf);
    }
  } catch {}

  // Format 3: base58 (Solana CLI default)
  return bs58.decode(privateKeyStr);
}

function getWalletFromEnv(): Keypair {
  const privateKey = process.env.SOLANA_WALLET_PRIVATE_KEY;

  if (!privateKey) {
    const keypair = Keypair.generate();
    const pubKey = keypair.publicKey.toBase58();
    const privKey = bs58.encode(keypair.secretKey);

    console.log('⚠️  No wallet found. Generated new wallet:');
    console.log(`Public Key: ${pubKey}`);
    console.log(`Private Key: ${privKey}`);
    console.log('→ Copy these values to your .env file');

    return keypair;
  }

  try {
    const secretKey = decodePrivateKey(privateKey);
    const keypair = Keypair.fromSecretKey(secretKey);
    return keypair;
  } catch (err: any) {
    const msg = err?.message || err?.toString() || 'Unknown error';
    console.error('[wallet] FAILED to load keypair:', msg);
    throw err;
  }
}

export const wallet = getWalletFromEnv();
export const walletAddress = wallet.publicKey.toBase58();
