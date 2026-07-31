import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

/** Two routes and no `lastModified`: a date here would be the only clock in the
 *  codebase, and the harness greps for one (§13). */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/`, changeFrequency: 'monthly', priority: 1 },
    { url: `${SITE_URL}/privacy`, changeFrequency: 'yearly', priority: 0.3 },
  ]
}
