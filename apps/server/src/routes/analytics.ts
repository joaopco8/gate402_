import { Router } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

// Converte supabaseId (x-user-id header) para o User.id interno do banco
async function getInternalUserId(supabaseId: string | undefined): Promise<string | undefined> {
  if (!supabaseId) return undefined;
  const user = await prisma.user.findUnique({ where: { supabaseId }, select: { id: true } });
  return user?.id;
}

// GET /api/metrics
router.get('/metrics', async (req, res) => {
  try {
    const internalId = await getInternalUserId(req.headers['x-user-id'] as string | undefined);
    const where = internalId ? { userId: internalId } : {};
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [totalCalls, totalUsdcResult, todayCalls, todayUsdcResult, topEndpoint] = await Promise.all([
      prisma.apiCall.count({ where }),
      prisma.apiCall.aggregate({ _sum: { amountUsdc: true }, where }),
      prisma.apiCall.count({ where: { ...where, createdAt: { gte: startOfDay } } }),
      prisma.apiCall.aggregate({ _sum: { amountUsdc: true }, where: { ...where, createdAt: { gte: startOfDay } } }),
      prisma.endpoint.findFirst({ where, orderBy: { calls: { _count: 'desc' } } }),
    ]);

    res.json({
      totalCalls,
      totalUsdc: totalUsdcResult._sum.amountUsdc ?? 0,
      todayCalls,
      todayUsdc: todayUsdcResult._sum.amountUsdc ?? 0,
      topEndpoint: topEndpoint?.path ?? null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/calls/per-day?days=7&endpoint=<path>
router.get('/calls/per-day', async (req, res) => {
  try {
    const internalId = await getInternalUserId(req.headers['x-user-id'] as string | undefined);
    const days = Math.max(1, Math.min(90, parseInt(req.query.days as string) || 7));
    const endpointPath = req.query.endpoint as string | undefined;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const apiCalls = await prisma.apiCall.findMany({
      where: {
        createdAt: { gte: startDate },
        ...(internalId ? { userId: internalId } : {}),
        ...(endpointPath ? { endpoint: { path: endpointPath } } : {}),
      },
      select: { createdAt: true, amountUsdc: true },
    });

    const dbMap = new Map<string, { calls: number; usdc: number }>();
    for (const call of apiCalls) {
      const d = call.createdAt;
      const key = `${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
      const existing = dbMap.get(key) ?? { calls: 0, usdc: 0 };
      dbMap.set(key, { calls: existing.calls + 1, usdc: existing.usdc + call.amountUsdc });
    }

    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
      result.push({ date: key, ...(dbMap.get(key) ?? { calls: 0, usdc: 0 }) });
    }

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/calls/recent?limit=10
router.get('/calls/recent', async (req, res) => {
  try {
    const internalId = await getInternalUserId(req.headers['x-user-id'] as string | undefined);
    const where = internalId ? { userId: internalId } : {};
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 10));
    const calls = await prisma.apiCall.findMany({
      where,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { endpoint: { select: { path: true } } },
    });
    res.json(calls);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/endpoints/revenue
router.get('/endpoints/revenue', async (req, res) => {
  try {
    const internalId = await getInternalUserId(req.headers['x-user-id'] as string | undefined);
    const where = internalId ? { userId: internalId } : {};

    const endpoints = await prisma.endpoint.findMany({
      where,
      include: {
        calls: {
          select: { amountUsdc: true },
        },
      },
    });

    const revenue = endpoints
      .map(ep => ({
        name: ep.path,
        value: ep.calls.reduce((sum, c) => sum + c.amountUsdc, 0),
        calls: ep.calls.length,
      }))
      .filter(ep => ep.value > 0);

    res.json(revenue);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
