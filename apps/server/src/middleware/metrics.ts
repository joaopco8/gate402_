import { Request, Response, NextFunction } from 'express'

export function requestMetrics(req: Request, res: Response, next: NextFunction) {
  const start = Date.now()

  res.on('finish', () => {
    const duration = Date.now() - start
    const log = {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration,
      slow: duration > 500,
    }

    if (duration > 500) {
      console.warn('SLOW_REQUEST', JSON.stringify(log))
    } else {
      console.log(JSON.stringify(log))
    }
  })

  next()
}
