import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { x402Middleware } from './middleware/x402';
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
import billingRouter from './routes/billing';
import { walletAddress } from './solana/wallet';

const app = express();
const PORT = parseInt(process.env.PORT ?? '3001', 10);

app.use(cors({
  origin: '*',
  allowedHeaders: [
    'Content-Type',
    'X-Payment-Payload',
    'x-user-id',
    'x-api-key',
    'Authorization',
    'stripe-signature',
  ],
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  optionsSuccessStatus: 200,
}));
// Stripe webhook needs raw body — must be BEFORE express.json()
app.use('/api/billing/webhook', express.raw({ type: 'application/json' }), billingRouter);

app.use(express.json());

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

// Account required for dashboard routes (/api/users/sync is exempt — it creates new accounts)
app.use('/api/metrics', requireAccount);
app.use('/api/calls', requireAccount);
app.use('/api/wallet', requireAccount);
app.use('/api/users', (req, res, next) => {
  if (req.path === '/sync' && req.method === 'POST') return next()
  return requireAccount(req, res, next)
});
app.use('/api/endpoints', requireAccount);

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

// x402 paywall middleware — runs after all management routes
app.use('/api', x402Middleware);
app.use('/api', demoRoutes);

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

