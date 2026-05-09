import { Request, Response, NextFunction } from 'express';
import { verifyPayment } from '../solana/verify';
import { walletAddress as serverWallet } from '../solana/wallet';
import { prisma } from '../lib/prisma';

interface ResolvedEndpoint {
  endpointId: string;
  price: number;
  wallet: string;
  network: string;
  userId: string | null;
}

// Resolve qual endpoint está sendo acessado e quem é o dono.
// Se x-api-key estiver presente, restringe a busca ao usuário dono da key.
// Sem apiKey, faz lookup global (endpoints próprios do Gate402).
async function resolveEndpoint(req: Request): Promise<ResolvedEndpoint | null> {
  const fullPath = req.baseUrl + req.path;
  const apiKey = req.headers['x-api-key'] as string | undefined;

  if (apiKey) {
    const user = await prisma.user.findUnique({
      where: { apiKey },
      include: {
        endpoints: {
          where: { path: fullPath, active: true },
        },
      },
    });

    if (user && user.endpoints.length > 0 && user.walletAddress) {
      const ep = user.endpoints[0];
      return {
        endpointId: ep.id,
        price: ep.priceUsdc,
        wallet: user.walletAddress,
        network: user.network,
        userId: user.id,
      };
    }
    return null;
  }

  // Fallback: lookup global (para endpoints do próprio Gate402)
  const endpoint = await prisma.endpoint.findFirst({
    where: { path: fullPath, active: true },
    include: { user: true },
  });

  if (!endpoint) return null;

  return {
    endpointId: endpoint.id,
    price: endpoint.priceUsdc,
    wallet: endpoint.user?.walletAddress ?? serverWallet,
    network: endpoint.user?.network ?? 'devnet',
    userId: endpoint.userId ?? null,
  };
}

export async function x402Middleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const paymentHeader = req.headers['x-payment-payload'] as string | undefined;

    // Demo mode: aceita hashes começando com "demo_" sem verificação Solana
    if (paymentHeader && paymentHeader.startsWith('demo_')) {
      const resolved = await resolveEndpoint(req);
      if (resolved) {
        try {
          await prisma.apiCall.create({
            data: {
              endpointId: resolved.endpointId,
              txHash: `demo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
              amountUsdc: resolved.price,
              payerWallet: 'demo_wallet',
              status: 'demo',
              userId: resolved.userId,
            },
          });
          console.log('[x402] Demo call logged for userId:', resolved.userId ?? 'anonymous');
        } catch (e) {
          console.log('[x402] Demo call log failed:', e);
        }
      }
      next();
      return;
    }

    // Pagamento real — verifica na blockchain Solana
    if (paymentHeader) {
      const resolved = await resolveEndpoint(req);
      if (!resolved) {
        next();
        return;
      }

      const result = await verifyPayment({
        txHash: paymentHeader,
        expectedAmountUsdc: resolved.price,
        recipientAddress: resolved.wallet,
      });

      if (result.valid && result.payerWallet && result.amount !== undefined) {
        try {
          await prisma.apiCall.create({
            data: {
              endpointId: resolved.endpointId,
              txHash: paymentHeader,
              amountUsdc: result.amount,
              payerWallet: result.payerWallet,
              userId: resolved.userId,
            },
          });
        } catch (e) {
          console.error('[x402] Failed to log api call:', e);
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

    // Sem header de pagamento — retorna 402 com pricing info
    const resolved = await resolveEndpoint(req);
    if (!resolved) {
      next();
      return;
    }

    res.status(402).json({
      error: 'Payment Required',
      price: {
        amount: resolved.price.toString(),
        currency: 'USDC',
        network: `solana-${resolved.network}`,
      },
      payTo: resolved.wallet,
      endpoint: req.baseUrl + req.path,
      instructions: 'Send USDC on Solana and include tx hash in X-Payment-Payload header',
    });
  } catch (error) {
    console.error('[x402] Middleware error:', error);
    res.status(503).json({ error: 'Service temporarily unavailable' });
  }
}
