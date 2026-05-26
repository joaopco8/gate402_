import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard',
          '/dashboard/',
          '/wallet',
          '/endpoints',
          '/analytics',
          '/playground',
          '/settings',
          '/billing',
          '/post-login',
          '/auth/callback',
          '/api/',
        ],
      },
    ],
    sitemap: 'https://www.gate402.dev/sitemap.xml',
    host: 'https://www.gate402.dev',
  }
}
