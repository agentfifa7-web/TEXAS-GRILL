import type { MetadataRoute } from 'next'
import { getSiteUrl } from '@/lib/constants'

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl()
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/admin', '/account', '/api', '/checkout', '/cart'] },
    ],
    sitemap: `${base}/sitemap.xml`,
  }
}
