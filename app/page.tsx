import type { Metadata } from 'next'
import { CrossAccent } from '@/components/cross-accent'
import { Horoscode } from '@/components/horoscode'
import { ICON_SIZE, RISING_ICON, SIGN_ICON } from '@/lib/horoscode-icons'
import {
  REQUIREMENTS_STOPS,
  RISINGS,
  SANDBOX_REQUIREMENTS,
  SIGNS,
  SIGN_ORDER,
  URL_PARAMS,
  conditionsFor,
  isComplete,
  parseState,
  serialise,
  type SignId,
} from '@/lib/horoscode'
import { DESCRIPTION, SITE_URL, TITLE } from '@/lib/site'

/**
 * The share card is generated from the five params, so `generateMetadata` reads
 * them (§11.2). The cost, stated rather than discovered: this opts `/` into
 * dynamic rendering. The HTML is identical either way and the route is cacheable
 * at the edge, so the practical effect is one render per unique param set. If
 * that is unwanted, the fallback is `app/opengraph-image.tsx` alone and
 * `app/api/og/route.tsx` is deleted with no other change.
 */
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}): Promise<Metadata> {
  const raw = await searchParams
  const params = new URLSearchParams()
  for (const key of URL_PARAMS) {
    const value = raw[key]
    if (typeof value === 'string') params.set(key, value)
  }
  const state = parseState(params)
  const complete = isComplete(state)

  return {
    title: TITLE,
    description: DESCRIPTION,
    alternates: { canonical: '/' },
    openGraph: {
      type: 'website',
      title: TITLE,
      description: DESCRIPTION,
      url: complete ? serialise(state) : '/',
      // Only where all five stars are present. Anything less has no sign to
      // draw, and the static card in app/opengraph-image.tsx takes over.
      ...(complete
        ? { images: [{ url: `/api/og?${serialise(state).split('?')[1]}`, width: 1200, height: 630 }] }
        : {}),
    },
    twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
    robots: { index: true, follow: true },
  }
}

/** The ten signs stakes reaches above Sandbox, then the eight that exist only
 *  there. Both keep SIGN_ORDER's relative order, so each group still reads house
 *  by house (§9.5). */
const SANDBOX_ONLY = SIGN_ORDER.filter((id) => id in SANDBOX_REQUIREMENTS)
const EVERYWHERE_ELSE = SIGN_ORDER.filter((id) => !(id in SANDBOX_REQUIREMENTS))

const COLS = 2

function webApplicationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    '@id': `${SITE_URL}/#webapp`,
    name: TITLE,
    url: `${SITE_URL}/`,
    description: DESCRIPTION,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any',
    browserRequirements: 'Requires JavaScript.',
    publisher: { '@id': 'https://www.vgtc.io/#organization' },
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  }
}

function breadcrumbSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Horoscode', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'All eighteen signs', item: `${SITE_URL}/#signs` },
    ],
  }
}

/** Icon, name, epithet, tagline, body, the conditions that reach it, failure
 *  modes, outbound link — the crawlable copy the client island cannot provide.
 *  The conditions line carries the full reachability, because with no chart on
 *  the page there is no grid left to read it off (§9.5). */
function ReferenceCard({ id, index, count }: { id: SignId; index: number; count: number }) {
  const sign = SIGNS[id]
  const Icon = SIGN_ICON[id]
  const lastRow = Math.floor((count - 1) / COLS)
  const row = Math.floor(index / COLS)

  return (
    <article
      id={`sign-${id}`}
      className={[
        'relative p-6 md:p-8 flex flex-col scroll-mt-6 border-dashed border-border',
        index === count - 1 ? '' : 'max-md:border-b',
        index % COLS === 0 ? 'md:border-r' : '',
        row === lastRow ? '' : 'md:border-b',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <Icon size={ICON_SIZE.card} className="text-foreground shrink-0 mt-0.5" aria-hidden="true" />
        <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/80 text-right leading-relaxed">
          {conditionsFor(id).map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </span>
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">{sign.name}</h3>
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
        {sign.epithet}
      </p>
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/80 mb-4">
        {sign.tagline}
      </p>
      <p className="text-xs text-muted-foreground leading-relaxed font-light mb-6">{sign.body}</p>
      <div className="mt-auto">
        <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/70 block mb-2">
          Breaks when
        </span>
        <ul className="space-y-1.5 mb-6">
          {sign.failureModes.map((line) => (
            <li
              key={line}
              className="flex items-start gap-2.5 text-xs text-muted-foreground font-light leading-relaxed"
            >
              <CrossAccent size={8} className="mt-1" />
              {line}
            </li>
          ))}
        </ul>
        <a
          href={sign.link.href}
          target="_blank"
          rel="noopener"
          className="inline-flex items-center gap-2 min-h-11 font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
        >
          {sign.link.label}
        </a>
      </div>
    </article>
  )
}

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webApplicationSchema()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema()) }}
      />

      {/* Hero — a band, not a screen: the stage must be reachable with one
          flick (§9.2). */}
      <section className="border-b border-dashed border-border">
        <div className="max-w-5xl mx-auto px-6 py-8 md:py-10">
          <div className="flex items-center gap-3 mb-5">
            <CrossAccent size={8} />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Horoscode
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-light tracking-tight text-foreground text-balance mb-4">
            What kind of software engineer
            <br />
            <span className="font-semibold">are you in 2026?</span>
          </h1>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl font-light">
            Five stars — how you write it, who checks it, who decides, whether done was written
            down, and what breaks. They align on one of eighteen signs.
          </p>
          {/* The honesty line, above the fold, mono (§1.1). */}
          <p className="font-mono text-[10px] text-muted-foreground/80 leading-relaxed max-w-2xl mt-4">
            No stars were consulted. Five picks, one lookup table, and arithmetic you can read in
            the source.
          </p>
        </div>
      </section>

      <Horoscode />

      {/* The reference section — server-rendered, and the reason the page is
          indexable: a tool whose content is entirely behind client state gives a
          crawler nothing. It is also the only enumeration of the eighteen
          (§9.5). */}
      <section id="signs" className="scroll-mt-6">
        <div className="max-w-5xl mx-auto px-6 py-14 md:py-20">
          <div className="flex items-center gap-3 mb-8">
            <CrossAccent size={8} />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              All eighteen signs
            </span>
          </div>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed font-light max-w-3xl mb-6">
            Eighteen positions on a three-by-three map of how code gets written against how it gets
            verified, with four of the nine houses splitting at Sandbox stakes and one splitting on
            who decides. There is no best sign and no maturity ladder — vibe coding is the right
            answer for a prototype and the wrong one for a payments platform, and agentic coding
            under human review is neither more nor less mature than writing it by hand. What the app
            measures is the mismatch between a position and its consequences: automation is cheap,
            and independent verification is the scarce thing. AI code review counts as verification
            only when the model checking the code is not the model that wrote it — two instances of
            the same model on both sides of the loop is the case that fails silently, because the
            priors that produced the bug are the priors used to look for it.
          </p>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed font-light max-w-3xl mb-10">
            Five stars produce the answer: how the code gets written, who is the last set of eyes
            before it ships, who decides it is correct, whether &ldquo;done&rdquo; was written down
            before the work started, and what happens when it breaks. The first two place you on the
            map. Judgement and stakes decide what the position costs — and in the lights-out house,
            where agents write it and a machine clears it, Judgement decides the name too: a dark
            factory held to codified law has an oracle the model does not get to edit, and one that
            takes the model at its word has none. The fourth star is your rising sign — a requirement
            written before the code exists is an oracle the implementation could not influence, which
            is the cheapest independent verification available, and its absence is why fully agentic
            delivery against a moving target is the sharpest case on this map.
          </p>

          {/* Two risings, applied on top of whichever sign resolves — except at
              Sandbox in the split houses, where Requirements named the sign
              itself and the badge would only restate it (§8.4). */}
          <div className="grid grid-cols-1 sm:grid-cols-2 border border-dashed border-border mb-10">
            {REQUIREMENTS_STOPS.map((id, i) => {
              const rising = RISINGS[id]
              const RisingIcon = RISING_ICON[id]
              return (
                <div
                  key={id}
                  className={[
                    'p-6 border-dashed border-border',
                    i === 0 ? 'max-sm:border-b sm:border-r' : '',
                  ].join(' ')}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <RisingIcon
                      size={ICON_SIZE.risingBadge}
                      className="text-foreground"
                      aria-hidden="true"
                    />
                    <span className="text-sm font-semibold text-foreground">{rising.name}</span>
                    <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/80">
                      rising
                    </span>
                  </div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
                    {rising.epithet}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed font-light">
                    {rising.body}
                  </p>
                </div>
              )
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 border border-dashed border-border">
            {EVERYWHERE_ELSE.map((id, idx) => (
              <ReferenceCard key={id} id={id} index={idx} count={EVERYWHERE_ELSE.length} />
            ))}
          </div>

          <div className="flex items-center gap-3 mt-16 mb-4">
            <CrossAccent size={8} />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Eight of them exist only at Sandbox stakes
            </span>
          </div>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed font-light max-w-3xl mb-10">
            When nothing is at stake there is no consequence to define the sign, so what remains is
            whether a target existed before the work started: with one the work is directed — you
            are aiming at something already described — and without one it is exploratory, because
            you find out what you are building by building it. That is the whole difference between
            a Learner and a Hobbyist, or a Benchmarker and a Skeptic. Above Sandbox the consequence
            defines the sign and a pre-written target is a risk modifier instead.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 border border-dashed border-border">
            {SANDBOX_ONLY.map((id, idx) => (
              <ReferenceCard key={id} id={id} index={idx} count={SANDBOX_ONLY.length} />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
