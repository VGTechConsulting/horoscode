/** The Horoscode astrolabe, drawn from the firm's own file
 *  (https://www.vgtc.io/toolbox/horoscode.svg): a circle, an inscribed triangle
 *  whose three points sit on it, one chord across, and a fixed star at the upper
 *  vertex. The geometry below is that file's, coordinate for coordinate, and it
 *  is the same drawing app/icon.svg carries — one mark, three places.
 *
 *  Two departures from the source, both forced by the size it is used at. The
 *  stroke is thickened from 1.9 to 2.4, which still reads as a hairline beside
 *  mono type but survives twenty pixels. And the outline is `currentColor`
 *  rather than the source's #0b0b0b, so the mark inverts with the palette
 *  (app/globals.css) instead of going invisible in dark mode.
 *
 *  The star keeps the parent brand's #e23122 — it is the one point of hue in the
 *  drawing, and dropping it would leave the app's mark and the firm's mark
 *  looking like two different things. It is a literal, not a token, for the same
 *  reason it is a literal in app/icon.svg: nothing else in the palette is
 *  chromatic.
 *
 *  Decorative wherever it appears: the wordmark beside it already names the
 *  product, so a second announcement would only repeat it. */
export function HoroscodeMark({
  className,
  size = 20,
}: {
  className?: string
  size?: number
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <g stroke="currentColor" strokeWidth="2.4">
        <circle cx="24" cy="24" r="19" />
        <path d="M19.08 5.65 L6.15 30.5 L39.56 34.9 Z" strokeLinejoin="round" />
        <line x1="6.15" y1="30.5" x2="41.85" y2="17.5" />
      </g>
      <circle cx="19.08" cy="5.65" r="2.9" fill="#e23122" />
    </svg>
  )
}
