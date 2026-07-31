import { ImageResponse } from 'next/og'
import { SITE_NAME } from '@/lib/site'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'Horoscode — what kind of software engineer are you?'

/** The no-params card, and the whole share surface if `app/api/og` is ever
 *  deleted (§11.2). */
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
        <div
          style={{
            display: 'flex',
            fontSize: 22,
            letterSpacing: 8,
            textTransform: 'uppercase',
            color: '#737373',
            marginBottom: 'auto',
          }}
        >
          {SITE_NAME}
        </div>
        <div style={{ display: 'flex', fontSize: 84, letterSpacing: -2 }}>
          What kind of software engineer are you?
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
