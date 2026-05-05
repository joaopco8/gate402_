import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { x402Middleware } from './middleware/x402';
import demoRoutes from './routes/demo';
import analyticsRoutes from './routes/analytics';
import { walletAddress } from './solana/wallet';

const app = express();
const PORT = parseInt(process.env.PORT ?? '3001', 10);

app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:3001',
  ],
  allowedHeaders: [
    'Content-Type',
    'X-Payment-Payload',
    'x-user-id',
    'x-api-key',
    'Authorization',
  ],
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
  optionsSuccessStatus: 200,
}));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Analytics routes (no paywall)
app.use('/api', analyticsRoutes);

// x402 paywall middleware — runs after analytics routes
app.use('/api', x402Middleware);
app.use('/api', demoRoutes);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Gate402 running on port ${PORT}`);
  console.log(`Receiving payments at: ${walletAddress}`);
  console.log(`Network: Solana devnet`);
  console.log(`Get devnet SOL: https://faucet.solana.com`);
});
