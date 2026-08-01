import type { MetadataRoute } from 'next'
import { DESCRIPTION, SITE_NAME, TITLE } from '@/lib/site'

/** Resolved at build time, not per request — see `app/sitemap.ts`. */
export const dynamic = 'force-static'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: TITLE,
    short_name: SITE_NAME,
    description: DESCRIPTION,
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
  }
}
