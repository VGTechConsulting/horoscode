import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import Link from 'next/link'
import { SITE_NAME, SITE_URL, TITLE } from '@/lib/site'
import './globals.css'

// Two families, three weights of Inter and one of mono. Self-hosted at build
// time, so the page makes no external font request at runtime (§3.2).
const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  display: 'swap',
  variable: '--font-inter',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
  variable: '--font-jetbrains-mono',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  robots: { index: true, follow: true },
}

/** The top bar (§9.1). Two elements: the wordmark, and after a muted separator
 *  a mono product name. No nav links, no button, and it scrolls away rather than
 *  sitting fixed, so the stage subtracts it only on first paint. */
function TopBar() {
  return (
    <header className="border-b border-dashed border-border">
      <div className="max-w-5xl mx-auto px-6 h-12 flex items-center gap-3">
        <a
          href="https://vgtc.io"
          rel="noopener"
          aria-label="VG Tech Consulting"
          className="inline-flex items-center min-h-11"
        >
          <span className="font-mono text-sm font-medium tracking-widest uppercase text-foreground">
            VG<span className="text-muted-foreground">/</span>Tech
          </span>
        </a>
        <span className="text-muted-foreground/50" aria-hidden="true">
          /
        </span>
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {SITE_NAME}
        </span>
      </div>
    </header>
  )
}

/** The bottom rule (§9.1). Year-free, so it never goes stale, and the only two
 *  inbound links into the firm are here and on the wordmark — both to the
 *  homepage. */
function BottomRule() {
  return (
    <footer className="border-t border-dashed border-border">
      <div className="max-w-5xl mx-auto px-6 py-4">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 font-mono text-[10px] text-muted-foreground">
          <span className="inline-flex items-center min-h-11">© VG Tech</span>
          <Link href="/privacy" className="inline-flex items-center min-h-11 hover:text-foreground transition-colors">
            Privacy
          </Link>
          <span className="inline-flex items-center min-h-11">
            A playground from VG Tech —&nbsp;
            <a href="https://vgtc.io" rel="noopener" className="hover:text-foreground transition-colors">
              vgtc.io
            </a>
          </span>
        </div>
      </div>
    </footer>
  )
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-background text-foreground">
        <TopBar />
        <main>{children}</main>
        <BottomRule />
      </body>
    </html>
  )
}
