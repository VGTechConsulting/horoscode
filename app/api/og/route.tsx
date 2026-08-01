import { ImageResponse } from 'next/og'
import { glyphDataUri } from '@/lib/sign-glyphs'
import { computeMetrics, isComplete, parseState, positionOf, resolveSign } from '@/lib/horoscode'
import { SITE_NAME } from '@/lib/site'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

/**
 * The dynamic share card (§11.2): the sign icon, the name, the epithet, and the
 * verdict chip on the black-and-white grid. No external fetch of any kind — the
 * card is drawn from the five params and nothing else, which is also why it
 * renders in the default typeface rather than pulling a font file over the wire.
 *
 * The name and epithet are the reading's, unmodified: nothing derived from
 * Reference is composed onto them here that a visitor did not see (§13).
 */
export function GET(request: Request) {
  const params = new URL(request.url).searchParams
  const state = parseState(params)

  if (!isComplete(state)) return new ImageResponse(<FallbackCard />, size)

  const sign = resolveSign(positionOf(state), state.environment)
  const metrics = computeMetrics(positionOf(state), state.environment)

  return new ImageResponse(
    (
      <div style={frame}>
        <div style={eyebrow}>{SITE_NAME}</div>
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 'auto' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={glyphDataUri(sign.id)} width={72} height={72} alt="" />
          <div style={{ ...heading, marginTop: 28 }}>{sign.name}</div>
          <div style={epithetStyle}>{sign.epithet}</div>
          <div style={{ display: 'flex', marginTop: 36 }}>
            <div style={chip}>{metrics.verdict.label}</div>
          </div>
        </div>
      </div>
    ),
    size,
  )
}

function FallbackCard() {
  return (
    <div style={frame}>
      <div style={eyebrow}>{SITE_NAME}</div>
      <div style={{ display: 'flex', flexDirection: 'column', marginTop: 'auto' }}>
        <div style={heading}>What kind of software engineer are you?</div>
        <div style={epithetStyle}>Five stars · eighteen signs · one lookup table</div>
      </div>
    </div>
  )
}

const frame: React.CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '#ffffff',
  color: '#000000',
  padding: 72,
  border: '1px dashed #b3b3b3',
}

const eyebrow: React.CSSProperties = {
  display: 'flex',
  fontSize: 22,
  letterSpacing: 8,
  textTransform: 'uppercase',
  color: '#737373',
}

const heading: React.CSSProperties = {
  display: 'flex',
  fontSize: 84,
  letterSpacing: -2,
}

const epithetStyle: React.CSSProperties = {
  display: 'flex',
  fontSize: 26,
  letterSpacing: 4,
  textTransform: 'uppercase',
  color: '#737373',
  marginTop: 18,
}

const chip: React.CSSProperties = {
  display: 'flex',
  fontSize: 22,
  letterSpacing: 4,
  textTransform: 'uppercase',
  color: '#000000',
  border: '1px dashed #000000',
  padding: '14px 22px',
}
