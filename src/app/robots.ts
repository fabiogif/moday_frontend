import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site-config'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/admin/',
          '/api/',
          '/store/',
          '/pdv/',
          '/orders/',
          '/products/',
          '/categories/',
          '/users/',
          '/profiles/',
          '/permissions/',
          '/settings/',
          '/integrations/',
          '/reports/',
          '/financial/',
          '/contas-bancarias/',
          '/demo/',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
