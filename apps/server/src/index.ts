import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { x402Middleware } from './middleware/x402';
import { requireAuth } from './middleware/auth';
import { requirePro, requireAccount } from './middleware/plan';
import { globalRateLimit, unpaidRateLimit } from './middleware/rateLimiter';
import { redis } from './lib/redis';
import demoRoutes from './routes/demo';
import analyticsRoutes from './routes/analytics';
import verifyRouter from './routes/verify';
import usersRouter from './routes/users';
import endpointsRouter from './routes/endpoints';
import walletRouter from './routes/wallet';
import adminRouter from './routes/admin';
import billingRouter from './routes/billing'
import meteringRouter from './routes/metering';
import dashboardRouter from './routes/dashboard';
import { walletAddress } from './solana/wallet';

const app = express();
const PORT = parseInt(process.env.PORT ?? '3001', 10);

const ALLOWED_ORIGINS = [
  'https://gate402.dev',
  'https://www.gate402.dev',
  'https://app.gate402.dev',
  'http://localhost:3000',
  'http://localhost:3001',
];

app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: [
        "'self'",
        'https://api.devnet.solana.com',
        'https://api.mainnet-beta.solana.com',
      ],
    },
  },
}));

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (server-to-server, curl, SDK)
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin ${origin} not allowed`));
    }
  },
  allowedHeaders: [
    'Content-Type',
    'X-Payment-Payload',
    'x-user-id',
    'x-api-key',
    'x-agent-wallet',
    'Authorization',
    'stripe-signature',
    'x-admin-secret',
  ],
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  optionsSuccessStatus: 200,
}));
// Stripe webhook needs raw body — must be BEFORE express.json()
app.use('/api/billing/webhook', express.raw({ type: 'application/json' }), billingRouter);

app.use(express.json());

// Auth middleware first — validates Bearer JWT and sets x-user-id header
// Must run BEFORE globalRateLimit so per-user rate limit buckets work correctly
app.use('/api', requireAuth);

app.use(globalRateLimit);
app.use(unpaidRateLimit);

app.get('/health', async (_req, res) => {
  let redisStatus = 'not configured';
  if (redis) {
    try {
      await redis.ping();
      redisStatus = 'connected';
    } catch {
      redisStatus = 'error';
    }
  }
  res.json({ status: 'ok', timestamp: new Date().toISOString(), redis: redisStatus, version: '1.0.0' });
});

// Admin routes (protected by ADMIN_SECRET)
app.use('/api', adminRouter);

// Plan enforcement — Pro required for managed server features
app.use('/api/verify-payment', requirePro);
app.use('/api/endpoints/pricing', requirePro);

// Pro-only analytics & features
app.use('/api/analytics/revenue', requirePro);
app.use('/api/analytics/top-agents', requirePro);
app.use('/api/analytics/latency', requirePro);
app.use('/api/analytics/success-rate', requirePro);
app.use('/api/analytics/export', requirePro);
app.use('/api/analytics/failed', requirePro);
app.use('/api/metering', requirePro);
app.use('/api/wallet/balance', requirePro);
app.use('/api/wallet/withdraw', requirePro);
app.use('/api/users/webhook', requirePro);

// Account required for dashboard routes (/api/users/sync is exempt — it creates new accounts)
app.use('/api/dashboard', requireAccount);
app.use('/api/metrics', requireAccount);
app.use('/api/calls', requireAccount);
app.use('/api/wallet', requireAccount);
app.use('/api/users', (req, res, next) => {
  if (req.path === '/sync' && req.method === 'POST') return next()
  return requireAccount(req, res, next)
});
app.use('/api/endpoints', requireAccount);

// Aggregated dashboard route (single request)
app.use('/api', dashboardRouter);

// Analytics routes
app.use('/api', analyticsRoutes);

// User management routes
app.use('/api', usersRouter);

// Wallet balance + withdrawal routes
app.use('/api', walletRouter);

// Endpoint CRUD + public pricing route
app.use('/api', endpointsRouter);

// External SDK verification endpoint
app.use('/api', verifyRouter);

// Billing routes (checkout + status)
app.use('/api', billingRouter);

// Metering engine — token/compute/bandwidth billing
app.use('/api', meteringRouter);
// Analytics v2 — phase 5

// x402 paywall middleware — runs after all management routes
app.use('/api', x402Middleware);
app.use('/api', demoRoutes);

// Global error handler — must be last middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[error]', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('[startup] Gate402 running on port', PORT);
  console.log(`[startup] Receiving payments at: ${walletAddress}`);
  console.log('[startup] Network:', process.env.NODE_ENV);
  console.log('[startup] Redis:', process.env.REDIS_URL ? 'configured' : 'NOT configured (fallback mode)');
  console.log('[startup] Database:', process.env.DATABASE_URL ? 'configured' : 'MISSING');
  console.log('[startup] Admin secret:', process.env.ADMIN_SECRET ? 'configured' : 'MISSING');
  console.log(`[startup] RESEND_API_KEY: ${process.env.RESEND_API_KEY ? 'configured' : 'MISSING'}`);

  if (redis) {
    redis.connect().then(() => {
      console.log('[startup] Redis connected');
    }).catch((e: Error) => {
      console.warn('[startup] Redis connection failed — continuing without cache:', e.message);
    });
  }
});

