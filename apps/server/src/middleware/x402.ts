import { Request, Response, NextFunction } from 'express';
import { verifyPayment } from '../solana/verify';
import { walletAddress as serverWallet } from '../solana/wallet';
import { prisma } from '../lib/prisma';
import { sendPaymentAlert } from '../lib/email';
import { sendWebhook } from '../lib/webhook';
import { checkIdempotency, markUsed } from '../lib/idempotency';
import { logRevenue } from '../lib/revenueLog';

const PLATFORM_WALLET = process.env.GATE402_PLATFORM_WALLET || '7UQctUWgfH87jjz9xjnCCKVY6Q1tMWZ8i1ZB3Whx939D';

export async function x402Middleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const requestStart = Date.now();
    const endpointPath = req.originalUrl.split('?')[0]; // e.g. /api/weather
    const shortPath = req.path;                          // e.g. /weather
    const apiKey = req.headers['x-api-key'] as string | undefined;
    const agentWallet = req.headers['x-agent-wallet'] as string | undefined;

    // MCP tool calls: extract tool name from JSON-RPC body
    const mcpToolName = (req.body as { method?: string; params?: { name?: string } } | undefined)
      ?.method?.startsWith('tools/call')
      ? (req.body as { params?: { name?: string } })?.params?.name
      : undefined;
    const toolPath = mcpToolName ? `/tools/${mcpToolName}` : undefined;

    console.log('[x402] path:', endpointPath, '| shortPath:', shortPath, '| apiKey:', apiKey?.slice(0, 8));

    // ── STEP 1: Resolve endpoint + owner ────────────────────────────────────
    let currentUser: (typeof import('@prisma/client').PrismaClient extends { user: infer U } ? U : any) | null = null;
    let currentEndpoint: any = null;

    if (apiKey) {
      const user = await prisma.user.findUnique({
        where: { apiKey },
        include: {
          endpoints: {
            where: {
              path: { in: [endpointPath, shortPath, ...(toolPath ? [toolPath] : [])] },
              active: true,
            },
          },
        },
      });
      console.log('[x402] user by apiKey:', !!user, user?.id?.slice(0, 8), '| endpoints:', user?.endpoints?.map(e => e.path));
      if (user) {
        currentUser = user as any;
        // prefer exact endpointPath match
        currentEndpoint = user.endpoints.find(e => e.path === endpointPath)
          ?? user.endpoints.find(e => e.path === shortPath)
          ?? user.endpoints[0]
          ?? null;
      }
    }

    // Fallback: find by path without apiKey constraint
    if (!currentEndpoint) {
      const ep = await prisma.endpoint.findFirst({
        where: { path: endpointPath, active: true },
        include: { user: true },
      }) ?? await prisma.endpoint.findFirst({
        where: { path: shortPath, active: true },
        include: { user: true },
      }) ?? (toolPath ? await prisma.endpoint.findFirst({
        where: { path: toolPath, active: true },
        include: { user: true },
      }) : null);

      if (ep) {
        currentEndpoint = ep;
        if (!currentUser) currentUser = (ep as any).user ?? null;
      }
    }

    console.log('[x402] endpoint:', currentEndpoint?.id?.slice(0, 8) ?? 'NOT FOUND', '| path stored:', currentEndpoint?.path);
    console.log('[x402] owner:', (currentUser as any)?.id?.slice(0, 8) ?? 'none');

    // No registered endpoint — pass through
    if (!currentEndpoint) {
      return next();
    }

    const price: number = currentEndpoint.priceUsdc;
    const platformFee = 0; // fee disabled — 100% goes to provider
    const providerAmount = price;
    const providerWallet: string = (currentUser as any)?.walletAddress ?? serverWallet;
    const network: string = (currentUser as any)?.network ?? 'devnet';

    // ── STEP 2: No payment header → 402 ────────────────────────────────────
    const rawPaymentHeader = req.headers['x-payment-payload'] as string | undefined;
    if (!rawPaymentHeader) {
      res.status(402).json({
        error: 'Payment Required',
        price: { total: price, currency: 'USDC', network: `solana-${network}` },
        splits: {
          provider: { wallet: providerWallet, amount: providerAmount },
        },
        endpoint: endpointPath,
        instructions: 'Send USDC on Solana and include tx hash in X-Payment-Payload header.',
      });
      return;
    }

    // ── STEP 3: Parse tx hashes ─────────────────────────────────────────────
    const [txHashProvider, txHashPlatform] = rawPaymentHeader.split(',').map(h => h.trim());
    const isDemoMode = txHashProvider?.startsWith('demo_');

    // Block demo_ on mainnet
    const userNetwork = (currentUser as any)?.network || 'devnet';
    if (isDemoMode && userNetwork === 'mainnet') {
      res.status(402).json({
        error: 'Payment Required',
        message: 'Demo mode is not allowed on mainnet. Send real USDC.',
        code: 'DEMO_NOT_ALLOWED_ON_MAINNET',
      });
      return;
    }
    console.log(`[x402] demo mode: ${isDemoMode}, network: ${userNetwork}`);

    // ── STEP 4: Anti-replay ──────────────────────────────────────────────────
    console.log('[idempotency] checking:', txHashProvider);
    const { isDuplicate } = await checkIdempotency(txHashProvider, 'payment');
    if (isDuplicate) {
      res.status(402).json({ error: 'Payment already used', details: 'This tx hash has already been used.' });
      return;
    }

    // ── STEP 5: Verify payment ───────────────────────────────────────────────
    let confirmedAmount = price;
    let payerWallet: string | undefined;
    let txHashToLog = txHashProvider;

    if (isDemoMode) {
      txHashToLog = `demo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      payerWallet = 'demo_wallet';
      console.log('[x402] demo mode — skipping blockchain verify');
    } else {
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

      confirmedAmount = providerResult.amount ?? price;
      payerWallet = providerResult.payerWallet;
    }

    // ── STEP 6: Mark anti-replay ─────────────────────────────────────────────
    try {
      await markUsed(txHashProvider, 'payment', {
        endpointPath,
        amount: price,
        timestamp: new Date().toISOString(),
      });
      console.log('[idempotency] marked used:', txHashProvider);
    } catch (e) {
      console.error('[idempotency] markUsed failed:', (e as Error).message);
    }

    // ── STEP 7: Create ApiCall ───────────────────────────────────────────────
    const resolvedUserId = (currentUser as any)?.id ?? null;
    console.log('[x402] creating ApiCall — endpointId:', currentEndpoint.id?.slice(0, 8), '| userId:', resolvedUserId?.slice(0, 8));
    try {
      const apiCall = await prisma.apiCall.create({
        data: {
          endpointId: currentEndpoint.id,
          userId: resolvedUserId,
          txHash: txHashToLog,
          amountUsdc: confirmedAmount,
          payerWallet: agentWallet || payerWallet || null,
          status: isDemoMode ? 'demo' : 'confirmed',
        },
      });
      console.log('[x402] ApiCall created:', apiCall.id, '| userId:', apiCall.userId);
    } catch (e: any) {
      console.error('[x402] ApiCall create FAILED:', e.message, '| code:', e.code);
    }

    // ── STEP 8: Revenue log ──────────────────────────────────────────────────
    const effectiveTxPlatform = txHashPlatform || txHashToLog;
    // fee disabled — skipping revenue log

    // ── STEP 9: Transaction record (requires owner) ──────────────────────────
    if (resolvedUserId) {
      try {
        const transaction = await prisma.transaction.create({
          data: {
            userId: resolvedUserId,
            endpointId: currentEndpoint.id,
            txHashProvider: txHashToLog,
            txHashPlatform: effectiveTxPlatform !== txHashToLog ? effectiveTxPlatform : null,
            totalAmount: price,
            providerAmount,
            platformFee,
            status: 'verified',
            network,
            payerWallet: agentWallet || payerWallet || null,
            splits: {
              create: [
                { recipient: 'provider', wallet: providerWallet, amount: providerAmount, txHash: txHashToLog, status: 'confirmed', confirmedAt: new Date() },
              ],
            },
          },
        });
        console.log('[transaction] created:', transaction.id);
      } catch (e: any) {
        console.error('[transaction] create failed:', e.message, '| code:', e.code);
      }
    } else {
      console.warn('[transaction] skipped — no userId resolved for endpoint:', endpointPath);
    }

    // ── STEP 10: Email + Webhook (fire-and-forget) ───────────────────────────
    const ownerUser = (currentEndpoint as any).user ?? currentUser;
    if (ownerUser?.email && ownerUser.emailAlerts) {
      sendPaymentAlert({
        to: ownerUser.email,
        endpoint: endpointPath,
        amount: confirmedAmount,
        txHash: txHashToLog,
        payerWallet,
        network: ownerUser.network || 'devnet',
      }).catch(err => console.error('[email] Failed:', (err as Error).message));
    }
    if (ownerUser?.webhookUrl) {
      sendWebhook(ownerUser.webhookUrl, ownerUser.webhookSecret ?? null, {
        event: 'payment.confirmed',
        endpoint: endpointPath,
        amount: confirmedAmount,
        currency: 'USDC',
        network: ownerUser.network || 'devnet',
        txHash: txHashToLog,
        payerWallet,
        timestamp: new Date().toISOString(),
      }).catch(err => console.error('[webhook] Failed:', (err as Error).message));
    }

    // ── STEP 11: Release ─────────────────────────────────────────────────────
    req.headers['x-payment-verified'] = 'true';
    req.headers['x-payment-amount'] = confirmedAmount.toString();

    // Marks when the dev handler starts (excludes Gate402 verification time)
    const handlerStart = Date.now();

    res.on('finish', async () => {
      const latencyMs = Date.now() - handlerStart;
      try {
        await prisma.apiCall.updateMany({
          where: { txHash: txHashToLog, latencyMs: null },
          data: { latencyMs },
        });
        console.log(`[x402] latency recorded: ${latencyMs}ms for ${endpointPath}`);
      } catch (e: any) {
        console.error('[x402] failed to record latency:', e.message);
      }
    });

    console.log('[x402] payment verified — calling next()');
    return next();

  } catch (error) {
    console.error('[x402] Middleware error:', error);
    res.status(503).json({ error: 'Service temporarily unavailable' });
  }
}
