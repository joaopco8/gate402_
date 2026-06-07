import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { redisGet, redisSet } from '../lib/redis';
import { getCachedUser } from '../lib/userCache';
import { getPlanLimits } from '../lib/plans';

const router = Router();

// Helper: try Redis cache, return parsed value or null
async function fromCache(key: string): Promise<any | null> {
  const raw = await redisGet(key);
  return raw ? JSON.parse(raw) : null;
}

// Helper: write to Redis fire-and-forget
function toCache(key: string, data: any, ttl: number) {
  redisSet(key, JSON.stringify(data), ttl).catch(() => {});
}

// GET /api/metrics
router.get('/metrics', async (req, res) => {
  try {
    const supabaseId = req.headers['x-user-id'] as string;
    if (!supabaseId) return res.status(401).json({ error: 'Unauthorized' });

    const cacheKey = `metrics:${supabaseId}`;
    const cached = await fromCache(cacheKey);
    if (cached) return res.json(cached);

    const user = await getCachedUser(supabaseId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [totalCalls, totalUsdcResult, todayCalls, todayUsdcResult, topEndpoint] = await Promise.all([
      prisma.apiCall.count({ where: { userId: user.id } }),
      prisma.apiCall.aggregate({ _sum: { amountUsdc: true }, where: { userId: user.id } }),
      prisma.apiCall.count({ where: { userId: user.id, createdAt: { gte: startOfDay } } }),
      prisma.apiCall.aggregate({ _sum: { amountUsdc: true }, where: { userId: user.id, createdAt: { gte: startOfDay } } }),
      prisma.endpoint.findFirst({ where: { userId: user.id }, orderBy: { calls: { _count: 'desc' } } }),
    ]);

    const payload = {
      totalCalls,
      totalUsdc: totalUsdcResult._sum.amountUsdc ?? 0,
      todayCalls,
      todayUsdc: todayUsdcResult._sum.amountUsdc ?? 0,
      topEndpoint: topEndpoint?.path ?? null,
    };
    toCache(cacheKey, payload, 30);
    return res.json(payload);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/calls/per-day?days=7
router.get('/calls/per-day', async (req, res) => {
  try {
    const supabaseId = req.headers['x-user-id'] as string;
    if (!supabaseId) return res.status(401).json({ error: 'Unauthorized' });

    const user = await getCachedUser(supabaseId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const maxDays = getPlanLimits(user.plan).analyticsDays ?? 7;
    const requestedDays = Math.min(parseInt(req.query.days as string) || 7, maxDays);
    const days = Math.max(1, requestedDays);

    const cacheKey = `cpd:${user.id}:d${days}`;
    const cached = await fromCache(cacheKey);
    if (cached) return res.json(cached);

    const since = new Date(Date.now() - days * 24 * 3600 * 1000);
    const rows = await prisma.$queryRaw<Array<{ date: string; calls: number; usdc: number }>>`
      SELECT
        TO_CHAR(DATE("createdAt"), 'DD/MM') as date,
        COUNT(*)::int as calls,
        COALESCE(SUM("amountUsdc"), 0)::float as usdc
      FROM "ApiCall"
      WHERE "userId" = ${user.id}
        AND "createdAt" >= ${since}
      GROUP BY DATE("createdAt")
      ORDER BY DATE("createdAt") ASC
    `;

    const dbMap = new Map(rows.map(r => [r.date, r]));
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
      const found = dbMap.get(key);
      result.push({ date: key, calls: found?.calls ?? 0, usdc: found?.usdc ?? 0 });
    }

    toCache(cacheKey, result, 30);
    return res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/calls/recent?limit=10&cursor=<id>
router.get('/calls/recent', async (req, res) => {
  try {
    const supabaseId = req.headers['x-user-id'] as string;
    if (!supabaseId) return res.status(401).json({ error: 'Unauthorized' });

    const user = await getCachedUser(supabaseId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const planLimit = getPlanLimits(user.plan).maxCallsVisible ?? 5;
    const limit = Math.max(1, Math.min(planLimit, parseInt(req.query.limit as string) || planLimit));
    const cursor = req.query.cursor as string | undefined;

    // Only cache first page (no cursor)
    const cacheKey = `recent:${user.id}:l${limit}`;
    if (!cursor) {
      const cached = await fromCache(cacheKey);
      if (cached) return res.json(cached);
    }

    const calls = await prisma.apiCall.findMany({
      where: {
        userId: user.id,
        ...(cursor ? { id: { lt: cursor } } : {}),
      },
      select: {
        id: true,
        status: true,
        amountUsdc: true,
        txHash: true,
        payerWallet: true,
        latencyMs: true,
        createdAt: true,
        endpoint: { select: { path: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    const nextCursor = calls.length === limit ? calls[calls.length - 1].id : null;
    const payload = { calls, nextCursor };

    if (!cursor) toCache(cacheKey, payload, 15);
    return res.json(payload);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/endpoints/revenue
router.get('/endpoints/revenue', async (req, res) => {
  try {
    const supabaseId = req.headers['x-user-id'] as string;
    if (!supabaseId) return res.status(401).json({ error: 'Unauthorized' });

    const user = await getCachedUser(supabaseId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const cacheKey = `ep-rev:${user.id}`;
    const cached = await fromCache(cacheKey);
    if (cached) return res.json(cached);

    const endpoints = await prisma.endpoint.findMany({
      where: { userId: user.id },
      include: { calls: { select: { amountUsdc: true } } },
    });

    const payload = endpoints
      .map(ep => ({
        name: ep.path,
        value: ep.calls.reduce((sum, c) => sum + c.amountUsdc, 0),
        calls: ep.calls.length,
      }))
      .filter(ep => ep.value > 0);

    toCache(cacheKey, payload, 30);
    return res.json(payload);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/transactions?cursor=<id>
router.get('/transactions', async (req, res) => {
  try {
    const supabaseId = req.headers['x-user-id'] as string | undefined;
    if (!supabaseId) return res.status(401).json({ error: 'x-user-id header required' });

    const user = await getCachedUser(supabaseId);
    if (!user) return res.status(404).json({ error: 'User not found', supabaseId });

    const cursor = req.query.cursor as string | undefined;

    const cacheKey = `txns:${user.id}`;
    if (!cursor) {
      const cached = await fromCache(cacheKey);
      if (cached) return res.json(cached);
    }

    const [transactions, stats] = await Promise.all([
      prisma.transaction.findMany({
        where: {
          userId: user.id,
          ...(cursor ? { id: { lt: cursor } } : {}),
        },
        select: {
          id: true,
          totalAmount: true,
          providerAmount: true,
          platformFee: true,
          status: true,
          txHashProvider: true,
          network: true,
          createdAt: true,
          endpoint: { select: { path: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      prisma.transaction.aggregate({
        where: { userId: user.id, status: { in: ['verified', 'demo'] } },
        _sum: { totalAmount: true, providerAmount: true, platformFee: true },
        _count: { id: true },
      }),
    ]);

    const nextCursor = transactions.length === 50 ? transactions[transactions.length - 1].id : null;

    const payload = {
      transactions: transactions.map(t => ({
        id: t.id,
        endpoint: t.endpoint?.path ?? 'unknown',
        totalAmount: t.totalAmount,
        providerAmount: t.providerAmount,
        platformFee: t.platformFee,
        status: t.status,
        txHashProvider: t.txHashProvider,
        network: t.network,
        createdAt: t.createdAt,
      })),
      stats: {
        totalGross: stats._sum.totalAmount ?? 0,
        totalNet: stats._sum.providerAmount ?? 0,
        totalFeesPaid: stats._sum.platformFee ?? 0,
        transactionCount: stats._count.id,
      },
      nextCursor,
    };

    if (!cursor) toCache(cacheKey, payload, 30);
    return res.json(payload);
  } catch (err) {
    console.error('[transactions] error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/analytics/revenue — gross vs net revenue
router.get('/analytics/revenue', async (req, res) => {
  try {
    const supabaseId = req.headers['x-user-id'] as string;
    if (!supabaseId) return res.status(401).json({ error: 'Unauthorized' });

    const user = await getCachedUser(supabaseId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const period = (req.query.period as string) || '7d';
    const days = period === '30d' ? 30 : period === '90d' ? 90 : 7;

    const cacheKey = `a-rev:${user.id}:${period}`;
    const cached = await fromCache(cacheKey);
    if (cached) return res.json(cached);

    const since = new Date(Date.now() - days * 24 * 3600 * 1000);

    const [gross, transactions, byDay] = await Promise.all([
      prisma.transaction.aggregate({
        where: { userId: user.id, createdAt: { gte: since } },
        _sum: { totalAmount: true, providerAmount: true, platformFee: true },
        _count: { id: true },
      }),
      prisma.transaction.findMany({
        where: { userId: user.id, createdAt: { gte: since } },
        include: { endpoint: { select: { path: true } } },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      prisma.$queryRaw<Array<{ date: Date; gross: number; net: number; fee: number; count: bigint }>>`
        SELECT
          DATE("createdAt") as date,
          SUM("totalAmount") as gross,
          SUM("providerAmount") as net,
          SUM("platformFee") as fee,
          COUNT(id) as count
        FROM "Transaction"
        WHERE "userId" = ${user.id}
          AND "createdAt" >= ${since}
        GROUP BY DATE("createdAt")
        ORDER BY date ASC
      `,
    ]);

    const feeRate = gross._sum.totalAmount
      ? (((gross._sum.platformFee || 0) / gross._sum.totalAmount) * 100).toFixed(2)
      : '1.00';

    const payload = {
      summary: {
        grossRevenue: gross._sum.totalAmount || 0,
        netRevenue: gross._sum.providerAmount || 0,
        platformFees: gross._sum.platformFee || 0,
        feeRate: parseFloat(feeRate),
        transactionCount: gross._count.id,
        period,
      },
      byDay: byDay.map(r => ({ ...r, count: Number(r.count) })),
      recentTransactions: transactions.map(t => ({
        id: t.id,
        endpoint: t.endpoint?.path,
        gross: t.totalAmount,
        net: t.providerAmount,
        fee: t.platformFee,
        status: t.status,
        createdAt: t.createdAt,
      })),
    };

    toCache(cacheKey, payload, 60);
    return res.json(payload);
  } catch (err) {
    console.error('[analytics/revenue]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/analytics/top-agents — top paying agents by wallet
router.get('/analytics/top-agents', async (req, res) => {
  try {
    const supabaseId = req.headers['x-user-id'] as string;
    if (!supabaseId) return res.status(401).json({ error: 'Unauthorized' });

    const user = await getCachedUser(supabaseId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const cacheKey = `top-agents:${user.id}`;
    const cached = await fromCache(cacheKey);
    if (cached) return res.json(cached);

    const topAgents = await prisma.transaction.groupBy({
      by: ['payerWallet'],
      where: { userId: user.id, payerWallet: { not: null } },
      _sum: { totalAmount: true, providerAmount: true },
      _count: { id: true },
      orderBy: { _sum: { totalAmount: 'desc' } },
      take: 10,
    });

    const payload = {
      agents: topAgents.map(a => ({
        wallet: a.payerWallet,
        walletShort: a.payerWallet
          ? `${a.payerWallet.slice(0, 6)}...${a.payerWallet.slice(-4)}`
          : 'unknown',
        totalPaid: a._sum.totalAmount || 0,
        netReceived: a._sum.providerAmount || 0,
        callCount: a._count.id,
      })),
    };

    toCache(cacheKey, payload, 60);
    return res.json(payload);
  } catch (err) {
    console.error('[analytics/top-agents]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/analytics/latency — p50/p95/p99 per endpoint
router.get('/analytics/latency', async (req, res) => {
  try {
    const supabaseId = req.headers['x-user-id'] as string;
    if (!supabaseId) return res.status(401).json({ error: 'Unauthorized' });

    const user = await getCachedUser(supabaseId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const cacheKey = `latency:${user.id}`;
    const cached = await fromCache(cacheKey);
    if (cached) return res.json(cached);

    const calls = await prisma.apiCall.findMany({
      where: { userId: user.id, latencyMs: { not: null } },
      select: { latencyMs: true, endpoint: { select: { path: true } } },
      orderBy: { createdAt: 'desc' },
      take: 1000,
    });

    const byEndpoint: Record<string, number[]> = {};
    for (const call of calls) {
      const path = call.endpoint?.path || 'unknown';
      if (!byEndpoint[path]) byEndpoint[path] = [];
      if (call.latencyMs) byEndpoint[path].push(call.latencyMs);
    }

    const percentile = (arr: number[], p: number) => {
      if (!arr.length) return 0;
      const sorted = [...arr].sort((a, b) => a - b);
      return sorted[Math.max(0, Math.ceil((p / 100) * sorted.length) - 1)];
    };

    const payload = {
      latency: Object.entries(byEndpoint).map(([path, latencies]) => ({
        endpoint: path,
        p50: percentile(latencies, 50),
        p95: percentile(latencies, 95),
        p99: percentile(latencies, 99),
        avg: Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length),
        count: latencies.length,
      })),
    };

    toCache(cacheKey, payload, 60);
    return res.json(payload);
  } catch (err) {
    console.error('[analytics/latency]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/analytics/success-rate — payment success rate + MRR projection
router.get('/analytics/success-rate', async (req, res) => {
  try {
    const supabaseId = req.headers['x-user-id'] as string;
    if (!supabaseId) return res.status(401).json({ error: 'Unauthorized' });

    const user = await getCachedUser(supabaseId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const cacheKey = `success-rate:${user.id}`;
    const cached = await fromCache(cacheKey);
    if (cached) return res.json(cached);

    const since = new Date(Date.now() - 7 * 24 * 3600 * 1000);

    const [total, confirmed, failed, weekRevenue] = await Promise.all([
      prisma.apiCall.count({ where: { userId: user.id, createdAt: { gte: since } } }),
      prisma.apiCall.count({ where: { userId: user.id, status: 'confirmed', createdAt: { gte: since } } }),
      prisma.apiCall.count({ where: { userId: user.id, status: 'failed', createdAt: { gte: since } } }),
      prisma.transaction.aggregate({
        where: { userId: user.id, createdAt: { gte: since } },
        _sum: { providerAmount: true },
      }),
    ]);

    const weekNet = weekRevenue._sum.providerAmount || 0;
    const payload = {
      successRate: total > 0 ? parseFloat(((confirmed / total) * 100).toFixed(1)) : 0,
      failRate: total > 0 ? parseFloat(((failed / total) * 100).toFixed(1)) : 0,
      totalCalls: total,
      confirmedCalls: confirmed,
      failedCalls: failed,
      mrrProjected: parseFloat(((weekNet / 7) * 30).toFixed(6)),
      period: '7d',
    };

    toCache(cacheKey, payload, 30);
    return res.json(payload);
  } catch (err) {
    console.error('[analytics/success-rate]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/analytics/export — CSV export (no cache — user expects fresh data)
router.get('/analytics/export', async (req, res) => {
  try {
    const supabaseId = req.headers['x-user-id'] as string;
    if (!supabaseId) return res.status(401).json({ error: 'Unauthorized' });

    const user = await getCachedUser(supabaseId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const transactions = await prisma.transaction.findMany({
      where: { userId: user.id },
      include: { endpoint: { select: { path: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const csv = [
      'Date,Endpoint,Gross (USDC),Net (USDC),Fee (USDC),Status,TxHash',
      ...transactions.map(t =>
        [
          t.createdAt.toISOString(),
          t.endpoint?.path || '',
          t.totalAmount,
          t.providerAmount,
          t.platformFee,
          t.status,
          t.txHashProvider,
        ].join(',')
      ),
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="gate402-transactions.csv"');
    return res.send(csv);
  } catch (err) {
    console.error('[analytics/export]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/analytics/failed — failed & replayed requests (last 7d)
router.get('/analytics/failed', async (req, res) => {
  try {
    const supabaseId = req.headers['x-user-id'] as string;
    if (!supabaseId) return res.status(401).json({ error: 'Unauthorized' });

    const user = await getCachedUser(supabaseId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const cacheKey = `failed:${user.id}`;
    const cached = await fromCache(cacheKey);
    if (cached) return res.json(cached);

    const since = new Date(Date.now() - 7 * 24 * 3600 * 1000);

    const [failed, replayedCount, byStatus] = await Promise.all([
      prisma.apiCall.findMany({
        where: {
          userId: user.id,
          status: { in: ['failed', 'replayed'] },
          createdAt: { gte: since },
        },
        include: { endpoint: { select: { path: true } } },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      prisma.apiCall.count({
        where: { userId: user.id, status: 'replayed', createdAt: { gte: since } },
      }),
      prisma.apiCall.groupBy({
        by: ['status'],
        where: { userId: user.id, createdAt: { gte: since } },
        _count: { id: true },
      }),
    ]);

    const payload = {
      failed: failed.map(f => ({
        id: f.id,
        endpoint: f.endpoint?.path || 'unknown',
        status: f.status,
        txHash: f.txHash,
        payerWallet: f.payerWallet,
        createdAt: f.createdAt,
      })),
      replayedCount,
      byStatus,
      period: '7d',
    };

    toCache(cacheKey, payload, 30);
    return res.json(payload);
  } catch (err) {
    console.error('[analytics/failed]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// v1.1.0 — phase 5 analytics
export default router;
