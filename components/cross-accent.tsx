/** A one-pixel plus sign drawn with two spans, in `--cross`. Used to mark the
 *  current option, the eyebrow, and list bullets (§3.3). Decorative in every
 *  position it appears, so it is always hidden from the accessibility tree. */
export function CrossAccent({
  className,
  size = 12,
}: {
  className?: string
  size?: number
}) {
  const half = size / 2
  return (
    <span
      className={`inline-block shrink-0 relative pointer-events-none${className ? ` ${className}` : ''}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <span
        className="absolute bg-[var(--cross)]"
        style={{ width: 1, height: size, left: half - 0.5, top: 0 }}
      />
      <span
        className="absolute bg-[var(--cross)]"
        style={{ width: size, height: 1, top: half - 0.5, left: 0 }}
      />
    </span>
  )
}
