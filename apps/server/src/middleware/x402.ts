import { Request, Response, NextFunction } from 'express';
import { verifyPayment } from '../solana/verify';
import { walletAddress as serverWallet } from '../solana/wallet';
import { prisma } from '../lib/prisma';
import { redisGet, redisSet } from '../lib/redis';
import { sendPaymentAlert } from '../lib/email';
import { sendWebhook } from '../lib/webhook';
import { checkIdempotency, markUsed } from '../lib/idempotency';
import { logRevenue } from '../lib/revenueLog';

const PLATFORM_WALLET = process.env.GATE402_PLATFORM_WALLET || '7UQctUWgfH87jjz9xjnCCKVY6Q1tMWZ8i1ZB3Whx939D';
const PRICING_CACHE_TTL = 60; // seconds

interface CachedPricing {
  endpointId: string;
  price: number;
  providerWallet: string;
  network: string;
  userId: string | null;
}

async function getCachedEndpoint(
  fullPath: string,
  shortPath: string,
  apiKey?: string
): Promise<CachedPricing | null> {
  const cacheKey = apiKey
    ? `pricing:apikey:${apiKey}:${fullPath}`
    : `pricing:path:${fullPath}`;

  const cached = await redisGet(cacheKey);
  if (cached) {
    console.log('[x402] pricing cache hit:', cacheKey.slice(0, 30));
    return JSON.parse(cached);
  }

  let result: CachedPricing | null = null;

  if (apiKey) {
    const user = await prisma.user.findUnique({
      where: { apiKey },
      include: { endpoints: { where: { path: fullPath, active: true } } },
    });
    if (user && user.endpoints.length > 0 && user.walletAddress) {
      const ep = user.endpoints[0];
      result = {
        endpointId: ep.id,
        price: ep.priceUsdc,
        providerWallet: user.walletAddress,
        network: user.network,
        userId: user.id,
      };
    }
  } else {
    const ep = await prisma.endpoint.findFirst({
      where: { path: fullPath, active: true },
      include: { user: true },
    }) ?? await prisma.endpoint.findFirst({
      where: { path: shortPath, active: true },
      include: { user: true },
    });

    if (ep) {
      result = {
        endpointId: ep.id,
        price: ep.priceUsdc,
        providerWallet: ep.user?.walletAddress ?? serverWallet,
        network: ep.user?.network ?? 'devnet',
        userId: ep.userId ?? null,
      };
    }
  }

  if (result) {
    await redisSet(cacheKey, JSON.stringify(result), PRICING_CACHE_TTL);
  }

  return result;
}

async function findEndpointRecord(fullPath: string, shortPath: string) {
  const record = await prisma.endpoint.findFirst({
    where: { path: fullPath, active: true },
    include: { user: true },
  });
  if (record) return record;
  return prisma.endpoint.findFirst({
    where: { path: shortPath, active: true },
    include: { user: true },
  });
}

export async function x402Middleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const fullPath = req.baseUrl + req.path; // e.g. /api/weather
    const shortPath = req.path;              // e.g. /weather
    const rawPaymentHeader = req.headers['x-payment-payload'] as string | undefined;
    const apiKey = req.headers['x-api-key'] as string | undefined;

    // 1. Busca pricing (Redis cache → DB fallback)
    const pricing = await getCachedEndpoint(fullPath, shortPath, apiKey);

    // Endpoint não cadastrado — deixa passar
    if (!pricing) {
      return next();
    }

    const { endpointId, price, providerWallet, network, userId } = pricing;

    // Fee split amounts
    const totalAmount = price;
    const platformFee = parseFloat((totalAmount * 0.01).toFixed(6));
    const providerAmount = parseFloat((totalAmount - platformFee).toFixed(6));

    // 2. Sem payment header → retorna 402 com splits
    if (!rawPaymentHeader) {
      res.status(402).json({
        error: 'Payment Required',
        price: {
          total: totalAmount,
          currency: 'USDC',
          network: `solana-${network}`,
        },
        splits: {
          provider: { wallet: providerWallet, amount: providerAmount },
          platform: { wallet: PLATFORM_WALLET, amount: platformFee },
        },
        endpoint: fullPath,
        instructions: 'Send two USDC transfers: one to provider, one to platform. Include both tx hashes in X-Payment-Payload header separated by comma.',
      });
      return;
    }

    // 3. Parse dual tx hashes
    const [txHashProvider, txHashPlatform] = rawPaymentHeader.split(',').map(h => h.trim());
    const isDemoMode = txHashProvider?.startsWith('demo_');

    // 4. Anti-replay check (demo AND real payments)
    console.log('[idempotency] checking:', txHashProvider);
    const { isDuplicate } = await checkIdempotency(txHashProvider, 'payment');
    console.log('[idempotency] isDuplicate:', isDuplicate);
    if (isDuplicate) {
      res.status(402).json({
        error: 'Payment already used',
        details: 'This transaction hash has already been used to access this endpoint.',
      });
      return;
    }

    // 5. Demo mode OU verificação real na blockchain
    let paymentConfirmed = false;
    let confirmedAmount = totalAmount;
    let payerWallet: string | undefined;
    let txHashProviderToLog = txHashProvider;

    if (isDemoMode) {
      paymentConfirmed = true;
      txHashProviderToLog = `demo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      payerWallet = 'demo_wallet';
    } else {
      // Verifica pagamento ao provider
      const providerResult = await verifyPayment({
        txHash: txHashProvider,
        expectedAmountUsdc: providerAmount,
        recipientAddress: providerWallet,
        network,
      });

      if (!providerResult.valid) {
        res.status(402).json({
          error: 'Provider payment invalid',
          details: providerResult.reason,
          expected: { amount: providerAmount, wallet: providerWallet },
        });
        return;
      }

      confirmedAmount = providerResult.amount ?? totalAmount;
      payerWallet = providerResult.payerWallet;

      // Verifica fee ao Gate402 (se enviado e não demo)
      if (txHashPlatform && !txHashPlatform.startsWith('demo_')) {
        const platformResult = await verifyPayment({
          txHash: txHashPlatform,
          expectedAmountUsdc: platformFee,
          recipientAddress: PLATFORM_WALLET,
          network,
        });

        if (!platformResult.valid) {
          res.status(402).json({
            error: 'Platform fee payment invalid',
            details: platformResult.reason,
            expected: { amount: platformFee, wallet: PLATFORM_WALLET },
          });
          return;
        }
      }

      paymentConfirmed = true;
    }

    // 6. Pagamento confirmado — registra tudo
    if (paymentConfirmed) {
      const isDemo = isDemoMode;
      const effectiveTxPlatform = txHashPlatform || txHashProviderToLog;

      // 6a. Anti-replay mark — FIRST, before any DB writes, regardless of userId
      try {
        console.log('[idempotency] marking used:', txHashProvider);
        await markUsed(txHashProvider, 'payment', {
          endpointPath: fullPath,
          amount: totalAmount,
          timestamp: new Date().toISOString(),
        });
        console.log('[idempotency] marked successfully');
      } catch (e) {
        console.error('[idempotency] markUsed failed:', (e as Error).message);
      }

      // 6b. Revenue log — independent, runs regardless of userId
      console.log('[revenue] logging fee:', platformFee);
      await logRevenue({
        source: 'platform_fee',
        amount: platformFee,
        txHash: effectiveTxPlatform,
        userId: userId ?? undefined,
        description: `1% fee from ${fullPath} — total: ${totalAmount} USDC`,
      }).catch(e => console.error('[revenue] log failed:', e));
      console.log('[revenue] logged');

      // 6c. Legacy ApiCall (mantém dashboard existente funcionando)
      try {
        await prisma.apiCall.create({
          data: {
            endpointId,
            txHash: txHashProviderToLog,
            amountUsdc: confirmedAmount,
            payerWallet: payerWallet ?? null,
            status: isDemo ? 'demo' : 'confirmed',
            userId,
          },
        });
      } catch (e) {
        console.error('[x402] Failed to log api call:', e);
      }

      // 6d. Transaction + Splits — fresh endpoint lookup with user relation
      console.log('[transaction] creating record...');
      const endpointForTx = await findEndpointRecord(fullPath, shortPath);
      console.log('[transaction] endpoint found:', !!endpointForTx);
      console.log('[transaction] user found:', !!endpointForTx?.user);
      console.log('[transaction] userId:', endpointForTx?.user?.id ?? null);
      console.log('[transaction] endpointId:', endpointForTx?.id ?? null);

      if (!endpointForTx || !endpointForTx.user) {
        console.error('[transaction] skipped — endpoint or user not found in DB');
      } else {
        try {
          const transaction = await prisma.transaction.create({
            data: {
              userId: endpointForTx.user.id,
              endpointId: endpointForTx.id,
              txHashProvider: txHashProviderToLog,
              txHashPlatform: effectiveTxPlatform !== txHashProviderToLog ? effectiveTxPlatform : null,
              totalAmount,
              providerAmount,
              platformFee,
              status: isDemo ? 'demo' : 'verified',
              network,
              payerWallet: payerWallet ?? null,
              splits: {
                create: [
                  {
                    recipient: 'provider',
                    wallet: providerWallet,
                    amount: providerAmount,
                    txHash: txHashProviderToLog,
                    status: isDemo ? 'demo' : 'confirmed',
                    confirmedAt: new Date(),
                  },
                  {
                    recipient: 'platform',
                    wallet: PLATFORM_WALLET,
                    amount: platformFee,
                    txHash: effectiveTxPlatform,
                    status: isDemo ? 'demo' : 'confirmed',
                    confirmedAt: new Date(),
                  },
                ],
              },
            },
          });
          console.log('[transaction] created successfully:', transaction.id);
        } catch (e: unknown) {
          const err = e as Error & { code?: string };
          console.error('[transaction] create failed:', err.message);
          console.error('[transaction] error code:', err.code);
        }
      }

      // 6c. Email alert
      try {
        const endpointRecord = await findEndpointRecord(fullPath, shortPath);

        if (endpointRecord?.user?.email && endpointRecord.user.emailAlerts) {
          sendPaymentAlert({
            to: endpointRecord.user.email,
            endpoint: fullPath,
            amount: confirmedAmount,
            txHash: txHashProviderToLog,
            payerWallet,
            network: endpointRecord.user.network || 'devnet',
          })
            .then(() => console.log('[email] Alert sent to', endpointRecord.user!.email))
            .catch(err => console.error('[email] Failed:', err instanceof Error ? err.message : err));
        }
      } catch (err) {
        console.error('[email] Error:', err);
      }

      // 6d. Webhook — fire-and-forget
      try {
        const webhookRecord = await findEndpointRecord(fullPath, shortPath);
        if (webhookRecord?.user?.webhookUrl) {
          sendWebhook(
            webhookRecord.user.webhookUrl,
            webhookRecord.user.webhookSecret ?? null,
            {
              event: 'payment.confirmed',
              endpoint: fullPath,
              amount: confirmedAmount,
              currency: 'USDC',
              network: webhookRecord.user.network || 'devnet',
              txHash: txHashProviderToLog,
              payerWallet,
              timestamp: new Date().toISOString(),
            }
          ).catch(err => console.error('[webhook] Unhandled error:', err));
        }
      } catch (err) {
        console.error('[webhook] Error:', err);
      }

      // 7. Libera acesso
      req.headers['x-payment-verified'] = 'true';
      req.headers['x-payment-amount'] = confirmedAmount.toString();
      console.log('[x402] about to call next()');
      return next();
    }

  } catch (error) {
    console.error('[x402] Middleware error:', error);
    res.status(503).json({ error: 'Service temporarily unavailable' });
  }
}
