import type { Metadata } from 'next'
import Link from 'next/link'
import { CrossAccent } from '@/components/cross-accent'

export const metadata: Metadata = {
  title: 'Privacy — Horoscode',
  description: 'Horoscode stores nothing. No cookies, no local storage, no accounts.',
  alternates: { canonical: '/privacy' },
}

/** One screen, no legalese, and accurate — which is the whole reason it exists
 *  (§12.2). Every claim here is grepped for by the harness (§13). */
export default function PrivacyPage() {
  return (
    <section>
      <div className="max-w-3xl mx-auto px-6 py-14 md:py-20">
        <div className="flex items-center gap-3 mb-6">
          <CrossAccent size={8} />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Privacy
          </span>
        </div>
        <h1 className="text-3xl md:text-5xl font-light tracking-tight text-foreground text-balance mb-8">
          Horoscode stores <span className="font-semibold">nothing</span>.
        </h1>
        <p className="text-sm md:text-base text-muted-foreground leading-relaxed font-light">
          Your five picks live in the page&rsquo;s address bar and nowhere else — there are no
          cookies, no local storage, and no accounts, so closing the tab is the whole of it.
          Anonymous, aggregate page analytics are collected by Vercel Analytics, which does not use
          cookies and does not track you across sites.
        </p>
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/80 mt-10">
          <Link href="/" className="inline-flex items-center min-h-11 hover:text-foreground transition-colors">
            Back to the reading
          </Link>
        </p>
      </div>
    </section>
  )
}
