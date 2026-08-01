# Horoscode

Pick five traits, one at a time, and a fixed lookup table tells you which of eighteen
engineering signs you are, and what the forecast is. No forms, no numbers on screen, no
backend, no randomness, no account.

Built from [`docs/specs/main.spec.md`](docs/specs/main.spec.md), which is the normative
document for everything below.

## Running it

```sh
pnpm install
pnpm dev            # http://localhost:3000
pnpm build && pnpm start
pnpm verify         # typecheck, lint, and the assertion harness
```

`NEXT_PUBLIC_SITE_URL` is the only environment variable and the only place a domain is
written down (see `lib/site.ts`). It defaults to `https://horoscode.dev`.

## Layout

```
app/
  layout.tsx            fonts, top bar, bottom rule, Analytics
  page.tsx              metadata, schemas, hero, sign catalogue
  globals.css           tokens, motion, target hygiene
  opengraph-image.tsx   static share card
  api/og/route.tsx      share card drawn from the five params
  privacy/page.tsx
components/
  horoscode.tsx         the client island: stage, rail, reading
  cross-accent.tsx
lib/
  horoscode.ts          pure model — no React, no icons, no DOM, no storage
  horoscode-icons.ts    lucide maps, kept out of the pure module
  sign-glyphs.ts        vendored glyph paths, for the share card only
  analytics.ts          one thin track() wrapper
  site.ts               the one constant that knows about a domain
content/
  signs.ts              the eighteen records
scripts/
  verify.mjs            the assertion harness
```

`lib/horoscode.ts` depends on nothing but `content/signs.ts`, so `scripts/verify.mjs`
imports it directly — Node ≥ 22.18 strips the types on load, which is why there is no test
runner here.

## Verification

`pnpm verify` runs `next typegen && tsc --noEmit`, `eslint .`, and the harness, which
asserts the properties the spec claims in prose: the arithmetic is exact over all two
hundred and sixteen states, the four verdict bands partition the margin range, the eighteen
signs are each reachable and reachable only where their record says, Reference moves
independence by its declared bonus and nothing else, Judgement splits exactly one house,
every Believer state is under-verified, exactly two forecast cells are dead, no user-facing
string carries a digit, the URL round-trips and emits exactly five params, the reading, the
share card, and the copied text carry the same sign name, and the sources contain no
randomness, no second result taxonomy, no client-side storage, and no button without a
minimum target.

`CI=1 pnpm verify` adds a HEAD check on every outbound link in the eighteen records.

The manual pass — one-handed completion on a phone, reduced motion, dark mode, keyboard,
screen readers, both copy paths, Lighthouse — is listed at the end of §13 of the spec and
has not been run here.

## Content provenance

Seventeen of the eighteen sign records port verbatim from `lib/horoscode.ts` in the `vgtc`
repository. The Believer is authored in §8.3 of the spec. Upstream's `ORIGINS` and `GOALS`
are not ported — there is no second result taxonomy here and there are no transits (§15).
The only permitted edits on ported copy are the three mechanical ones in §14: absolute link
hrefs, the deleted `relatedGoals` field, and the vocabulary rename.
