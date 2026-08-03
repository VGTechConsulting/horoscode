# Horoscode

Pick five traits, one at a time, and a fixed lookup table tells you which of eighteen
engineering signs you are, and what the forecast is. No forms, no numbers on screen, no
backend, no randomness, no account.

Built from [`docs/specs/main.spec.md`](docs/specs/main.spec.md), amended for deployment by
[`docs/specs/github-pages-deployment.spec.md`](docs/specs/github-pages-deployment.spec.md).
Together they are the normative documents for everything below.

Live at **<https://horoscode.vgtc.io>**.

## Running it

```sh
pnpm install
pnpm dev                # http://localhost:3000
pnpm verify             # typecheck, lint, and the assertion harness
```

The pnpm version is pinned by `packageManager` in `package.json`; run `pnpm install` and it
will fetch that exact version for you.

### Production

There is no production server. `pnpm build` is a static export: it writes `out/`, which is
plain HTML, CSS, JavaScript, fonts, and metadata files, and that directory is the whole
deployable artifact.

```sh
pnpm build              # writes out/
touch out/.nojekyll     # what CI does before uploading
pnpm verify:export      # assertions about the built artifact
pnpm preview            # serves out/ on http://localhost:3000
```

`pnpm preview` uses a pinned `serve`, not `next start` — the app has no Node.js runtime in
production, so starting one locally would preview something that does not exist.

The `postbuild` lifecycle finalizes Next's extensionless generated share card as
`out/opengraph-image.png` and rewrites the generated metadata to that URL. The explicit
extension lets static hosts return the correct `image/png` media type.

`NEXT_PUBLIC_SITE_URL` is the only environment variable and the only place a domain is
written down (see `lib/site.ts`). It defaults to `https://horoscode.vgtc.io`, which is the
same value CI passes explicitly; the two must agree.

## Deployment

`.github/workflows/pages.yml` is the whole pipeline. A pull request installs with a frozen
lockfile, runs `pnpm verify`, and completes a static export — it uploads nothing. A push to
`main` does all of that, writes `out/.nojekyll`, runs `pnpm verify:export`, and deploys the
artifact to GitHub Pages. There is no `gh-pages` branch, no deployment adapter, and no
third-party action.

The default GitHub project URL is not a preview: this build is rooted at `/`, so
`basePath` and `assetPrefix` are deliberately unset, and root-relative `/_next/*` assets
only resolve correctly once the custom-domain redirect is live. Validate a change against
`out/` and `pnpm preview` instead.

### External setup, done once and not by this repository

1. **Settings → Pages**: publishing source **GitHub Actions**.
2. **Settings → Pages**: custom domain `horoscode.vgtc.io`, added before the DNS change.
3. DNS for `vgtc.io`: `CNAME  horoscode  vgtechconsulting.github.io` — no repository name,
   no path, no wildcard, DNS-only if the provider offers proxying. Check it with
   `dig horoscode.vgtc.io CNAME`.
4. After GitHub's DNS check and certificate provisioning, enable **Enforce HTTPS**.
5. Restrict the `github-pages` environment to deployments from `main`.

There is no committed `CNAME` file: with the Actions publishing source, the custom domain
is repository configuration, and GitHub Pages owns the redirect from
`https://vgtechconsulting.github.io/horoscode/` to `https://horoscode.vgtc.io/`, query
string intact.

## Forking

Everything here is MIT, sign copy included. Two things are wired to this deployment and
will need changing in yours.

**The origin.** `NEXT_PUBLIC_SITE_URL` is the only place a domain is written down. Set it
in your build — the workflow passes it explicitly — and both the metadata and the copied
links follow. `scripts/verify-export.mjs` reads the same variable, so the artifact harness
checks your origin rather than this one.

**The path.** This build is rooted at `/`, because it is served from a domain root. A
project site at `https://<you>.github.io/horoscode/` is served from a subdirectory and
needs `basePath` and `assetPrefix` set in `next.config.mjs`, or every `/_next/*` asset
404s. One assertion in `scripts/verify.mjs` — *The build is rooted at `/`* — exists to stop
that being reintroduced here by accident, so you will need to relax it. It is a deliberate
invariant for this deployment, not a claim about how Next.js should be configured.

The simplest way to avoid both is to deploy at a domain root of your own.

## Layout

```
app/
  layout.tsx            fonts, top bar, bottom rule
  page.tsx              static metadata, schemas, hero, sign catalogue
  globals.css           tokens, motion, target hygiene
  icon.svg              the cross accent as a favicon, inverted by the system query
  opengraph-image.tsx   the one generic share card, drawn at build time
  privacy/page.tsx
components/
  horoscode.tsx         the client island: stage, rail, reading
  cross-accent.tsx
lib/
  horoscode.ts          pure model — no React, no icons, no DOM, no storage
  horoscode-icons.ts    lucide maps, kept out of the pure module
  analytics.ts          the typed track() boundary, currently a no-op
  site.ts               the one constant that knows about a domain
content/
  signs.ts              the eighteen records
scripts/
  finalize-export.mjs   gives the generated share card a static-host-safe URL
  verify.mjs            the assertion harness, over the sources
  verify-export.mjs     the assertion harness, over out/
```

`lib/horoscode.ts` depends on nothing but `content/signs.ts`, so `scripts/verify.mjs`
imports it directly — Node ≥ 22.18 strips the types on load, which is why there is no test
runner here.

## Sharing and analytics

The share card is generic: one 1200 × 630 image for every reading, because a per-result
card needed a request-time handler and there is no longer anywhere to run one. A shared
link still restores the exact reading — the five params travel in the URL, and only the
unfurler's thumbnail goes generic.

There is no analytics vendor. `lib/analytics.ts` keeps its typed `track()` signature as a
no-op so the eighteen call sites need no vendor conditionals; picking a replacement is
separate work with its own privacy review. Nothing is logged, stored, queued, or sent.

## Verification

`pnpm verify` runs `next typegen && tsc --noEmit`, `eslint .`, and the source harness, which
asserts the properties the spec claims in prose: the arithmetic is exact over all two
hundred and sixteen states, the four verdict bands partition the margin range, the eighteen
signs are each reachable and reachable only where their record says, Reference moves
independence by its declared bonus and nothing else, Judgement splits exactly one house,
every Believer state is under-verified, exactly two forecast cells are dead, no user-facing
string carries a digit, the URL round-trips and emits exactly five params, the reading and
the copied text carry the same sign name, the icon is one scalable file in the two palette
colours and the manifest points at it, the build is rooted at `/`, and the sources
contain no randomness, no second result taxonomy, no client-side storage, no removed
vendor, no retired origin, and no button without a minimum target.

`CHECK_LINKS=1 pnpm verify` adds a HEAD check on every outbound link in the eighteen
records. It is deliberately not part of pull-request CI: it depends on a host this
repository does not control, so a failure there is link rot rather than a regression,
and gating a contributor's pull request on someone else's uptime is the wrong trade.
`.github/workflows/links.yml` runs it weekly and on demand instead.

`pnpm verify:export` asserts things about `out/` that the sources cannot show: every route
exists as a file, nothing needs a runtime, every page links the exported icon and the
manifest declares it, no `/api/og` path survived, no output names the retired origin or an
analytics beacon, generated metadata names the canonical origin, and `.nojekyll` is in
place.

The manual pass — one-handed completion on a phone, reduced motion, dark mode, keyboard,
screen readers, both copy paths, a hard refresh on every exported route, Lighthouse — is
listed at the end of §13 of the main spec and §9 of the deployment spec, and has not been
run here.

## Content

All eighteen sign records and their shipped copy live in `content/signs.ts`. The main spec
defines the model and content constraints; this repository contains everything required to
build, test, deploy, and maintain the application. Links from sign records intentionally
point to public VG Tech articles and services.
