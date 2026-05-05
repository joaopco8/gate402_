import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';
import dotenv from 'dotenv';
dotenv.config();

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

  const secretKey = bs58.decode(privateKey);
  return Keypair.fromSecretKey(secretKey);
}

export const wallet = getWalletFromEnv();
export const walletAddress = wallet.publicKey.toBase58();
