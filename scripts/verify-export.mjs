#!/usr/bin/env node
// The artifact harness (github-pages-deployment.spec.md §8.2).
//
// `scripts/verify.mjs` asserts things about the sources. This one asserts things
// about what `next build` actually wrote to `out/`, because a static export can
// fail in ways the sources look fine in: a route that quietly needs a handler, a
// stale origin baked into generated metadata, an analytics beacon still in the
// HTML. Run after `pnpm build`.
//
// Nothing here matches a hashed Next.js asset name — those change every build,
// and an assertion that breaks on a rebuild is not an assertion.
//
// Usage:
//   node scripts/verify-export.mjs

import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const ROOT = new URL('../', import.meta.url)
const OUT = new URL('out/', ROOT)

// The origin the artifact is expected to name, read from the same variable the
// build reads so a fork deploying to its own domain can run this harness against
// its own output. The fallback matches lib/site.ts, which is what CI passes.
const ORIGIN = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://horoscode.vgtc.io').replace(/\/$/, '')

let failures = 0
let checks = 0

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

function check(name, fn) {
  checks += 1
  try {
    fn()
    console.log(`  ok   ${name}`)
  } catch (error) {
    failures += 1
    console.error(`  FAIL ${name}\n       ${error.message}`)
  }
}

/** Every file under `out/`, as paths relative to it. */
function walk(dir = OUT, prefix = '') {
  const files = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const name = prefix + entry.name
    if (entry.isDirectory()) files.push(...walk(new URL(`${entry.name}/`, dir), `${name}/`))
    else files.push(name)
  }
  return files
}

const has = (path) => existsSync(fileURLToPath(new URL(path, OUT)))
const read = (path) => readFileSync(new URL(path, OUT), 'utf8')

if (!has('index.html')) {
  console.error('out/ is missing or was never built. Run `pnpm build` first.')
  process.exit(1)
}

const files = walk()
const html = files.filter((f) => f.endsWith('.html'))
const text = files.filter((f) => /\.(html|json|xml|txt|js|css|webmanifest)$/.test(f))

// ─── The routes the artifact must contain (§2.2, §8.2) ──────────────────────

check('Every exported route is present as a file Pages can serve', () => {
  for (const path of ['index.html', 'privacy/index.html', '404.html', 'sitemap.xml', 'robots.txt']) {
    assert(has(path), `out/${path} is missing`)
  }
  const manifest = files.find((f) => /manifest\.webmanifest$/.test(f))
  assert(manifest, 'no web manifest was exported')
  assert(has('icon.svg'), 'out/icon.svg is missing — every page would render a blank tab')
  const og = 'opengraph-image.png'
  assert(has(og), 'out/opengraph-image.png is missing')
  assert(!has('opengraph-image'), 'the extensionless Open Graph image was not finalized')
  const png = readFileSync(new URL(og, OUT))
  assert(png.length > 0, `out/${og} is empty`)
  assert(png.subarray(1, 4).toString('latin1') === 'PNG', `out/${og} is not a PNG`)
  // The card must stay generic: it is one file for every reading, so nothing
  // sign-specific can have been baked into it (§4.1).
  assert(files.filter((f) => f.startsWith('opengraph-image')).length === 1, 'more than one share card was exported')
})

check('The artifact needs no server to serve it', () => {
  // A static export writes no server bundle and no manifest a runtime would
  // read. If one of these exists, something opted a route back into a
  // request-time handler.
  for (const path of ['.next', 'server', 'server.js', 'index.js', 'routes-manifest.json']) {
    assert(!has(path), `out/${path} exists — the artifact expects a runtime`)
  }
  // Every route reachable by a browser resolves to a file on disk: an HTML
  // document, an asset, or one of the metadata files.
  const orphan = html.filter((f) => !/(^|\/)(index|404)\.html$/.test(f))
  assert(orphan.length === 0, `unroutable HTML in the artifact: ${orphan.join(', ')}`)
})

check('Every page links the icon, and the manifest declares it', () => {
  // The link tag is injected per document, so a route that stopped inheriting
  // the root layout would lose it silently. Next appends a cache-busting query
  // to the href, which a static host ignores — match the path, not the whole
  // attribute.
  for (const file of html) {
    assert(
      /<link[^>]+rel="icon"[^>]+href="\/icon\.svg/.test(read(file)),
      `out/${file} renders no icon link`,
    )
  }
  const manifest = JSON.parse(read('manifest.webmanifest'))
  assert(Array.isArray(manifest.icons) && manifest.icons.length > 0, 'the manifest declares no icons')
  assert(
    manifest.icons.some((i) => i.src === '/icon.svg' && i.sizes === 'any'),
    'the manifest does not declare the scalable icon',
  )
  for (const icon of manifest.icons) {
    assert(has(icon.src.replace(/^\//, '')), `the manifest names ${icon.src}, which was not exported`)
  }
})

check('No `/api/og` path survived the deletion of the dynamic card (§4.1)', () => {
  const leaked = files.filter((f) => f.startsWith('api/'))
  assert(leaked.length === 0, `the artifact exports [${leaked.join(', ')}]`)
  for (const file of text) {
    assert(!read(file).includes('/api/og'), `out/${file} still points at /api/og`)
  }
})

// ─── Origin and vendor hygiene (§8.2) ───────────────────────────────────────

check('No output file carries the retired origin', () => {
  const bad = text.filter((file) => read(file).includes('horoscode.dev'))
  assert(bad.length === 0, `horoscode.dev appears in [${bad.join(', ')}]`)
})

check('No HTML or manifest file carries an analytics beacon', () => {
  const bad = text.filter((file) => {
    const source = read(file)
    return source.includes('/_vercel/insights') || source.includes('@vercel/analytics')
  })
  assert(bad.length === 0, `a Vercel Analytics reference survives in [${bad.join(', ')}]`)
})

check('Generated metadata names the canonical origin', () => {
  const index = read('index.html')
  assert(index.includes(`${ORIGIN}/`), 'out/index.html does not name the canonical origin')
  assert(
    index.includes(`<link rel="canonical" href="${ORIGIN}/"`),
    'out/index.html carries no canonical link to the custom domain',
  )
  assert(
    index.includes(`${ORIGIN}/opengraph-image.png`),
    'out/index.html does not point at the extensioned Open Graph image',
  )
  for (const file of text) {
    assert(
      !/\/opengraph-image(?!\.png)/.test(read(file)),
      `out/${file} still uses the extensionless Open Graph image URL`,
    )
  }
  const sitemap = read('sitemap.xml')
  for (const url of [`${ORIGIN}/`, `${ORIGIN}/privacy/`]) {
    assert(sitemap.includes(`<loc>${url}</loc>`), `sitemap.xml is missing ${url}`)
  }
  assert(
    read('robots.txt').includes(`${ORIGIN}/sitemap.xml`),
    'robots.txt does not point at the canonical sitemap',
  )
  // The one that catches a basePath being reintroduced: assets are root-relative
  // on the custom domain, never under /horoscode.
  for (const file of html) {
    assert(!read(file).includes('/horoscode/_next/'), `out/${file} resolves assets under /horoscode`)
  }
})

// ─── Upload preconditions (§6.2) ────────────────────────────────────────────

check('`.nojekyll` is in place, so `_next` is served as a normal directory', () => {
  assert(has('.nojekyll'), 'out/.nojekyll is missing — Pages would skip the _next directory')
})

console.log(`\n${checks - failures} of ${checks} artifact checks passed.`)
if (failures > 0) process.exit(1)
