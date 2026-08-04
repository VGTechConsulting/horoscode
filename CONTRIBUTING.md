# Contributing

Thanks for looking. This is a small, deliberately constrained project, and most of
the constraints are written down rather than implied — which should make it easy to
tell whether a change belongs before you spend time on it.

## The specs are normative

[`docs/specs/main.spec.md`](docs/specs/main.spec.md) specifies the product;
[`docs/specs/github-pages-deployment.spec.md`](docs/specs/github-pages-deployment.spec.md)
amends it for static deployment and wins where the two disagree. If a change
contradicts them, the spec has to change in the same pull request, with the reason.
That is a normal thing to propose — it is not a higher bar, just a visible one.

[`main.spec.md` §15](docs/specs/main.spec.md) lists what is deliberately out of
scope. It is worth two minutes before opening an issue: transits, a signs chart, a
sixth axis, randomness, personal input, i18n, and any CTA or lead-capture surface
are all settled questions with reasons attached.

## Running it

```sh
pnpm install
pnpm dev                # http://localhost:3000
pnpm verify             # typecheck, lint, and the assertion harness
```

Before opening a pull request, `pnpm verify` must pass. If your change touches the
build output, run the artifact harness too:

```sh
pnpm build
touch out/.nojekyll
pnpm verify:export
pnpm preview            # serves out/ on http://localhost:3000
```


## There is no test runner, so assertions go in the harness

[`scripts/verify.mjs`](scripts/verify.mjs) *is* the test suite. It imports
`lib/horoscode.ts` directly — Node ≥ 22.18 strips the types on load — and asserts the
properties the spec claims in prose, over all two hundred and sixteen states rather
than over examples.

If you add behaviour, add the assertion that would fail without it. If you add a
claim to the spec or to a user-facing surface, add the assertion that keeps it true.
Several existing checks are deliberately crude greps, and they have caught real
regressions.

A few invariants the harness enforces, so they do not surprise you:

- **No randomness.** No `Math.random`, `Date.now`, or `new Date` in shipped sources.
- **No client-side storage.** No cookies, `localStorage`, `sessionStorage`, or IndexedDB.
- **No digits in user-facing strings.** Numbers are spelled out — "eighteen", "five".
  The metrics are computed and never rendered.
- **Every interactive element declares a minimum target** of at least 44 × 44 CSS px.
- **The build stays rooted at `/`** — no `basePath`, no `assetPrefix`.

## Content changes

The eighteen sign records live in [`content/signs.ts`](content/signs.ts) and are
reviewed like model changes, because they are the product. Keep the record schema
exactly as [`main.spec.md` §8.2](docs/specs/main.spec.md) lists it, keep string ids
aligned with their `#sign-<id>` anchors, and add no outbound link to a record — a
link at the end of a card reads as a pitch attached to the visitor's result (§2).

## Style

Match the surrounding code. Comments here explain *why* a thing is the way it is,
often citing a spec section, and that density is intentional — it is what lets the
next reader tell a deliberate constraint from an accident. Prefer adding a reason
over adding a comment that restates the code.

## Forking and deploying your own

See the [Forking](README.md#forking) section of the README. The short version: set
`NEXT_PUBLIC_SITE_URL` and expect one harness assertion to need changing if you
deploy under a path rather than at a domain root.

## Reporting a vulnerability

See [SECURITY.md](SECURITY.md). Please do not open a public issue for one.
