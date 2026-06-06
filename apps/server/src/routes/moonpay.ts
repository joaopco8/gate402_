import { Router } from 'express'
import crypto from 'crypto'

const router = Router()

// POST /api/moonpay/sign-url
router.post('/moonpay/sign-url', async (req, res) => {
  try {
    const { url } = req.body

    if (!url) {
      return res.status(400).json({ error: 'url is required', code: 'MISSING_URL' })
    }

    if (!process.env.MOONPAY_SECRET_KEY) {
      return res.status(500).json({ error: 'MoonPay not configured', code: 'MOONPAY_NOT_CONFIGURED' })
    }

    const urlObj = new URL(url)
    const queryString = urlObj.search

    const signature = crypto
      .createHmac('sha256', process.env.MOONPAY_SECRET_KEY)
      .update(queryString)
      .digest('base64')

    return res.json({ signature })
  } catch (error) {
    console.error('MoonPay sign-url error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
