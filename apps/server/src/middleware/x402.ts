import { Request, Response, NextFunction } from 'express';
import { getPricing } from '../config/pricing';
import { verifyPayment } from '../solana/verify';
import { walletAddress } from '../solana/wallet';
import { prisma } from '../lib/prisma';

export async function x402Middleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const fullPath = req.baseUrl + req.path;
    const paymentHeader = req.headers['x-payment-payload'] as string | undefined;
    const userId = req.headers['x-user-id'] as string | undefined;

    // Demo mode: aceita hashes que começam com "demo_" sem verificação Solana
    if (paymentHeader && paymentHeader.startsWith('demo_')) {
      const pricing = await getPricing(fullPath);
      if (pricing) {
        try {
          await prisma.apiCall.create({
            data: {
              endpointId: pricing.endpointId,
              txHash: `demo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
              amountUsdc: pricing.priceUsdc,
              payerWallet: 'demo_wallet',
              status: 'demo',
              userId: userId ?? null,
            },
          });
          console.log('Demo call logged for userId:', userId ?? 'anonymous');
        } catch (e) {
          console.log('Demo call log failed:', e);
        }
      }
      next();
      return;
    }

    if (paymentHeader) {
      const pricing = await getPricing(fullPath);

      if (!pricing) {
        next();
        return;
      }

      // Verificação real da Solana para hashes reais
      const result = await verifyPayment({
        txHash: paymentHeader,
        expectedAmountUsdc: pricing.priceUsdc,
        recipientAddress: walletAddress,
      });

      if (result.valid && result.payerWallet && result.amount !== undefined) {
        try {
          await prisma.apiCall.create({
            data: {
              endpointId: pricing.endpointId,
              txHash: paymentHeader,
              amountUsdc: result.amount,
              payerWallet: result.payerWallet,
              userId,
            },
          });
        } catch (e) {
          console.error('Failed to log api call:', e);
        }
        next();
        return;
      }

      res.status(402).json({
        error: 'Invalid payment',
        reason: result.reason,
        txHash: paymentHeader,
      });
      return;
    }

    const pricing = await getPricing(fullPath);

    if (!pricing) {
      next();
      return;
    }

    res.status(402).json({
      error: 'Payment Required',
      price: {
        amount: pricing.priceUsdc.toString(),
        currency: 'USDC',
        network: 'solana-devnet',
      },
      payTo: walletAddress,
      endpoint: fullPath,
      instructions: 'Send USDC on Solana devnet and include tx hash in X-Payment-Payload header',
    });
  } catch (error) {
    console.error('x402Middleware error:', error);
    res.status(503).json({ error: 'Service temporarily unavailable' });
  }
}
