import { Request, Response, NextFunction } from 'express';
import { verifyPayment } from '../solana/verify';
import { walletAddress } from '../solana/wallet';
import { prisma } from '../lib/prisma';

export async function x402Middleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const fullPath = req.baseUrl + req.path;
    const paymentHeader = req.headers['x-payment-payload'] as string | undefined;
    const userId = req.headers['x-user-id'] as string | undefined;

    // Demo mode: accept hashes starting with "demo_" without Solana verification
    if (paymentHeader && paymentHeader.startsWith('demo_')) {
      const endpoint = await prisma.endpoint.findFirst({
        where: { path: fullPath, active: true },
      });
      if (endpoint) {
        try {
          await prisma.apiCall.create({
            data: {
              endpointId: endpoint.id,
              txHash: `demo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
              amountUsdc: endpoint.priceUsdc,
              payerWallet: 'demo_wallet',
              status: 'demo',
              userId: endpoint.userId ?? userId ?? null,
            },
          });
          console.log('Demo call logged for userId:', endpoint.userId ?? userId ?? 'anonymous');
        } catch (e) {
          console.log('Demo call log failed:', e);
        }
      }
      next();
      return;
    }

    if (paymentHeader) {
      const endpoint = await prisma.endpoint.findFirst({
        where: { path: fullPath, active: true },
        include: { user: true },
      });

      if (!endpoint) {
        next();
        return;
      }

      // Use endpoint owner's wallet, fall back to server env wallet
      const recipientAddress = endpoint.user?.walletAddress ?? walletAddress;

      // Real Solana verification
      const result = await verifyPayment({
        txHash: paymentHeader,
        expectedAmountUsdc: endpoint.priceUsdc,
        recipientAddress,
      });

      if (result.valid && result.payerWallet && result.amount !== undefined) {
        try {
          await prisma.apiCall.create({
            data: {
              endpointId: endpoint.id,
              txHash: paymentHeader,
              amountUsdc: result.amount,
              payerWallet: result.payerWallet,
              userId: endpoint.userId ?? userId ?? null,
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

    const endpoint = await prisma.endpoint.findFirst({
      where: { path: fullPath, active: true },
      include: { user: true },
    });

    if (!endpoint) {
      next();
      return;
    }

    const recipientAddress = endpoint.user?.walletAddress ?? walletAddress;

    res.status(402).json({
      error: 'Payment Required',
      price: {
        amount: endpoint.priceUsdc.toString(),
        currency: 'USDC',
        network: 'solana-devnet',
      },
      payTo: recipientAddress,
      endpoint: fullPath,
      instructions: 'Send USDC on Solana devnet and include tx hash in X-Payment-Payload header',
    });
  } catch (error) {
    console.error('x402Middleware error:', error);
    res.status(503).json({ error: 'Service temporarily unavailable' });
  }
}
