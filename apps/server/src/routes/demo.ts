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

export default router;
