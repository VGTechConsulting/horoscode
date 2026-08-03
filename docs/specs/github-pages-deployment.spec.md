# Horoscode — GitHub Pages deployment — Spec

Deploy Horoscode as a fully static Next.js application through GitHub Actions to GitHub Pages. The public, canonical origin is `https://horoscode.vgtc.io`; the GitHub project URL is an entry point that redirects to that custom origin.

**This document is a scoped amendment to [`main.spec.md`](main.spec.md).** It supersedes only the rendering, share-card, analytics, privacy, verification, and deployment requirements named below. Every product, content, interaction, accessibility, and visual requirement not explicitly changed here remains in force.

---

## 1. Outcome

A merge to `main` must verify, build, and deploy the application without a long-lived deployment branch and without a Node.js server at runtime.

| Concern | Required value |
| --- | --- |
| Hosting | GitHub Pages |
| Build and deployment | GitHub Actions |
| Canonical URL | `https://horoscode.vgtc.io/` |
| GitHub project URL | `https://vgtechconsulting.github.io/horoscode/` |
| GitHub URL behaviour | Redirect to the canonical URL |
| Runtime | Static HTML, CSS, JavaScript, images, and metadata files only |
| Deployment source | `main` |
| Build output | `out/` |
| Package manager | pnpm, frozen lockfile |
| Node.js | 22, which satisfies the assertion harness requirement of Node.js 22.18 or newer |

The custom domain is the one public origin. The GitHub project URL is not a second independently rendered copy of the site. GitHub Pages owns the redirect after the repository's custom domain is configured.

### 1.1 URL invariants

1. The application is built for `/`, not for `/horoscode`.
2. `basePath` and `assetPrefix` are not set.
3. `NEXT_PUBLIC_SITE_URL` is `https://horoscode.vgtc.io`, with no trailing slash.
4. Canonical, Open Graph, sitemap, robots, manifest, structured-data, and copied URLs use the custom origin.
5. A request to `https://vgtechconsulting.github.io/horoscode/` redirects to `https://horoscode.vgtc.io/` before application assets are resolved.
6. Query strings must survive that redirect. A complete reading opened at the GitHub URL must arrive at the custom domain with the same five star parameters and open on the same reading.

Building with `basePath: '/horoscode'` is forbidden. It would make Next.js assets work at the unredirected project path but would move the custom-domain application to `https://horoscode.vgtc.io/horoscode/`, which is not the required public URL.

### 1.2 Non-goals

- Serving independent, non-redirecting copies from both origins.
- Adding a server, serverless function, edge function, proxy, or deployment adapter.
- Preserving per-result social images; §4 replaces them with one static image.
- Selecting or integrating a new analytics vendor; §5 disables analytics until that is specified separately.
- Reproducing the response headers from the current Next.js server configuration; GitHub Pages does not expose per-project response-header configuration.
- Managing DNS through this repository.
- Creating or force-pushing a `gh-pages` branch.

---

## 2. Static-export conversion

### 2.1 Next.js configuration

`next.config.mjs` must contain the following deployment-relevant configuration:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
}

export default nextConfig
```

Requirements:

- `output: 'export'` makes `next build` produce `out/`.
- `trailingSlash: true` emits directory-style routes such as `out/privacy/index.html`, which GitHub Pages can serve without rewrites.
- `images.unoptimized` remains enabled because GitHub Pages has no Next.js image-optimization runtime.
- The current `headers()` function is removed. Static export does not support it, and no replacement meta tags are added as part of this work.
- No redirects or rewrites are added to Next.js. The GitHub-to-custom-domain redirect is a GitHub Pages concern.

### 2.2 Supported routes

The exported artifact must contain:

| URL | Artifact |
| --- | --- |
| `/` | `out/index.html` |
| `/privacy/` | `out/privacy/index.html` |
| `/404.html` | `out/404.html` |
| `/opengraph-image.png` | Static Open Graph image generated at build time |
| `/icon.svg` | `out/icon.svg`, copied verbatim from `app/icon.svg` (§3.4) |
| `/sitemap.xml` | `out/sitemap.xml` |
| `/robots.txt` | `out/robots.txt` |
| `/manifest.webmanifest` | Static manifest output |

The artifact must not contain an `/api/og` endpoint or any other route requiring a request-time handler.

### 2.3 Local commands and package metadata

- `pnpm build` remains `next build` and must produce `out/`.
- The current `next start` command is no longer a valid production preview for this project. Replace it with a command that serves `out/` using a pinned development dependency, or replace the script with a clearly named static `preview` command.
- Add an exact `packageManager` entry for pnpm 10 to `package.json`; CI must use that version rather than an unpinned global installation.
- Preserve `pnpm dev`, `pnpm typecheck`, `pnpm lint`, and `pnpm verify`.
- Update the README so its production instructions describe building and serving `out/`, not starting a Next.js server.

---

## 3. Origin and metadata

### 3.1 Site constant

`lib/site.ts` remains the only module that owns the public origin. Its fallback changes to:

```ts
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://horoscode.vgtc.io'
```

The GitHub Actions build sets the same value explicitly. The fallback exists for local production builds and must agree with CI.

### 3.2 Static page metadata

The `generateMetadata({ searchParams })` function in `app/page.tsx` is removed. Page metadata becomes static and must include:

- the existing title and description;
- canonical URL `https://horoscode.vgtc.io/`;
- Open Graph type `website`, existing title and description, and URL `https://horoscode.vgtc.io/`;
- Twitter card type `summary_large_image` with the existing title and description;
- `robots: { index: true, follow: true }`.

The page must not read search parameters on the server or during metadata generation. Query parameters remain a client-side state input after hydration exactly as specified by `main.spec.md` §10.1.

### 3.3 Other metadata surfaces

- `metadataBase` uses `SITE_URL`.
- Sitemap entries use `https://horoscode.vgtc.io/` and `https://horoscode.vgtc.io/privacy/`.
- `robots.txt` points at `https://horoscode.vgtc.io/sitemap.xml`.
- Structured data uses the custom-domain URLs.
- The manifest's `start_url` remains `/` because the installed application is rooted at the custom domain.
- No metadata surface emits `horoscode.dev` or `vgtechconsulting.github.io`.

### 3.4 Application icon

The application ships one icon, `app/icon.svg`, picked up by Next as a static file convention rather than generated: it exports with a real extension, so unlike the share card in §4.1 it needs nothing from the postbuild finalizer.

- The mark is the cross accent of `main.spec.md` §3.3 — the application's own glyph, not the firm's wordmark.
- One scalable file covers every size. It declares a `viewBox` and no pixel `width` or `height`, because a pinned size would be treated as a raster of that size and rejected for the larger slots.
- The stroke is an eighth of the box rather than the hairline `components/cross-accent.tsx` draws, which is invisible at sixteen pixels.
- The square is opaque. A favicon is composited onto browser chrome, launcher, and bookmark backgrounds the file cannot see, and a transparent glyph that inverts can land on its own colour.
- Light and dark come from `prefers-color-scheme` inside the file, matching `app/globals.css`. The two fills are that palette's ends — `#ffffff` and `#000000` — spelled in hex, because an SVG icon is parsed on its own and cannot read the application's tokens. No third colour.
- `app/manifest.ts` declares it as the sole entry in `icons`, with `sizes: 'any'` and `type: 'image/svg+xml'`. A manifest with `display: 'standalone'` and no icons is not installable.

Out of scope, and deliberately: an `apple-touch-icon`, which Safari will not accept as SVG and which would mean either a committed binary or a rasterizer this repository does not have.

---

## 4. Sharing

This section supersedes `main.spec.md` §11.2 and the dynamic-share-card assertions in §13.

### 4.1 Static Open Graph card

- Delete `app/api/og/route.tsx`.
- Keep `app/opengraph-image.tsx` as the single Open Graph image.
- The image remains 1200 × 630 and retains the current black-and-white visual language.
- The image is generic: it does not include the visitor's resolved sign, epithet, or verdict.
- No external request is made while generating it.
- A postbuild finalizer renames Next's extensionless export to `out/opengraph-image.png` and rewrites generated metadata to `/opengraph-image.png`, allowing static hosts to serve it as `image/png`.
- The final artifact must not retain the extensionless `out/opengraph-image` file or any metadata reference to its generated query-string URL.

The result URL continues to carry all five star parameters. Sharing a result therefore restores the correct interactive reading even though link unfurlers receive the generic image.

### 4.2 Copied URLs

The existing serialization contract remains:

```text
https://horoscode.vgtc.io/?c=…&r=…&j=…&s=…&e=…
```

`Copy link` and the URL line in `Copy as text` must use the custom origin. They must never emit:

- `https://horoscode.dev`;
- `https://vgtechconsulting.github.io/horoscode`;
- `/horoscode` on the custom domain.

The five parameter names, validation rules, round-trip guarantees, and absence of client-side persistence remain unchanged.

---

## 5. Analytics and privacy

This section supersedes `main.spec.md` §12.

### 5.1 Analytics

Vercel Analytics is removed because its `/_vercel/insights/*` runtime endpoints are not present on GitHub Pages.

- Remove `<Analytics />` and its import from `app/layout.tsx`.
- Remove `@vercel/analytics` from dependencies.
- Preserve the typed `track()` boundary in `lib/analytics.ts` as a no-op so interaction components do not gain vendor-specific conditionals.
- The no-op must have the same public function signature and must not log to the console, write storage, send a request, or enqueue events.
- Selecting a replacement analytics provider is separate work requiring its own privacy review.

### 5.2 Privacy copy

`/privacy/` must no longer claim that anonymous Vercel Analytics is collected. Its required meaning is:

> Horoscode stores nothing. Your five picks live in the page's address bar and nowhere else — there are no cookies, no local storage, no analytics, and no accounts, so closing the tab is the whole of it.

The exact wrapping and typography remain governed by the main spec.

---

## 6. Continuous integration and deployment

Create `.github/workflows/pages.yml`.

### 6.1 Triggers

- `pull_request`: verify and build only.
- `push` to `main`: verify, build, upload, and deploy.
- `workflow_dispatch`: permitted, but deployment runs only when the selected ref is `main`.
- A push to any non-`main` branch must not deploy.

### 6.2 Build job

The build job runs on `ubuntu-latest` and performs these steps in order:

1. Check out the repository.
2. Install the exact pnpm version declared by `packageManager`.
3. Install Node.js 22 and enable the pnpm dependency cache using `pnpm-lock.yaml`.
4. Run `pnpm install --frozen-lockfile`.
5. Run `pnpm verify`.
6. Run `pnpm build` with `NEXT_PUBLIC_SITE_URL=https://horoscode.vgtc.io`.
7. Assert that `out/index.html` exists.
8. Create `out/.nojekyll` so `_next` is served as a normal directory.
9. On deployable events only, configure Pages and upload `out/` with the GitHub Pages artifact action.

The build must fail on a verification failure, type error, lint error, assertion failure, dependency-lock mismatch, or static-export error. A failed build must never leave a new Pages deployment.

### 6.3 Deploy job

- The deploy job depends on a successful build job.
- It runs only for a push to `main` or a manual dispatch whose ref is `main`.
- It uses the `github-pages` environment.
- It declares the deployed URL from the deployment action output.
- It has `pages: write` and `id-token: write` permissions; repository contents remain read-only.
- Deployment concurrency group is `github-pages`.
- An in-progress production deployment is not cancelled by a newer run.
- It deploys the uploaded artifact with the official Pages deployment action.

### 6.4 Action versions

Use current supported major versions at implementation time, with these minimums:

| Action | Minimum major |
| --- | --- |
| `actions/checkout` | `v6` |
| `pnpm/action-setup` | `v6` |
| `actions/setup-node` | `v6` |
| `actions/configure-pages` | `v5` |
| `actions/upload-pages-artifact` | `v4` |
| `actions/deploy-pages` | `v4` |

No third-party deployment action is permitted.

Actions owned by GitHub may be referenced by major tag. `pnpm/action-setup` is the only
one here that is not, and it is pinned to a commit SHA with the version in a trailing
comment: a mutable major tag on a third-party action is a supply-chain decision taken by
someone outside this repository. Dependabot's `github-actions` ecosystem moves the pin and
the comment together.

### 6.5 Outbound-link workflow

The outbound-link check does not run on pull requests. It reaches eighteen URLs on a host
this repository does not control, so it fails for reasons no commit caused, and gating
contributor pull requests on a third party's uptime turns a link-rot monitor into a build
gate.

- `scripts/verify.mjs` gates the check on `CHECK_LINKS`, not on `CI`.
- `.github/workflows/links.yml` runs `pnpm verify` with `CHECK_LINKS=1` on a weekly
  schedule and on `workflow_dispatch`, with `contents: read` and no upload.
- Every other assertion in the harness stays on the pull-request path, where it belongs:
  all of them are deterministic and depend on nothing outside the repository.

---

## 7. GitHub Pages and DNS configuration

These are manual repository and DNS operations. They are required for release but are not represented by a committed `CNAME` file when using the custom Actions workflow.

### 7.1 Repository settings

1. In repository **Settings → Pages**, select **GitHub Actions** as the publishing source.
2. Add `horoscode.vgtc.io` as the custom domain before changing DNS.
3. After DNS and certificate provisioning succeed, enable **Enforce HTTPS**.
4. Restrict the `github-pages` environment to deployments from `main` if repository policy supports environment deployment rules.

### 7.2 DNS

Create this record in the authoritative DNS zone for `vgtc.io`:

| Type | Name | Value |
| --- | --- | --- |
| `CNAME` | `horoscode` | `vgtechconsulting.github.io` |

Requirements:

- The value excludes the repository name and contains no path.
- No proxied or flattened record is required. If the DNS provider offers proxying, begin with DNS-only mode until GitHub provisions HTTPS.
- Do not add a wildcard record for this deployment.
- Verify the record with `dig horoscode.vgtc.io CNAME` or an equivalent DNS lookup.

### 7.3 Release sequencing

1. Merge the static-export implementation and workflow to `main`.
2. Confirm the Pages build deploys successfully.
3. Add the custom domain in GitHub Pages settings.
4. Add the DNS CNAME.
5. Wait for GitHub's DNS check and TLS certificate.
6. Enable HTTPS.
7. Run the production acceptance pass in §9.

The default GitHub project URL is not a valid pre-domain preview for this root-based build. Before the custom-domain redirect is active, root-relative `/_next/*` assets may resolve against `vgtechconsulting.github.io` instead of the repository path. Pull-request validation therefore relies on the exported artifact and a local static server, not the project URL.

---

## 8. Automated verification

### 8.1 Existing harness changes

Update `scripts/verify.mjs` to reflect the static share surface:

- Remove `app/api/og/route.tsx` from the sign-name/epithet surface assertion.
- Keep the assertion that the reading and `summariseAsText` resolve the same sign name and epithet without a Reference-derived modifier.
- Use `https://horoscode.vgtc.io` wherever the harness needs a representative origin.
- Keep all arithmetic, reachability, serialization, no-randomness, no-storage, copy, target-size, and outbound-link assertions. The outbound-link check moves behind `CHECK_LINKS` and off the pull-request path (§6.5); it is not removed.
- Add a guard that shipped application sources do not reference `@vercel/analytics`, `/_vercel/insights`, or `horoscode.dev`.
- Add a guard that `next.config.mjs` sets neither `basePath` nor `assetPrefix`, so the build stays rooted at `/` (§1.1).
- Assert the §3.4 icon: a `viewBox` and no pinned pixel size, an opaque ground, a `prefers-color-scheme` rule, no script, no fill outside the two palette ends, and a manifest entry naming it with `sizes: 'any'`.
- Delete `lib/sign-glyphs.ts` and the assertion covering it. The vendored path data existed only because the per-result card of `main.spec.md` §11.2 could not call `lucide-react` across its `"use client"` boundary; §4.1 removed that card, leaving a module whose sole consumer was the check that verified it.

### 8.2 Export assertions

CI must check the built artifact for all of the following:

- `out/index.html` exists.
- `out/privacy/index.html` exists.
- `out/404.html` exists.
- `out/.nojekyll` exists before upload.
- `out/sitemap.xml`, `out/robots.txt`, and the web manifest exist.
- `out/icon.svg` exists, every exported page carries a `rel="icon"` link to it, and every icon the manifest names is a file that was exported (§3.4). Next appends a cache-busting query to the href, so the assertion matches the path, not the whole attribute.
- no server bundle is required to serve the artifact;
- no output file contains `horoscode.dev`;
- no HTML or manifest file contains `/_vercel/insights`;
- generated metadata contains `https://horoscode.vgtc.io`;
- the artifact contains no exported `/api/og` path.

These checks may live in `scripts/verify-export.mjs` and run after `pnpm build`. They must not use brittle hashed Next.js asset names.

The origin the harness expects is read from `NEXT_PUBLIC_SITE_URL`, falling back to the
same constant as `lib/site.ts`, so a fork can validate its own artifact against its own
domain rather than this one.

---

## 9. Acceptance criteria

### 9.1 Pull request

- A pull request runs install, typecheck, lint, the assertion harness, and a complete static export.
- It does not upload or deploy a Pages artifact.
- The workflow passes from a clean checkout with no uncommitted generated files.

### 9.2 Production deployment

After a merge to `main`:

1. The workflow deploys exactly one Pages artifact from `out/`.
2. `https://horoscode.vgtc.io/` returns the app over HTTPS.
3. `https://horoscode.vgtc.io/privacy/` loads directly and after client navigation.
4. Refreshing `/privacy/` does not return a 404.
5. Next.js JavaScript, CSS, and font assets return successful responses from the custom origin.
6. `https://vgtechconsulting.github.io/horoscode/` redirects to `https://horoscode.vgtc.io/`.
7. The redirect uses HTTPS and does not form a loop.
8. A GitHub-URL request carrying all five reading parameters arrives at the same reading on the custom domain with all parameters intact.
9. A complete reading copied from the application begins with `https://horoscode.vgtc.io/?`.
10. A copied link opened in a clean browser session restores the same sign and verdict.
11. The generic Open Graph image loads from the custom domain.
12. The icon loads from the custom domain and renders in the tab, in both colour schemes.
13. `sitemap.xml`, `robots.txt`, and the manifest contain only canonical custom-domain URLs where absolute URLs are required.
14. Browser network inspection shows no request to `/_vercel/insights/*`.
15. Browser storage inspection shows no cookies, local storage, session storage, or IndexedDB written by the app.
16. No console error is emitted by a missing analytics script or endpoint.

### 9.3 Regression pass

Run the existing manual pass from `main.spec.md` §13, with these substitutions:

- all shared-link tests use `https://horoscode.vgtc.io`;
- social-share verification expects the generic card, not a sign-specific card;
- analytics verification expects no analytics request;
- add a hard refresh on every exported route.

---

## 10. File-level change map

| File | Required change |
| --- | --- |
| `next.config.mjs` | Enable static export and trailing slashes; remove headers |
| `package.json` | Pin pnpm; replace the server-based production preview; remove Vercel Analytics |
| `pnpm-lock.yaml` | Reflect dependency and package-manager changes |
| `lib/site.ts` | Change the fallback origin to `https://horoscode.vgtc.io` |
| `app/page.tsx` | Replace query-dependent metadata with static metadata |
| `app/api/og/route.tsx` | Delete |
| `lib/sign-glyphs.ts` | Delete — vendored only for the card §4.1 removes (§8.1) |
| `app/opengraph-image.tsx` | Retain as the only share image; adjust comments if needed |
| `app/icon.svg` | Add the application icon (§3.4) |
| `app/manifest.ts` | Declare the icon, so `display: 'standalone'` is installable (§3.4) |
| `app/layout.tsx` | Remove Vercel Analytics component and import |
| `lib/analytics.ts` | Replace vendor wrapper with typed no-op |
| `app/privacy/page.tsx` | Remove the analytics claim |
| `app/sitemap.ts` | Ensure canonical trailing-slash URLs |
| `scripts/finalize-export.mjs` | Give the generated Open Graph PNG an extension and rewrite its metadata URL |
| `scripts/verify.mjs` | Remove dynamic-card assumptions and add deployment guards |
| `scripts/verify-export.mjs` | Add artifact assertions |
| `.github/workflows/pages.yml` | Add CI and Pages deployment pipeline |
| `README.md` | Document static build, preview, deployment, URLs, and external setup |

No content record, model weight, verdict, forecast, sign resolution rule, interaction layout, or accessibility behaviour changes as part of this work.
