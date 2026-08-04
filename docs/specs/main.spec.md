# Horoscode — standalone Next.js app — Spec

Pick five traits, one at a time, and a fixed lookup table tells you which of eighteen engineering signs you are, and what the forecast is. Eighteen signs, no forms, no numbers on screen, no backend, no randomness, no account, and nothing on the page trying to sell you anything.

**This document specifies the product.** The model in §6–§8 is reproduced here in full — every weight, band, matrix cell, and forecast line — and the canonical long-form content is committed alongside the implementation as described in §14.

**It is amended, and no longer self-contained.** `github-pages-deployment.spec.md` converted the application to a static export on GitHub Pages, and supersedes the sections below. Where the two disagree, the deployment spec wins.

| Superseded here | By |
| --- | --- |
| §2, the suggested host | §1 — the canonical origin is `https://horoscode.vgtc.io`, and `horoscode.dev` is retired |
| §5, the `/api/og` route and the stack | §2.1, §4.1, §5.1, §10 |
| §11.2, the dynamic share card | §4.1 — one generic card for every reading, drawn at build time |
| §12.1, the analytics vendor | §5.1 — the `track()` boundary survives as a typed no-op |
| §12.2, the privacy copy | §5.2 — nothing is collected, so the sentence that said otherwise is gone |
| §13, the dynamic-share-card assertions | §8.1, and §8.2 adds a second harness over the built artifact |

Nothing in §6–§8 is touched by that amendment: the model, the weights, the bands, the houses, and the eighteen signs are as specified here.

Three requirements shape every decision below and are worth stating before the detail:

1. **The app is a selection instrument.** Everything on screen exists to make one of two-to-four choices, five times, then read a result. Layout, typography, motion, and focus all serve tap-accuracy and tap-speed first (§4).
2. **It is comfortable on a phone, a tablet, and a desktop** — not a desktop layout that survives a phone. The mobile case is designed first and the larger breakpoints spend the extra room on legibility rather than on density (§4.3).
3. **Attribution is the whole of its connection to VG Tech** — the wordmark, the copyright, the palette, and the attribution line. It is not the firm's website, it carries no navigation into it, and it asks the visitor for nothing (§2).

---

## 1. Purpose

- **For the visitor:** five taps, one reading, a forecast, and a reason to take it again with different answers.
- **The argument it carries:** *automation is cheap, independent verification is the scarce thing.* Every weight, band, and forecast line in §6–§8 is downstream of that sentence, which is why the model is specified here rather than tuned later.
- **Indexable without JavaScript:** the sign catalogue is server-rendered (§9.5), so the eighteen signs and their copy are readable by a crawler. A tool whose content sits entirely behind client state gives one nothing.

**Why a horoscope frame carries the argument rather than diluting it.** A horoscope takes a handful of facts you did not choose, maps them through a fixed table, and hands you a statement about what is coming. This app does exactly that — five inputs, a deterministic table, a consequence — with one difference the frame makes funny instead of pious: **here the mapping is real and you can read it.** The five stars are not your birthday, they are how you write code, who checks it, who decides, what standard can contradict the implementation, and what breaks when it fails; those genuinely determine the forecast, and the arithmetic is in one file with a name. The joke and the thesis are the same sentence.

**Non-goals**, which the frame does not soften: scoring people, ranking signs, implying a maturity ladder. There is no best sign. There *is* a mismatch between a position and its stakes, and that mismatch is what the app measures.

**Engagement goal: completion, then a second run.** The star rail stays live on the reading, so changing one star is one tap and re-reads immediately (§9.4).

### 1.1 Five rules the frame does not get to break

1. **No randomness, ever.** Same five stars, same reading, forever. A single `Math.random()` would make every §13 assertion meaningless and turn a deterministic argument into a toy. §13 greps for one.
2. **No dates, birthdays, names, or star signs as input.** The five stars are the five axes. Nothing about the visitor's identity is asked, so nothing about it can be stored, and the honesty line stays true.
3. **The eighteen names are not zodiac names.** Craftsman, Centaur, Dark Factory, Spec Runner, Believer — the names are the model's own vocabulary, and the sign catalogue is written in it.
4. **The copy never predicts anything outside the loop it models.** No luck, no money, no relationships, no week ahead. Every forecast line in §7 is a statement about what this posture does to this codebase at these stakes.
5. **One honesty line, on screen, above the fold**, mono, in the hero:

   > No stars were consulted. Five picks, one lookup table, and arithmetic you can read in the source.

---

## 2. Attribution

The application is published by VG Tech and carries its mark. It carries nothing else from the firm's website. Concretely:

**What is carried over**

| Element | Treatment |
| --- | --- |
| Attribution | `A playground from VG Tech — vgtc.io`, mono, muted, linking to `https://vgtc.io` with `rel="noopener"`. Bottom rule only — the top bar carries the product name, not the firm's. |
| Copyright | `© VG Tech` in the bottom rule, mono, `text-[10px]`, muted. Year-free, so it never goes stale. |
| Palette | The same black-and-white system, token for token (§3.1). |
| Type | Inter for text, JetBrains Mono for labels — the site's pairing, self-hosted via `next/font` (§3.2). |
| Grid language | 1px dashed borders, zero corner radius, the cross accent (§3.3). |
| Attribution line | One mono line in the bottom rule: *A playground from VG Tech — [vgtc.io](https://vgtc.io)*. |

**What is deliberately not carried over**

- No navbar, no site footer, no service list, no team, no email addresses.
- No booking CTA, no Cal.com embed, no chat widget, no newsletter, no exit intent.
- No links into the firm anywhere but the bottom rule, both to the homepage. Sign records carry no outbound link of their own: an editorial or service link at the end of a card reads as a pitch attached to the visitor's result, which is the impression the whole frame exists to avoid.
- No case studies, no logos, no testimonial strip.

That list is a hard boundary, not a starting position: adding to it is out of scope (§15), and §13 greps the sources for a booking trigger, a third-party widget, and a site `Navbar` or `Footer` import.

**Naming and domain.** Product name `Horoscode`. The spec is host-agnostic and reads the origin from `NEXT_PUBLIC_SITE_URL` (§11.1); nothing in the code hard-codes a domain except that constant.

> Settled by `github-pages-deployment.spec.md` §1: the canonical origin is `https://horoscode.vgtc.io`. The other candidate this section used to offer, `horoscode.dev`, is retired, and §8.1 greps the sources for it.

---

## 3. Design system

### 3.1 Palette

Pure black, pure white, mid-greys. No gradient, and no hue in the interface: verdict tone is typographic, because a colour-coded verdict reads as a score and there is no score. The one hue in the repository is the VGTC accent `#e23122`, which belongs to the parent brand and is carried by the application icon (deployment spec §3.4) — it is not an interface token and nothing in the reading may reach for it. The whole system is these tokens, in `app/globals.css`, Tailwind v4 (`@theme inline`):

```css
:root {
  --background: oklch(1 0 0);            /* #ffffff */
  --foreground: oklch(0 0 0);            /* #000000 */
  --muted: oklch(0.94 0 0);
  --muted-foreground: oklch(0.45 0 0);   /* body copy, labels */
  --border: oklch(0.82 0 0);             /* solid rules */
  --border-dashed: oklch(0.7 0 0);       /* the dashed grid */
  --ring: oklch(0 0 0);                  /* focus */
  --cross: oklch(0.6 0 0);               /* cross accent */
  --radius: 0rem;                        /* sharp corners, everywhere */
}
```

**Verdict tone is typographic, not chromatic.** The four verdicts (`under-verified`, `thin`, `balanced`, `over-controlled`) are distinguished by weight, border style, and position — never by red/amber/green. A colour-coded verdict would read as a score, and §1 says there is no score. The chip is a dashed-bordered mono label in all four cases; the only variation permitted is `border-foreground` + `text-foreground` for `under-verified` against `border-border` + `text-muted-foreground` for the rest, which reads as emphasis rather than alarm.

**Dark mode is in scope** and is the one deliberate divergence from the site, which is light-only. It is a straight inversion — the same palette seen from the other side — and it exists because a page people open on a phone at night should not flash white:

```css
@media (prefers-color-scheme: dark) {
  :root {
    --background: oklch(0 0 0);
    --foreground: oklch(1 0 0);
    --muted: oklch(0.18 0 0);
    --muted-foreground: oklch(0.68 0 0);
    --border: oklch(0.3 0 0);
    --border-dashed: oklch(0.38 0 0);
    --ring: oklch(1 0 0);
    --cross: oklch(0.55 0 0);
  }
}
```

No toggle, no stored preference, no flash-of-wrong-theme script — the system query is the whole mechanism, and with `color-scheme: light dark` on `:root` the browser handles form controls and scrollbars. Contrast: `--muted-foreground` against `--background` is ≥ 4.5:1 in both modes, and every dashed border against its background is ≥ 3:1, which is the non-text contrast floor the option cards depend on.

### 3.2 Type

| Role | Family | Size | Treatment |
| --- | --- | --- | --- |
| H1 | Inter | `text-3xl` / `md:text-5xl` | `font-light`, `tracking-tight`, one semibold clause |
| Sign name (reading) | Inter | `text-3xl` / `md:text-5xl` | `The` light, the noun semibold |
| Question (stage) | Inter | `text-xl` / `md:text-3xl` | `font-light`, `text-balance` |
| Option name | Inter | `text-base` (mobile) / `text-sm` (≥sm) | `font-semibold` |
| Option line | Inter | `text-sm` / `text-xs` (≥sm) | `font-light`, `leading-snug` |
| Body prose | Inter | `text-sm` / `md:text-base` | `font-light`, `leading-relaxed`, `max-w-3xl` |
| Labels, counters, chips, footer | JetBrains Mono | `text-[9px]`–`text-[10px]` | uppercase, `tracking-widest` |

Two families, two weights of Inter (300, 600) plus 400 for the option name at mobile size, one weight of mono. Loaded with `next/font/google` and `display: 'swap'`, self-hosted at build time, so the page makes no external font request at runtime.

**Mobile takes the larger option size, not the smaller one.** Option names are `text-base` below `sm` and step *down* to `text-sm` at `sm` and above, where the card format gives the eye more context. This is deliberate and it is the one place the responsive scale runs backwards: on a phone the option name is the tap target's label and it has to be readable at arm's length, in sunlight, in a hurry.

### 3.3 Grid, borders, motion

- **Every container is a dashed rectangle.** 1px, `--border-dashed`, no radius, no shadow, no fill. Adjacent cells share a border rather than sitting in a gap, so an option grid has no dead pixels between targets (§4.2).
- **Cross accent** — a 1px plus sign drawn with pseudo-elements, `--cross`, used to mark the current option, the eyebrow, and list bullets. Sizes 8–10px.
- **Motion is small, fast, and fully removable.** Phase change: 180ms cross-fade. Reveal: three staggered 180ms rises at 0 / 90 / 180ms. Pips: 60ms each, staggered. Everything sits inside `@media (prefers-reduced-motion: no-preference)`; under reduced motion each becomes an instant state change and nothing in the flow waits on an animation. No confetti, no sound, no score-up flourish.

---

## 4. Selection-first interaction

This is the section the app is built around. Everything here is a hard requirement, not a preference.

### 4.1 The rule of one decision

One question is on screen at a time, with its two-to-four options, and nothing else competing for the tap. The stage is `min-h-[calc(100svh-3rem)]` — `svh`, not `vh`, because on mobile Safari `100vh` is the URL-bar-hidden height and would push the last option under the browser chrome. Within the stage, from top to bottom: the star rail, the question, the options, the stage footer. Nothing scrolls during a pick at any supported viewport (§4.4).

### 4.2 Target geometry

| Rule | Value | Why |
| --- | --- | --- |
| Absolute minimum target | **44 × 44 CSS px** | WCAG 2.2 §2.5.5 (AAA). No interactive element in the app is smaller, including the footer links and the copy buttons. |
| Option card, below `sm` | full width × **min 72px** | A full-bleed row is the largest possible target for the primary action. |
| Option card, `sm` and up | column cell × **min 190px** | The card format; the whole cell is the button. |
| Rail slot | ≥ 1/5 viewport width × **min 64px** | Five across at 375px is 75px each. |
| Stage-footer controls | **min 44px** tall, `px-4` | Back, Read again, Copy. |
| Reading actions and footer links | **min 44px** tall | The smallest targets in the app, and still at the floor. |

**The button is the cell.** Every option is a `<button>` that fills its grid cell — `w-full h-full`, padding on the button not the cell — so there is no border strip that looks tappable and is not. No nested interactive elements inside an option card, ever: a link inside a tappable card is the single most common mis-tap on mobile.

**Touch hygiene**, applied to every option and rail control:

```css
.horoscode-target {
  touch-action: manipulation;              /* no 300ms double-tap-zoom delay */
  -webkit-tap-highlight-color: transparent;/* replaced by a real :active state */
  user-select: none;                       /* long-press must not select text */
}
```

`:active` gives an immediate `bg-foreground/[0.06]` — the tap feedback the removed highlight would have provided, and the only feedback that survives a slow network. Hover styling is gated behind `@media (hover: hover)` so a touch device never gets a sticky hover state after a tap, and **no information is hover-only** — helper text, option lines, and trait names are all rendered, never revealed.

### 4.3 Breakpoints

Three layouts, one component. Tailwind's `sm` (640px) and `lg` (1024px) are the only breakpoints used; `md` (768px) adjusts padding and type only, never structure.

| | Phone (< 640) | Tablet (640–1023) | Desktop (≥ 1024) |
| --- | --- | --- | --- |
| Options | 1 column, full-bleed rows, icon left, text right | Cards: 2–3 columns | Cards: 3–4 columns, one row |
| Authorship / Verification / Stakes (3 options) | 3 rows | `sm:grid-cols-3` | `sm:grid-cols-3` |
| Judgement (4 options) | 4 rows | `sm:grid-cols-2` (2 × 2) | `lg:grid-cols-4` |
| Reference (2 options) | 2 rows | `sm:grid-cols-2` | `sm:grid-cols-2` |
| Star rail | **pinned to the bottom of the stage**, above the footer | top of stage | top of stage |
| Icon size | 20px, inline left | 28px, above the name | 28px |
| Stage padding | `px-5 py-4` | `md:px-10 md:py-10` | `md:px-10 md:py-10` |
| Reading meters | stacked | side by side | side by side, verdict block right-aligned |
| Sign catalogue cards (eighteen signs) | 1 column | `md:grid-cols-2` | `md:grid-cols-2` |

**The rail moves on phones and that is the one structural difference between the layouts.** On a phone the rail is the re-pick affordance and it belongs in the thumb arc at the bottom of the screen; on a tablet or a desktop it is a progress indicator and belongs at the top where progress indicators are read. It is `sticky bottom-0` within the stage below `sm`, with `padding-bottom: env(safe-area-inset-bottom)` so the home indicator never eats a slot, and it carries a top border rather than a bottom one in that position.

### 4.4 Viewport budgets

The worst case is Judgement — four options — on the smallest supported phone. It must fit without scrolling:

| Viewport | Rail | Question + helper | Options | Footer | Total | Budget |
| --- | --- | --- | --- | --- | --- | --- |
| 375 × 667 (iPhone SE) | 64 | 112 | 4 × 76 = 304 | 48 | **528** | 619 (667 − 48 top bar) |
| 390 × 844 | 64 | 120 | 4 × 84 = 336 | 48 | **568** | 796 |
| 768 × 1024 | 68 | 140 | 2 × 190 = 380 | 52 | **640** | 976 |
| 1280 × 800 | 68 | 160 | 190 | 52 | **470** | 752 |

Slack at every size, which is the point: the numbers above are minimums, and the extra room goes to the options rather than to whitespace above them. **If a copy change ever breaks the 375 budget, the copy changes, not the target size.**

### 4.5 Focus, keyboard, and the second run

- **Focus follows the phase.** On entering a pick, focus moves to that group's first option — or to the currently chosen one when a filled slot is revisited. On reaching the reading, focus moves to the sign heading (`tabIndex={-1}`). Never on the initial render, which would steal focus from the page.
- **The stage scrolls itself to the top of the viewport** on every phase change, because a viewport-height stage only means something when it is at the viewport. `behavior: 'smooth'`, skipped when already within 1px, and skipped entirely under reduced motion.
- **Options are buttons, not radios, with no exceptions** — there is no other input of any kind in the app. One tap commits and advances; there is no second "next" tap to lose people at. Arrow keys move focus within the group (roving `tabindex` is not needed — five short groups, native tab order is fine), `Enter`/`Space` commit, `Escape` on a revisited slot returns to the reading.
- Each group is a `role="group"` labelled by the question, and the stage announces phase changes through a single `aria-live="polite"` region.
- **Changing one star from the reading returns straight to the reading.** Tap a filled rail slot, pick a different trait, and you are back on the result — one tap, one tap, done. This is the engagement mechanic and it is why the rail stays live below the reading.

### 4.6 What is not allowed

- No sliders, no drag, no swipe-to-advance, no long-press, no double-tap, no gesture that competes with the browser's own.
- No carousel, no accordion hiding an option, no "show more".
- No modal or dialog anywhere in the flow.
- No autofocus on load, no scroll-jacking outside the single stage alignment in §4.5.
- No disabled states on options. If an option is on screen it is choosable.

---

## 5. Routes and structure

Static throughout. No backend, no database, no API route that stores anything.

> Amended by `github-pages-deployment.spec.md` §2.1: the build is `output: 'export'`, so nothing request-time survives anywhere. The `/api/og` route this table used to carry was the one exception, and §4.1 deleted it.

| Route | File | Rendering |
| --- | --- | --- |
| `/` | `app/page.tsx` (server) + `components/horoscode.tsx` (`"use client"`) | The whole tool: hero, stage, reading, reference |
| `/privacy` | `app/privacy/page.tsx` | One screen, honest, no cookies (§12.2) |
| `/sitemap.xml`, `/robots.txt`, `/manifest.webmanifest` | `app/sitemap.ts`, `app/robots.ts`, `app/manifest.ts` | Static |
| `/icon.svg`, `/opengraph-image.png` | `app/icon.svg`, `app/opengraph-image.tsx` | Static (deployment spec §3.4, §4.1) |

```
app/
  layout.tsx            fonts, <html lang="en">, color-scheme, top bar, bottom rule
  page.tsx              server: static metadata, schemas, hero, sign catalogue
  globals.css           tokens, dashed grid, cross accent, motion, target hygiene
  icon.svg              the astrolabe mark as a favicon (deployment spec §3.4)
  opengraph-image.tsx   the one generic share card, drawn at build time
  manifest.ts, robots.ts, sitemap.ts
  privacy/page.tsx
components/
  horoscode.tsx         the client island: stage, rail, reading
  cross-accent.tsx
lib/
  horoscode.ts          pure model — no React, no icons, no DOM
  horoscode-icons.ts    lucide maps, kept out of the pure module
  analytics.ts          the typed `track()` boundary, a no-op (§12.1)
  site.ts               the one constant that knows about a domain (§11.1)
content/
  signs.ts              the eighteen records (§14)
scripts/
  finalize-export.mjs   gives the generated share card a static-host-safe URL
  verify.mjs            the assertion harness, over the sources (§13)
  verify-export.mjs     the assertion harness, over out/
```

**`lib/horoscode.ts` imports only `content/signs.ts`, which is data.** It is loadable from a plain Node script, which is what makes the §13 harness possible without a test runner. Icons live in a separate module for exactly that reason.

**Stack:** Next 16 (App Router), React 19, TypeScript, Tailwind v4, `lucide-react`. No state library, no form library, no animation library, no UI kit, and — since `github-pages-deployment.spec.md` §5.1 — no analytics vendor.

---

## 6. The model

Five axes ("stars"), fixed order, not configurable. Every value the UI shows is derived from these five with no randomness and no hidden state.

### 6.1 The five stars

| Slot | Axis | Question | Options (value → name) |
| --- | --- | --- | --- |
| `code` | Authorship | How does the code get written? | `hand` → Forged · `blended` → Assisted · `delegated` → Summoned |
| `review` | Verification | Who is the last set of eyes before it ships? | `hand` → Every line · `blended` → Second pair · `delegated` → Machine-gated |
| `judgement` | Judgement | Who decides it is correct? | `me` → Own taste · `team` → Peer council · `process` → Codified law · `llm` → The oracle |
| `reference` | Reference | Is there an acceptance standard the code-and-review loop cannot change? | `independent` → Independent reference · `loop` → Loop-owned reference |
| `environment` | Stakes | What happens when it breaks? | `hobby` → Sandbox · `team` → Live service · `regulated` → Under audit |

Each option carries a first-person line beneath its name (e.g. *I type it. The structure and the details are mine.*). Reference uses these exact lines: Independent reference — *A contract, test, policy, rubric, or dataset is controlled outside the code-and-review loop.*; Loop-owned reference — *The same loop can reinterpret or edit what counts as done.* Three slots carry a helper line above the options, because three get misread: Judgement (*How far the decision has been delegated away from you. Monotone in delegation, not in quality.*), Reference (*The standard may evolve. What matters is who can change it, not whether the project is Waterfall or Agile or whether the standard was written first.*), and Stakes (*Answer for the project, not the employer. The same person picks differently for a weekend build and for the day job.*).

Short rail labels below `sm`, where ~62px per slot is all there is: `Code`, `Review`, `Judge`, `Ref`, `Stakes`.

### 6.2 Arithmetic

Exact, in scaled integers, rounded exactly once. Nothing downstream re-rounds, so the verdict is always evaluated against the value that selected it.

```ts
CODE_VALUE   = { hand: 15, blended: 50, delegated: 85 }
REVIEW_VALUE = { hand: 15, blended: 50, delegated: 85 }
JUDGEMENT_BONUS = { me: -10, team: 10, process: 15, llm: -15 }
REFERENCE_BONUS = { independent: 10, loop: 0 }
REQUIRED_INDEPENDENCE = { hobby: 20, team: 55, regulated: 85 }

automation  = (code + review) / 2
correlation = round(code × review / 100)
raw         = 1000 − 6·review − 4·correlation + 10·judgementBonus + 10·referenceBonus
independence = clamp(round(raw / 10), 0, 100)
margin      = independence − REQUIRED_INDEPENDENCE[environment]
```

`correlation` is the term that says a machine reviewing machine-written code is not an independent check: it rises with the product of the two, so it costs most exactly where authorship and verification are both delegated.

Reference and Judgement are deliberately orthogonal. **Reference asks who controls the acceptance standard; Judgement asks who or what applies it and declares the result correct.** A codified gate earns the Judgement bonus because enforcement is consistent. It earns the Reference bonus only when the code-and-review loop cannot edit or reinterpret the standard it applies. A test suite generated and freely rewritten by that same loop is therefore `process` + `loop`, not the same control counted twice.

### 6.3 Verdict bands

Half-open and exhaustive — every integer margin falls in exactly one band.

| Band | Condition | Label |
| --- | --- | --- |
| `under-verified` | `margin < −25` | Under-verified for the stakes |
| `thin` | `−25 ≤ margin < −5` | Thin margin |
| `balanced` | `−5 ≤ margin ≤ 30` | Balanced |
| `over-controlled` | `margin > 30` | Over-controlled for the stakes |

Each carries a blurb; `over-controlled`'s names its cost explicitly (*Not a compliment — you are paying an enterprise tax on something allowed to break.*).

### 6.4 Meters, and the no-digits rule

**No number computed above ever appears on screen.** Not the independence value, not the margin, not the required floor. The visitor has no scale to interpret them against, and a number without a scale is worse than no number. The metrics decide the verdict, the meters, and the analytics payload, and they are never rendered.

Two five-pip meters instead — `Automation` and `Verification`, `pips(v) = v <= 0 ? 0 : min(5, ceil(v / 20))`, ordinal not scalar. **Five pips of automation against one pip of verification is the picture the whole app exists to draw.** One caption sits under the pair, derived from the *shape* of the two meters rather than either value:

| Gap (automation − verification, in pips) | Caption |
| --- | --- |
| ≥ 3 | Machines write it, machines check it. Nobody independent is left in the loop. |
| 1–2 | Output is running ahead of the checking, and the gap is where surprises live. |
| 0 | Making and checking move together. Whatever else is true, the picture is proportionate. |
| < 0 | More checking than making. Everything that ships has been looked at by something that did not write it. |

Below the fold, `verdictAdvice(metrics, sign)` gives one line naming the direction and the cheapest axis to move — never a point value.

---

## 7. The forecast

The verdict written out as a prediction: twelve authored lines, one per verdict × stakes, because the same verdict means different things at different stakes — a thin margin on a weekend project and a thin margin under audit are the same number and not the same news.

```ts
FORECASTS: Record<VerdictId, Record<Environment, string>>
forecastFor(metrics, environment): string   // one lookup, no branching
```

**Rules**, the mechanical ones asserted in §13: digit-free; no overlap with `verdictAdvice`, which says the cheapest axis to move rather than what happens if nothing does; `over-controlled` still names its cost; a balanced reading gets a calm line, because the frame does not manufacture drama the arithmetic did not find.

**under-verified**
- *Sandbox (unreachable):* Nothing is downstream of this, so the forecast is quiet — whatever breaks, breaks in front of you and nobody else.
- *Live service:* Expect a quiet quarter and then a loud week. What ships unread does not announce itself while it is shipping; it announces itself in somebody else's incident channel, and by then the change that caused it is old enough to be hard to find.
- *Under audit:* Somewhere in what ships next is a line no human read, and the auditor will read it before you do. That is the forecast; the date is the only variable, and it is not the variable you control.

**thin**
- *Sandbox:* Nothing is coming for you, but there is no slack in this either. The first week you are busy is the week this posture quietly stops being followed.
- *Live service:* You are inside tolerance with nothing spare, which feels identical to being fine until something else takes the attention. Expect the near miss first — and expect it to be described afterwards as bad luck.
- *Under audit:* The margin is thinner than the paperwork implies. Expect a finding rather than an incident, and expect it to be about evidence you cannot produce rather than code you got wrong.

**balanced**
- *Sandbox:* Aligned, and nothing at stake — the cheapest possible time to be in this position. Expect to learn something here that you will need somewhere it counts.
- *Live service:* Nothing in this chart is out of place. What to watch is drift: automation rises quietly, and the day this posture starts feeling slow is the day the balance has already moved.
- *Under audit:* Independence clears the floor for these stakes. Expect the next problem to come from outside this map — a target that went stale rather than a diff that went unread.

**over-controlled**
- *Sandbox:* You are guarding a weekend project like a payments platform. Expect the friction to outlast the enthusiasm, and the project to end for reasons that have nothing to do with correctness.
- *Live service:* There is more verification here than the blast radius justifies, and the surplus is paid in human attention. Expect the strongest engineers to notice before the process does.
- *Under audit (unreachable):* Even here the controls exceed the exposure, which is a rare reading and still not a free one — the surplus is paid in attention that the stakes did not ask for.

**Two cells cannot be reached** — nothing at Sandbox stakes is under-verified, because nothing is downstream of it, and nothing under audit is over-controlled once the floor is that high. Both are authored anyway: the `Record` is exhaustive by type and a weight change would make them live. §13 asserts that **exactly those two** are dead, as set equality rather than as a count, so drift fails a script rather than showing a visitor a line nobody re-read.

**Where it renders:** on the reading, in the verdict block — the mono label `Forecast`, the verdict chip, then the line, then `meterCaption`. It is also the second line of `summariseAsText`, because the reading travels there too and a verdict label alone is the clinical half of it.

---

## 8. Signs and houses

### 8.1 The nine houses

Authorship × Verification, resolved before stakes are considered:

| | Verification: Every line | Second pair | Machine-gated |
| --- | --- | --- | --- |
| **Authorship: Forged** | Craftsman ⁺ | Practitioner | Lone Author ⁺ |
| **Assisted** | Pair Programmer | Centaur | Shipper |
| **Summoned** | Supervisor ⁺ | Orchestrator | Dark Factory ⁺ ˣ |

⁺ = splits at Sandbox stakes on Reference. ˣ = splits above Sandbox on Judgement (§8.3).

```ts
resolveSign(position, environment) =
  environment === 'hobby' && house.sandbox   ? house.sandbox[position.reference]
  : house.oracle && position.judgement === 'llm' ? house.oracle
  : house.base
```

Pure, total, exhaustive: 216 combinations, 18 signs, no fallback. Order matters and is asserted: the Sandbox branch is tested first, so nothing at Sandbox stakes ever reaches the Judgement branch.

**One discriminator per house, chosen by what the stakes leave undetermined.** At Sandbox the consequence is absent, so **Reference** resolves the class in four houses: an independent target makes the work directed, while a loop-owned target makes it exploratory. Above Sandbox the consequence defines the class and an independent reference is a risk modifier instead (that is the `+10`, and it never moves the name). In exactly one house — the lights-out corner — the consequence is not enough on its own, because two very different postures share it, and **Judgement** separates them (§8.3).

### 8.2 The eighteen

| Sign | Epithet | House (Authorship · Verification) | Reached at | Icon |
| --- | --- | --- | --- | --- |
| The Craftsman | nothing ships unread | Forged · Every line | Live service, Under audit | `Anvil` |
| The Learner | the long way round | Forged · Every line | Sandbox + Independent reference | `Sprout` |
| The Hobbyist | for its own sake | Forged · Every line | Sandbox + Loop-owned reference | `Puzzle` |
| The Practitioner | hand-made, machine-checked | Forged · Second pair | all stakes | `Wrench` |
| The Lone Author | a team of one | Forged · Machine-gated | Live service, Under audit | `Feather` |
| The Candidate | unaided, then graded | Forged · Machine-gated | Sandbox + Independent reference | `GraduationCap` |
| The Weekend Builder | shipped by Sunday, gated by the model | Forged · Machine-gated | Sandbox + Loop-owned reference | `Tent` |
| The Pair Programmer | two hands, one pen | Assisted · Every line | all stakes | `Handshake` |
| The Centaur | half and half, both ways | Assisted · Second pair | all stakes | `Blend` |
| The Shipper | merge and move | Assisted · Machine-gated | all stakes | `Rocket` |
| The Supervisor | the human gate | Summoned · Every line | Live service, Under audit | `Radar` |
| The Benchmarker | runs agents against a known answer | Summoned · Every line | Sandbox + Independent reference | `FlaskConical` |
| The Skeptic | read it all anyway | Summoned · Every line | Sandbox + Loop-owned reference | `Binoculars` |
| The Orchestrator | fleets, not diffs | Summoned · Second pair | all stakes | `Network` |
| The Dark Factory | lights-out delivery | Summoned · Machine-gated | Live service, Under audit — Judgement not The oracle | `Factory` |
| The Believer | takes the model at its word | Summoned · Machine-gated | Live service, Under audit — Judgement is The oracle | `Church` |
| The Spec Runner | wrote the spec, let it rip | Summoned · Machine-gated | Sandbox + Independent reference | `FileCog` |
| The Vibe Coder | ship it and see | Summoned · Machine-gated | Sandbox + Loop-owned reference | `Sparkles` |

Each record carries: `id`, `name`, `epithet`, `tagline`, `body`, `signature: [3]`, `strengths: [2]`, `failureModes: [2]`, `nextMoves: [3]`, `house`, `environments`. All eighteen canonical records live in `content/signs.ts`; the rule that distinguishes The Believer is specified below.

### 8.3 The Believer

**Why the lights-out corner needs two names.** Summoned authorship with Machine-gated verification means agents write it and a machine clears it — but that says nothing about what has final authority. A Dark Factory keeps at least that authority outside the model: a person, a team, or a codified gate can contradict it. The same corner with **The oracle** as Judgement has none — the thing that generated the code, the thing that reviewed it, and the thing that decides it is correct are the same kind of system with the same blind spots. That is not a degree of the Dark Factory, it is a different failure, and until now the model computed the difference (`JUDGEMENT_BONUS.llm = −15`) without ever naming it. The Believer is the name.

**Why only this house.** Judgement does not split the other eight, and this is a rule rather than an omission: everywhere else a human still writes the code or still reads it, so an over-trusted model is a modifier on a class that a person is still inside. Here it is the last human out of the loop, and the loop closes. One house, one extra sign — the alternative is a Judgement split everywhere, thirty-six signs, and a model nobody can hold in their head.

**Why not at Sandbox.** At Sandbox stakes the house already splits by Reference into Spec Runner and Vibe Coder, and the Vibe Coder is the Believer without consequences — *ship it and see* is the same posture where nothing is downstream, and it does not need a second name to say so. The resolution order in §8.1 enforces this: the Sandbox branch runs first, so The Believer is reachable at Live service and Under audit only.

```ts
{
  id: 'believer',
  name: 'The Believer',
  epithet: 'takes the model at its word',
  tagline: 'Machines write it, machines check it, and the machine says it is correct',
  house: { code: 'delegated', review: 'delegated' },
  environments: ['team', 'regulated'],
}
```

**body**

> Agents write it, an AI reviewer clears it, and when someone asks how you know it is right, the answer is that the model said so. The Dark Factory next door keeps at least one authority outside the model — a person, a team, or a codified gate can still contradict what the machines produced. Here the final authority is the model's own opinion, so the thing that generated the code, the thing that reviewed it, and the thing that ruled on it all share a set of priors, and a wrong answer gets confirmed three times instead of caught once. This is the lowest independence the map can reach, and it is the only sign that gets there by trusting rather than by cutting corners — which is exactly why it is invisible from the inside.

**signature**

> - The answer to *how do you know it works* is a transcript of the model agreeing
> - Nobody on the team can name a check the model does not also run
> - The last time a person disagreed with the reviewer, the person was talked out of it

**strengths** — real ones, because the model does not rank people and a sign with nothing going for it would be a caricature rather than a position anyone recognises:

> - Genuinely fast, and the speed is not an illusion — nothing in this loop is waiting on a human
> - The standard gets applied to every change, at every hour, without fatigue and without the politics of a review conversation

**failureModes**

> - Every oracle in the loop shares its priors with whatever wrote the code, so the mistakes it is worst at finding are the ones it is most likely to make
> - Confidence rises while independence falls, and nothing in this posture can detect that direction of drift — the model reports the same clean result either way

**nextMoves**

> - Write down one standard the model does not get a vote on — a test it cannot edit, a policy file it cannot approve a change to. One is enough to start finding out what has been getting through.
> - Take a handful of model-approved diffs and read them yourself, cold. The hit rate is the only calibration you have, and right now you do not have it.
> - Move Judgement to Codified law before you move anything else. It costs no throughput, it is the cheapest change available here, and it is the whole difference between this sign and the Dark Factory.

**Arithmetic, unchanged.** No weight moves; the four states that reach The Believer already carried these values and simply resolved to a different name. Independence is fifteen with an Independent reference and five with a Loop-owned reference, against a floor of fifty-five at Live service and eighty-five Under audit — so **every state that reaches The Believer is `under-verified`, and it is the only sign of the eighteen that can say so.** The Dark Factory next door spans under-verified and thin, which is the arithmetic agreeing with the split: a lights-out pipeline held to codified law can clear the bar at Live service, and the same pipeline judged by the model cannot, anywhere.

The lowest independence the model reaches belongs to the position Summoned · Machine-gated · The oracle · Loop-owned reference — it is the unique minimum, and it is a Believer reading everywhere except Sandbox, where it is the Vibe Coder. Independence never reads Stakes, so that is a statement about the position and §13 asserts it as one.

### 8.4 Icons

Thirty-three line icons from `lucide-react`, `currentColor`, no fills, no colour coding, no emoji. **The trait set and the sign set are disjoint by construction**, so a slot never looks like a result; both maps are exhaustively keyed, so a nineteenth sign without an icon is a compile error rather than a blank square.

The Believer takes **`Church`** — the one piece of overt horoscope iconography in the set, and it earns the exception because the name has already committed to the metaphor. `BadgeCheck` is the documented swap if it reads as commentary rather than as a joke; it was not the default because at small sizes it is hard to tell from `ShieldCheck`, which is the Machine-gated trait icon and appears on the same reading.

Sizes: option 20 (mobile) / 28 (≥sm), rail slot 14, reveal 40, catalogue card 18.

---

## 9. Screens

### 9.1 Frame

**Top bar** — `h-12`, dashed bottom border, one element: a mono `Horoscode` wordmark. No nav links, no button, and no outbound link — the firm is named in the footer only. It scrolls away rather than sitting fixed, so the stage subtracts it only on first paint.

**Bottom rule** — mono, `text-[10px]`, muted: `© VG Tech` · `Privacy` · `GitHub` · `A playground from VG Tech — vgtc.io`. Each link ≥44px tall on touch.

### 9.2 Hero

A band, not a screen — the stage must be reachable with one flick.

- Eyebrow: `CrossAccent` + `Five stars, one sign` in mono. A descriptor, not the product name — the top bar already carries that, and every other eyebrow on the page describes its section.
- H1: `What kind of software engineer` / **`are you in 2026?`**
- Sub: *Five stars — how you write it, who checks it, who decides, what can contradict the implementation, and what breaks. They align on one of eighteen signs.*
- Honesty line, mono, muted: *No stars were consulted. Five picks, one lookup table, and arithmetic you can read in the source.*

### 9.3 Pick phase

Rail, question (+ helper where the slot has one), option grid, stage footer. The footer holds the counter — `Star 2 of 5` while picking, `3 of 5 stars` on a partial reading — plus `Back` where there is somewhere to go. No disclosure line — the storage claim lives on `/privacy` (§12.2) for whoever wants it.

### 9.4 The reading

In order:

1. Sign icon, 40px.
2. `Your reading` — mono label.
3. Name — `The` light, the noun semibold. Epithet in mono beneath.
4. Body.
5. Meters, then the verdict block: `Forecast` label, chip, forecast line, `meterCaption`.
6. Signature — three bullets.
7. Plays to / Breaks when.
8. Next moves — three imperatives, then `verdictAdvice`.
9. Actions: `Read again`, `See all eighteen signs`, `Copy link`, `Copy as text`.

`See all eighteen signs` is an in-page anchor to the sign catalogue (§9.5), which is the only place the full set is enumerated. It is a link, not a control — no client state, no scroll-jacking beyond the anchor.

`Read again` clears the five stars and the URL params and returns to the first pick. Nothing else is cleared, because nothing else is kept (§10.2).

**The star rail stays live**, and this is the engagement mechanic: tapping a filled star returns to that pick, and choosing something new returns straight to the reading. Its accessible name is `Your five stars`; per-slot labels keep the axis vocabulary (`Change Authorship — currently Summoned`), because a screen-reader user re-picking needs the axis name, not the frame's noun.

The rail is also the complete trait summary. Reference is displayed there exactly like the other four stars; it is not composed onto the sign name, body, strengths, or failure modes as a second taxonomy.

### 9.5 Sign catalogue

Server-rendered, and the reason the page is indexable: a tool whose content is entirely behind client state gives a crawler nothing. Eighteen cards — icon, name, epithet, tagline, body, the conditions that reach it, failure modes — grouped into the ten reachable above Sandbox and the eight that exist only there, each with `id="sign-<id>"` for deep links.

**It is also the only enumeration of the eighteen**, which is a change in its job rather than in its markup: with no chart on the page, this section is where `See all eighteen signs` lands and where a visitor compares their reading against the rest. Two consequences follow. The conditions line on each card carries the full reachability — house, stakes tiers, and the Reference or Judgement value where one of those resolves the sign — because there is no grid left to read it off. And the card for the visitor's own sign takes `aria-current="true"` and a dashed outline when the reading is complete, which is the one piece of client state this otherwise-static section accepts. The Reference star gets no separate cards; the model explanation in §6.2 is its single explanatory surface outside the picker and rail.

---

## 10. State, URL, persistence

### 10.1 The URL is the only source of state

| Param | Axis | Values |
| --- | --- | --- |
| `c` | Authorship | `hand` · `blended` · `delegated` |
| `r` | Verification | `hand` · `blended` · `delegated` |
| `j` | Judgement | `me` · `team` · `process` · `llm` |
| `s` | Reference | `independent` · `loop` (`s` for standard — `r` was taken) |
| `e` | Stakes | `hobby` · `team` · `regulated` |

Five params, one per star, and no sixth. Words, not numbers. Every value is validated and unknown params are normalised away. There are no legacy aliases: values outside the table above are invalid rather than translated into a current trait.

Read once after mount — reading `location` during render would diverge from the server tree — and written with `router.replace(..., { scroll: false })` on each discrete pick. **No debounce**, so there is no pending timer for a copy action to race. The address bar is left untouched until the first real interaction, so an arrival URL carrying campaign params is not rewritten out from under whatever recorded it.

### 10.2 Persistence: none

**The app writes nothing to the device.** No `localStorage`, no `sessionStorage`, no cookies, no IndexedDB, no service worker cache of visitor state. The five stars live in the address bar and nowhere else, and closing the tab ends the session completely.

This is a consequence of removing the chart rather than a separate decision. The only thing ever stored was the charted set — which signs you had seen — and its only render surface was the chart's discovery markers and counter. With no surface, a stored set is data collected for nothing, which is the one kind of storage that is never defensible. Removing it also makes §12.2 a single true sentence instead of a sentence with an exception.

If a second-run mechanic is wanted later, the honest version is a counter in the reading's action row (`seven of eighteen signs read`) and it brings its own storage key back with it. It is not in this spec.

### 10.3 Copy actions

Both are synchronous derivations of the state that produced the rendered result. They use `SITE_URL`, never `window.location`, so preview and noncanonical hosts still produce canonical public links.

- **Copy link** → `SITE_URL + serialise(state)`.
- **Copy as text** → `summariseAsText`: name — epithet / verdict label / forecast line / the five axes and traits / the link. Words only — no metric ever reaches a clipboard that never appeared on screen, and no modifier is added to the name that was not present in the reading.

On a clipboard rejection (denied permission, insecure context) the app says nothing rather than confirming a copy that did not happen.

---

## 11. Metadata, sharing, SEO

### 11.1 Metadata

- Title: `Horoscode — What Kind of Software Engineer Are You in 2026?`
- Description: *Pick five stars and get your engineering reading — one of eighteen signs, with a forecast for the gap between automation and verification. Free and browser-only.*
- `metadataBase` from `NEXT_PUBLIC_SITE_URL`. Canonical `/`.
- **Structured data:** `WebApplication` (`applicationCategory: DeveloperApplication`, `offers.price: "0"`, `publisher` → the VG Tech organisation node at `https://www.vgtc.io/#organization`), plus a two-item `BreadcrumbList`.
- `robots: { index: true, follow: true }`.

### 11.2 The share card

> **Superseded in full by `github-pages-deployment.spec.md` §4.1.** A static export has nowhere to run a request-time handler, so the per-result card is gone and `app/opengraph-image.tsx` is the whole share surface: one generic 1200 × 630 image for every reading, drawn at build time. A shared link still restores the exact reading — the five params travel in the URL, and only the unfurler's thumbnail goes generic. The fallback this section names below is what shipped. The rest is kept as the record of what was traded away.

The frame is shareable and a static logo card wastes it. `generateMetadata({ searchParams })` reads the five params and points `openGraph.images` at `/api/og?c=…&r=…&j=…&s=…&e=…`, an `ImageResponse` route rendering the sign icon, the name, the epithet, and the verdict chip on the black-and-white grid — 1200 × 630, no external fetch, fonts inlined from the same `next/font` sources.

**The cost, stated rather than discovered:** reading `searchParams` in `generateMetadata` opts `/` into dynamic rendering. The HTML is identical either way and the route is cacheable at the edge, so the practical effect is one render per unique param set. If that is unwanted, the fallback is `app/opengraph-image.tsx` alone — a static card — and the dynamic route is deleted with no other change.

`app/opengraph-image.tsx` ships regardless as the no-params card.

---

## 12. Analytics and privacy

### 12.1 Events

> Amended by `github-pages-deployment.spec.md` §5.1: the vendor is gone, because GitHub Pages has none of the runtime endpoints it would beacon to. The three events, their payloads, and the `lib/analytics.ts` boundary all survive exactly as specified below — `track()` is a typed no-op, which is what keeps the eighteen call sites free of vendor conditionals. Nothing is logged, stored, queued, or sent.

Three, through the `track()` wrapper in `lib/analytics.ts`, so the vendor is one import:

| Event | Payload |
| --- | --- |
| `horoscode_pick` | `slot`, `trait`, `index` |
| `horoscode_result` | `sign`, `verdict`, the five traits, `run` (1-based per session) |
| `horoscode_share` | `method` (`link` \| `text`), `sign` |

`horoscode_pick` is the event that shows where a run stops, and so the one that decides whether five slots was the right number. The result event fires once per arrival at a reading, keyed on the five traits, so a re-render is not a second result.

**No Google Analytics, no Clarity, no Meta pixel, no cookies of any kind.** This is a divergence from the main site and it is deliberate: it is what lets the honesty line and the privacy page both be true without a paragraph of exceptions.

### 12.2 `/privacy`

One screen, no legalese, and accurate — which is the whole reason it exists.

**Superseded by `github-pages-deployment.spec.md` §5.2.** The vendor sentence went with the vendor; the page now claims less, and all of it is true:

> Horoscode stores nothing. Your five picks live in the page's address bar and nowhere else — there are no cookies, no local storage, no analytics, and no accounts, so closing the tab is the whole of it.

---

## 13. Verification

No test runner. `pnpm verify` runs `next typegen && tsc --noEmit`, `eslint .`, and `node scripts/verify.mjs`, which imports `lib/horoscode.ts` directly and asserts:

> Extended by `github-pages-deployment.spec.md` §8. The source harness below gains the deployment guards in §8.1 — no removed vendor, no retired origin, a build rooted at `/`, and the application icon — and a second harness, `scripts/verify-export.mjs`, asserts in §8.2 what only the built `out/` can show. `pnpm verify:export` runs it.

**Totality and arithmetic**
- All 216 states resolve: every metric is an integer, `independence` ∈ [0, 100], `automation` ∈ [0, 100].
- The scaled-integer identity: `independence` equals the same expression computed in floats and rounded once.
- The four bands partition the integer margin range with no gap and no overlap.
- `independence` is monotone non-increasing in `review` and — at fixed `review` — non-increasing in `code`, under both Reference values.
- Reference never changes `automation`; changing `loop` to `independent` changes only `independence`, by the declared bonus except where the clamp applies.
- The Summoned × Machine-gated house is strictly lowest at the trait centroids, and **the minimum independence over all 216 states is attained by exactly one position** — Summoned · Machine-gated · The oracle · Loop-owned reference — which resolves to The Believer above Sandbox and to the Vibe Coder at it. Asserted as a unique argmin over positions, not as a threshold, because a threshold passes when a third position ties it. Independence does not read Stakes, so the assertion is about the position and says so.
- `pips` is monotone non-decreasing.

**Signs**
- All eighteen reachable; the eight Sandbox signs reachable **only** at `hobby`; The Believer reachable **only** above it.
- Reference never changes the sign above Sandbox, and changes it in exactly the four split houses at Sandbox.
- **Judgement changes the sign in exactly one house and only above Sandbox**, asserted as set equality against `{Summoned × Machine-gated}` — a count would pass if the split landed on the wrong house. Within it, `llm` resolves to The Believer and the other three resolve to the Dark Factory.
- **Every state that reaches The Believer is `under-verified`**, and no other sign has that property — the second half matters, because the first alone would still pass if the split had swallowed states that belong to a neighbour.
- The two branches of `resolveSign` are ordered, not overlapping: no `hobby` state reaches the Judgement branch, checked by construction over all 216 rather than by reading the function.
- `environments` on every record matches what resolution actually produces.
- Margin `−5` is attainable (the band edge is not decorative).

**Forecasts**
- Twelve lines, all digit-free, `forecastFor` total over all 216 states.
- **Exactly two cells unreachable**, asserted as set equality against `{under-verified × hobby, over-controlled × regulated}` — not as a count, because a count passes if the wrong two are dead.
- No forecast line appears verbatim inside any `verdictAdvice` output.

**Copy and contract**
- **No digit in any user-facing string** — every option name and line, helper, question, verdict label and blurb, meter caption, forecast, advice, and sign field. Spelled-out numerals are the rule ("eighteen", "five").
- `serialise` round-trips over all 216 complete states plus every partial plus empty; parsing is a pure function of the URL.
- **`serialise` emits exactly the five star params and no others**, and `parseState` drops every unrecognised key — the assertion that catches a sixth param being reintroduced by a feature that needs somewhere to put its state.
- The reading and `summariseAsText` resolve the same sign name and epithet, and neither adds a Reference-derived modifier to it. *The share card was a third surface here until `github-pages-deployment.spec.md` §4.1 made it generic; it now names no sign at all, so there is nothing left to agree with (§8.1).*
- No record in `content/signs.ts` carries an outbound href, and no sign card or reading action renders one (§2).

**Mechanical guards**
- **No randomness**: grep `lib/`, `components/`, `content/`, `app/` for `Math.random`, `Date.now`, and `new Date`, failing on a hit.
- **No second result taxonomy**: grep those directories for the identifiers `Rising`, `RISINGS`, and `risingFor`, failing on a hit. Natural-language uses of “rises” remain valid in forecast copy.
- No `data-cal-link`, no chat-widget script, no `Navbar`/`Footer` import anywhere in `app/`.
- **No client-side storage**: grep `lib/`, `components/`, and `app/` for `localStorage`, `sessionStorage`, `document.cookie`, and `indexedDB`, failing on a hit. §10.2 is a claim the privacy page repeats, so it is worth a grep rather than a convention.
- **Every interactive element declares a minimum target**: grep the component for `<button` and `role="button"` occurrences whose class list lacks one of the sanctioned min-height utilities (`min-h-11`, `min-h-[44px]`, `min-h-[64px]`, `min-h-[72px]`, `sm:min-h-[190px]`), failing on a hit. Crude, and it has caught the real regression it exists for: a control added without the floor.

**Manual pass**, at 375 × 667, 390 × 844, 768 × 1024, and 1280 × 800:

1. Complete a reading using only the thumb, one-handed, on a phone — no zoom, no mis-tap, no scroll during a pick.
2. Judgement (four options) fits without scrolling at 375 × 667.
3. Tap a filled rail slot from the reading, pick differently, land back on the reading — two taps total.
4. Every forecast line at each of the ten reachable verdict × stakes pairs, checked for length against the reading's mobile layout.
5. Both copy actions on iOS Safari, Android Chrome, and a desktop browser, including the denied-permission path.
6. `prefers-reduced-motion: reduce` — every phase change is instant and nothing is lost.
7. `prefers-color-scheme: dark` — contrast holds, no white flash on load.
8. Keyboard only, desktop: complete a reading, revisit a slot, reach every action.
9. VoiceOver on iOS and NVDA on Windows: the phase change is announced once, the rail slots read their axis and current trait, the reading heading takes focus.
10. A shared link opens directly on the reading with all five stars filled.
11. `See all eighteen signs` from a completed reading lands on the sign catalogue with the visitor's own card marked.
12. Lighthouse on mobile: performance ≥ 95, accessibility 100, no layout shift on the stage.

---

## 14. Content source and maintenance

The model in §6–§8 is fully specified here — every weight, band, matrix cell, and forecast line is reproduced above. The canonical long-form copy for all eighteen signs is committed in `content/signs.ts`, so this repository contains everything required to build, test, deploy, and maintain the application.

| Content | Canonical source |
| --- | --- |
| Sign names, epithets, taglines, bodies, lists, and placement | `content/signs.ts` |
| The Believer's resolution rule and rationale | §8.3 and its record in `content/signs.ts` |

Content maintenance follows three rules:

1. **Records carry no links** — sign copy never points outward, to the firm or anywhere else (§2). The only outbound links on the site are in the bottom rule.
2. **The record schema stays narrow** — each sign contains only the fields listed in §8.2. There is no second result taxonomy and there are no transits (§15).
3. **Identifiers use the product vocabulary** — `Sign`, `SignId`, `SIGNS`, `resolveSign`, and `House`; string ids remain aligned with their `#sign-<id>` anchors.

Changes to the committed record strings are content changes and receive the same review as changes to the model. The assertion harness verifies record shape, reachability, naming, links, and the absence of a second taxonomy.

---

## 15. Out of scope

- Any backend, account, saved history, or server-side storage. **Client-side storage too** (§10.2) — no cookies, no local storage, nothing.
- **Transits.** The eight goals, their per-stakes practices, the derived target sign, and the gap table are all out. The reading answers *what are you* and stops there; *where should you be going* is a second product wearing the same page, it doubles the authored copy, and it is the part that reads as consulting rather than as a toy.
- **The signs chart.** The 3 × 3 grid of houses with all eighteen signs on it, its discovery markers, and the charted counter. The sign catalogue (§9.5) already enumerates the eighteen, in server HTML, with more copy per sign and a crawler that can read it — the chart was a second enumeration competing with the first.
- **Randomness of any kind**, including a "daily reading" that varies by date. It is the one change that would make the page dishonest, and §13 greps for it.
- Birthdays, names, star signs, or any personal input.
- Renaming the eighteen signs into zodiac vocabulary.
- Team mode; more than five stars; more than eighteen signs; a sixth axis as "advanced".
- **A Judgement split in any house but the lights-out corner** (§8.3). Four values across nine houses is thirty-six signs and a model nobody can hold in their head; the one split earns itself because it is the only place where naming it removes the last human from the loop.
- A sixth requirements-methodology or target-timing axis. Reference already captures the relevant distinction: whether the code-and-review loop controls the acceptance standard. Waterfall versus Agile and written-first versus discovered-later are deliberately not scored.
- Free-text input or model-generated result copy.
- Any CTA, lead capture, email field, or booking surface.
- Sound, scores, streaks, leaderboards, collection mechanics, share-to-social buttons that load a third-party script.
- i18n. The copy is argued in English and a machine translation would lose the argument.

## 16. Future

- **Sign permalinks** at `/signs/[sign]` — eighteen indexable pages, each opening on that sign's reading with stars pre-filled. The sign catalogue already carries the copy, so this is mostly routing.
- **A second toy**, if the domain becomes a playground rather than one page. Nothing in this spec assumes `/` is the only route.
- **A house view** at `/houses/[house]` — nine pages, each the signs that share an Authorship × Verification position. This is the indexable, server-rendered answer to what the chart was for, and it is the shape the chart should have taken if it comes back at all.
