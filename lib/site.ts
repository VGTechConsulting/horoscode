/** The one constant that knows about a domain. Nothing else in the codebase
 *  hard-codes one (§2, §11.1). The fallback is the canonical public origin, and
 *  the GitHub Actions build sets the same value explicitly — the two must agree
 *  (github-pages-deployment.spec.md §3.1). */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://horoscode.vgtc.io'

export const SITE_NAME = 'Horoscode'

/** Public source repository — linked from the footer. */
export const REPO_URL = 'https://github.com/VGTechConsulting/horoscode'

export const TITLE = 'Horoscode — Forecast Your Future in Your Project'

export const DESCRIPTION =
  'Pick five stars to find your engineering sign and see whether your review process matches the stakes. Free, private, and browser-only.'
