import { Request, Response, NextFunction } from 'express';
import { verifyPayment } from '../solana/verify';
import { walletAddress as serverWallet } from '../solana/wallet';
import { prisma } from '../lib/prisma';
import { sendPaymentAlert } from '../lib/email';

// Busca endpoint pelo path completo ou pelo path relativo (sem prefixo /api)
async function findEndpointRecord(fullPath: string, shortPath: string) {
  const record = await prisma.endpoint.findFirst({
    where: { path: fullPath, active: true },
    include: { user: true },
  });
  if (record) return record;

  // Fallback: tenta o path sem o prefixo do baseUrl
  return prisma.endpoint.findFirst({
    where: { path: shortPath, active: true },
    include: { user: true },
  });
}

export async function x402Middleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const fullPath = req.baseUrl + req.path; // e.g. /api/weather
    const shortPath = req.path;              // e.g. /weather
    const paymentHeader = req.headers['x-payment-payload'] as string | undefined;
    const apiKey = req.headers['x-api-key'] as string | undefined;

    // 1. Busca o endpoint e dono via apiKey (SDK externo) ou path global
    let endpointId: string | null = null;
    let price: number | null = null;
    let recipientWallet: string = serverWallet;
    let network = 'devnet';
    let userId: string | null = null;

    if (apiKey) {
      const user = await prisma.user.findUnique({
        where: { apiKey },
        include: { endpoints: { where: { path: fullPath, active: true } } },
      });
      if (user && user.endpoints.length > 0 && user.walletAddress) {
        const ep = user.endpoints[0];
        endpointId = ep.id;
        price = ep.priceUsdc;
        recipientWallet = user.walletAddress;
        network = user.network;
        userId = user.id;
      }
    } else {
      const ep = await findEndpointRecord(fullPath, shortPath);
      if (ep) {
        endpointId = ep.id;
        price = ep.priceUsdc;
        recipientWallet = ep.user?.walletAddress ?? serverWallet;
        network = ep.user?.network ?? 'devnet';
        userId = ep.userId ?? null;
      }
    }

    // Endpoint não cadastrado — deixa passar
    if (!endpointId || price === null) {
      return next();
    }

    // 2. Sem payment header → retorna 402 com instrução de pagamento
    if (!paymentHeader) {
      res.status(402).json({
        error: 'Payment Required',
        price: { amount: price.toString(), currency: 'USDC', network: `solana-${network}` },
        payTo: recipientWallet,
        endpoint: fullPath,
        instructions: 'Send USDC on Solana and include tx hash in X-Payment-Payload header',
      });
      return;
    }

    // 3. Demo mode OU verificação real na blockchain
    let paymentConfirmed = false;
    let confirmedAmount = price;
    let payerWallet: string | undefined;
    let txHashToLog = paymentHeader;

    if (paymentHeader.startsWith('demo_')) {
      paymentConfirmed = true;
      txHashToLog = `demo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      payerWallet = 'demo_wallet';
    } else {
      const result = await verifyPayment({
        txHash: paymentHeader,
        expectedAmountUsdc: price,
        recipientAddress: recipientWallet,
      });
      if (result.valid && result.payerWallet && result.amount !== undefined) {
        paymentConfirmed = true;
        confirmedAmount = result.amount;
        payerWallet = result.payerWallet;
      } else {
        res.status(402).json({ error: 'Invalid payment', reason: result.reason, txHash: paymentHeader });
        return;
      }
    }

    // 4. Pagamento confirmado (demo OU real) — loga ApiCall
    if (paymentConfirmed) {
      try {
        await prisma.apiCall.create({
          data: {
            endpointId,
            txHash: txHashToLog,
            amountUsdc: confirmedAmount,
            payerWallet: payerWallet ?? null,
            status: paymentHeader.startsWith('demo_') ? 'demo' : 'confirmed',
            userId,
          },
        });
      } catch (e) {
        console.error('[x402] Failed to log api call:', e);
      }

      // 5. Dispara email alert — busca dono do endpoint por req.path (sem prefixo)
      try {
        const endpointRecord = await findEndpointRecord(fullPath, shortPath);

        console.log('[email] Checking alert for endpoint:', fullPath);
        console.log('[email] User email:', endpointRecord?.user?.email ?? null);
        console.log('[email] emailAlerts:', endpointRecord?.user?.emailAlerts ?? null);

        if (endpointRecord?.user?.email && endpointRecord.user.emailAlerts) {
          sendPaymentAlert({
            to: endpointRecord.user.email,
            endpoint: fullPath,
            amount: confirmedAmount,
            txHash: txHashToLog,
            payerWallet,
            network: endpointRecord.user.network || 'devnet',
          })
            .then(() => console.log('[email] Alert sent to', endpointRecord.user!.email))
            .catch(err => console.error('[email] Failed:', err instanceof Error ? err.message : err));
        } else {
          console.log('[email] Skipped — no email or alerts disabled');
        }
      } catch (err) {
        console.error('[email] Error fetching endpoint for alert:', err);
      }

      // 6. Libera acesso
      req.headers['x-payment-verified'] = 'true';
      req.headers['x-payment-amount'] = confirmedAmount.toString();
      return next();
    }

  } catch (error) {
    console.error('[x402] Middleware error:', error);
    res.status(503).json({ error: 'Service temporarily unavailable' });
  }
}
