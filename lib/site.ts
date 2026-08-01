/** The one constant that knows about a domain. Nothing else in the codebase
 *  hard-codes one (§2, §11.1). The fallback is the canonical public origin, and
 *  the GitHub Actions build sets the same value explicitly — the two must agree
 *  (github-pages-deployment.spec.md §3.1). */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://horoscode.vgtc.io'

export const SITE_NAME = 'Horoscode'

export const TITLE = 'Horoscode — What Kind of Software Engineer Are You in 2026?'

export const DESCRIPTION =
  'Pick five stars and get your engineering reading — one of eighteen signs, with a forecast for the gap between automation and verification. Free and browser-only.'
