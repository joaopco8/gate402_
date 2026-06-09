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
    sitemap: 'https://metera.xyz/sitemap.xml',
    host: 'https://metera.xyz',
  }
}
