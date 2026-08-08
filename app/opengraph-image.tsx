import { ImageResponse } from 'next/og'
import { SITE_NAME } from '@/lib/site'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'Horoscode — forecast your future in your project'

/** Drawn once at build time, then finalized as `opengraph-image.png` by the
 *  postbuild script so static hosts serve it with the correct media type. */
export const dynamic = 'force-static'

/** The whole share surface: one generic 1200 × 630 card, generated at build time
 *  and served as a static file (github-pages-deployment.spec.md §4.1). It names
 *  no sign, epithet, or verdict — the per-result card needed a request-time
 *  handler, which a static export has nowhere to put. Nothing is fetched while
 *  drawing it, which is also why it renders in the default typeface.
 *
 *  A shared result still restores the correct reading: the five params travel in
 *  the URL, and the unfurler's preview is the only thing that goes generic. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          backgroundColor: '#ffffff',
          color: '#000000',
          padding: 72,
          border: '1px dashed #b3b3b3',
        }}
      >
        {/* The mark and the wordmark, as in the top bar. Drawn inline rather
            than imported from components/horoscode-mark.tsx: this renders in
            satori, not in a browser, so the colours are the light-mode literals
            — the card has a white ground and no system query to answer to. */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            marginBottom: 'auto',
          }}
        >
          <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
            <g stroke="#0b0b0b" strokeWidth="2.4">
              <circle cx="24" cy="24" r="19" />
              <path d="M19.08 5.65 L6.15 30.5 L39.56 34.9 Z" strokeLinejoin="round" />
              <line x1="6.15" y1="30.5" x2="41.85" y2="17.5" />
            </g>
            <circle cx="19.08" cy="5.65" r="2.9" fill="#e23122" />
          </svg>
          <div
            style={{
              display: 'flex',
              fontSize: 22,
              letterSpacing: 8,
              textTransform: 'uppercase',
              color: '#737373',
            }}
          >
            {SITE_NAME}
          </div>
        </div>
        <div style={{ display: 'flex', fontSize: 84, letterSpacing: -2 }}>
          Forecast your future in your project
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 26,
            letterSpacing: 4,
            textTransform: 'uppercase',
            color: '#737373',
            marginTop: 18,
          }}
        >
          Five stars · eighteen signs · one lookup table
        </div>
      </div>
    ),
    size,
  )
}
