import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

const router = Router();

// GET /api/metrics
router.get('/metrics', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string | undefined;
    const where = userId ? { userId: userId } : {};
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

// GET /api/calls/per-day?days=7
router.get('/calls/per-day', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string | undefined;
    const days = Math.max(1, Math.min(90, parseInt(req.query.days as string) || 7));
    const endpointPath = req.query.endpoint as string | undefined;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const apiCalls = await prisma.apiCall.findMany({
      where: {
        createdAt: { gte: startDate },
        ...(userId ? { userId } : {}),
        ...(endpointPath ? { endpoint: { path: endpointPath } } : {}),
      },
      select: { createdAt: true, amountUsdc: true },
    });

    // Group by date in JS
    const dbMap = new Map<string, { calls: number; usdc: number }>();
    for (const call of apiCalls) {
      const d = call.createdAt;
      const key = `${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
      const existing = dbMap.get(key) ?? { calls: 0, usdc: 0 };
      dbMap.set(key, { calls: existing.calls + 1, usdc: existing.usdc + call.amountUsdc });
    }

    // Fill all days in range
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
    const userId = req.headers['x-user-id'] as string | undefined;
    const where = userId ? { userId: userId } : {};
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

// GET /api/endpoints
router.get('/endpoints', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string | undefined;
    const where = userId ? { userId: userId } : {};
    const endpoints = await prisma.endpoint.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { calls: true } } },
    });
    res.json(endpoints);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const createEndpointSchema = z.object({
  path: z.string().startsWith('/'),
  priceUsdc: z.number().positive(),
  description: z.string().optional(),
});

// POST /api/endpoints
router.post('/endpoints', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string | undefined;
    const parsed = createEndpointSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0].message });
      return;
    }
    const { path, priceUsdc, description } = parsed.data;
    const endpoint = await prisma.endpoint.create({ data: { path, priceUsdc, description, userId } });
    res.status(201).json(endpoint);
  } catch (err: unknown) {
    const pe = err as { code?: string };
    if (pe.code === 'P2002') {
      res.status(409).json({ error: 'Endpoint path already exists' });
      return;
    }
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/endpoints/revenue
router.get('/endpoints/revenue', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string | undefined;
    const where = userId ? { userId: userId } : {};

    const endpoints = await prisma.endpoint.findMany({
      where,
      include: {
        calls: {
          where,
          select: { amountUsdc: true },
        },
      },
    });

    const revenue = endpoints
      .map(ep => ({
        name: ep.path,
        value: ep.calls.reduce((sum: number, c: { amountUsdc: number }) => sum + c.amountUsdc, 0),
        calls: ep.calls.length,
      }))
      .filter(ep => ep.value > 0);

    res.json(revenue);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/endpoints/:id
router.patch('/endpoints/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { active } = z.object({ active: z.boolean() }).parse(req.body);
    const endpoint = await prisma.endpoint.update({ where: { id }, data: { active } });
    res.json(endpoint);
  } catch (err: unknown) {
    const pe = err as { code?: string };
    if (pe.code === 'P2025') {
      res.status(404).json({ error: 'Endpoint not found' });
      return;
    }
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
