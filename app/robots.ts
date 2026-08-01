import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

/** Resolved at build time, not per request — see `app/sitemap.ts`. */
export const dynamic = 'force-static'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
