import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { x402Middleware } from './middleware/x402';
import { requirePro, requireAccount } from './middleware/plan';
import demoRoutes from './routes/demo';
import analyticsRoutes from './routes/analytics';
import verifyRouter from './routes/verify';
import usersRouter from './routes/users';
import endpointsRouter from './routes/endpoints';
import walletRouter from './routes/wallet';
import adminRouter from './routes/admin';
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
  ],
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  optionsSuccessStatus: 200,
}));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Admin routes (protected by ADMIN_SECRET)
app.use('/api', adminRouter);

// Plan enforcement — Pro required for managed server features
app.use('/api/verify-payment', requirePro);
app.use('/api/endpoints/pricing', requirePro);

// Account required for dashboard routes
app.use('/api/metrics', requireAccount);
app.use('/api/calls', requireAccount);
app.use('/api/wallet', requireAccount);
app.use('/api/users', requireAccount);
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

// x402 paywall middleware — runs after all management routes
app.use('/api', x402Middleware);
app.use('/api', demoRoutes);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Gate402 running on port ${PORT}`);
  console.log(`Receiving payments at: ${walletAddress}`);
  console.log(`Network: Solana devnet`);
  console.log(`Get devnet SOL: https://faucet.solana.com`);
  console.log(`[startup] RESEND_API_KEY: ${process.env.RESEND_API_KEY ? 'configured' : 'MISSING'}`);
});
