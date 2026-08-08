import type { Metadata } from 'next'
import Link from 'next/link'
import { CrossAccent } from '@/components/cross-accent'

export const metadata: Metadata = {
  title: 'Privacy — Horoscode',
  description: 'Horoscode keeps your choices in the URL. No cookies, analytics, or accounts.',
  alternates: { canonical: '/privacy/' },
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
          Your reading stays <span className="font-semibold">with you</span>.
        </h1>
        <p className="text-sm md:text-base text-muted-foreground leading-relaxed font-light">
          Your five picks appear in the page&rsquo;s address so you can share or revisit the reading.
          Horoscode uses no cookies, local storage, analytics, or accounts. Close the tab and nothing
          is left behind on your device by this site.
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
