import { Router } from 'express';

const router = Router();

router.get('/weather', (_req, res) => {
  res.json({
    city: 'São Paulo',
    temp: '28°C',
    condition: 'Sunny',
    humidity: '72%',
  });
});

router.get('/news', (_req, res) => {
  res.json({
    headline: 'AI agents are revolutionizing API billing',
    source: 'TechCrunch',
    timestamp: new Date(),
  });
});

router.post('/echo', (req, res) => {
  res.json({
    echo: req.body,
    method: 'POST',
    timestamp: new Date().toISOString(),
    message: 'Gate402 x402 payment verified. Body received.',
  });
});

router.get('/echo', (_req, res) => {
  res.json({
    endpoint: '/api/echo',
    description: 'Echo endpoint for testing Gate402 POST requests',
    usage: 'Send any JSON body via POST with valid payment',
    timestamp: new Date().toISOString(),
  });
});

export default router;
