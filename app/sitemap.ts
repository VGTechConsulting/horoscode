import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

/** A metadata route is a handler by default; under `output: 'export'` it has to
 *  declare that it resolves at build time instead. */
export const dynamic = 'force-static'

/** Two routes and no `lastModified`: a date here would be the only clock in the
 *  codebase, and the harness greps for one (§13). Both carry a trailing slash,
 *  which is the URL the export actually serves under `trailingSlash: true`
 *  (github-pages-deployment.spec.md §3.3). */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/`, changeFrequency: 'monthly', priority: 1 },
    { url: `${SITE_URL}/privacy/`, changeFrequency: 'yearly', priority: 0.3 },
  ]
}
