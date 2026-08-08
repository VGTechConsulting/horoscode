'use client'

// The client island (spec §4, §9, §10). Everything on screen exists to make one
// of two-to-four choices, five times, then read a result.
//
// Two rules govern every control here. Every option is a button that fills its
// grid cell, so there is no border strip that looks tappable and is not, and no
// interactive element is smaller than forty-four by forty-four CSS pixels — the
// harness greps this file for a button whose class list lacks a sanctioned
// minimum height (§13), which is why the phrase is spelled out rather than
// written as a tag even in a comment.

import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowDown, ArrowLeft, Check, Copy, RotateCcw } from 'lucide-react'
import { CrossAccent } from '@/components/cross-accent'
import { track } from '@/lib/analytics'
import { ICON_SIZE, SIGN_ICON, TRAIT_ICON } from '@/lib/horoscode-icons'
import { SITE_URL } from '@/lib/site'
import {
  EMPTY_STATE,
  HOROSCODE_PATH,
  SLOTS,
  SLOT_ORDER,
  URL_PARAMS,
  computeMetrics,
  filledCount,
  firstEmptySlot,
  forecastFor,
  isComplete,
  meterCaption,
  metersFor,
  parseState,
  positionOf,
  resolveSign,
  serialise,
  summariseAsText,
  traitName,
  verdictAdvice,
  type CompleteState,
  type HoroscodeState,
  type Meter,
  type SlotId,
  type Verdict,
} from '@/lib/horoscode'

/** Judgement is the only four-option slot, so it is the only one that wraps and
 *  the only one that needs a second desktop breakpoint (§4.3). */
const OPTION_GRID: Record<SlotId, string> = {
  code: 'sm:grid-cols-3',
  review: 'sm:grid-cols-3',
  judgement: 'sm:grid-cols-2 lg:grid-cols-4',
  reference: 'sm:grid-cols-2',
  environment: 'sm:grid-cols-3',
}

/** Adjacent cells share a border rather than sitting in a gap, so an option grid
 *  has no dead pixels between targets. The dividers are derived from the row an
 *  option lands in at each column count, so no rule is ever drawn on a last row
 *  or a last column (§3.3, §4.2). */
function optionDividers(slotId: SlotId, index: number, count: number): string {
  const rules = [index === count - 1 ? '' : 'max-sm:border-b']
  if (slotId === 'judgement') {
    rules.push(index % 2 === 0 ? 'sm:max-lg:border-r' : '', index < 2 ? 'sm:max-lg:border-b' : '')
    rules.push(index === count - 1 ? '' : 'lg:border-r')
  } else {
    rules.push(index === count - 1 ? '' : 'sm:border-r')
  }
  return rules.filter(Boolean).join(' ')
}

// ─── Shared bits ────────────────────────────────────────────────────────────

function SectionHeading({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mb-8">
      <CrossAccent size={8} />
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </span>
    </div>
  )
}

/** The margin is not printed. The band it selected is (§6.4). Weight and border
 *  style carry the emphasis — `under-verified` takes the solid foreground, the
 *  other three take the muted rule. Never red, amber, or green. */
function VerdictChip({ verdict }: { verdict: Verdict }) {
  const emphatic = verdict.id === 'under-verified'
  return (
    <span
      className={[
        'inline-flex items-center gap-2 border border-dashed px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest',
        emphatic
          ? 'border-foreground text-foreground font-semibold'
          : 'border-border text-muted-foreground',
      ].join(' ')}
    >
      <CrossAccent size={8} />
      {verdict.label}
    </span>
  )
}

/** Ordinal, not scalar, and the one place the value is spoken: "five filled
 *  squares" is not information, "Automation: five of five" is. */
const SPELLED = ['zero', 'one', 'two', 'three', 'four', 'five'] as const

function StatMeter({ meter }: { meter: Meter }) {
  return (
    <div>
      <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/70 block mb-2">
        {meter.label}
      </span>
      <span
        role="img"
        aria-label={`${meter.label}: ${SPELLED[meter.filled]} of ${SPELLED[meter.total]}`}
        className="flex items-center gap-1.5"
      >
        {Array.from({ length: meter.total }, (_, i) => (
          <span
            key={i}
            aria-hidden="true"
            className={
              i < meter.filled
                ? 'horoscode-pip block w-4 h-4 bg-foreground'
                : 'block w-4 h-4 border border-dashed border-border'
            }
            style={i < meter.filled ? { animationDelay: `${i * 60}ms` } : undefined}
          />
        ))}
      </span>
    </div>
  )
}

// ─── The star rail ──────────────────────────────────────────────────────────

/** Five across at every breakpoint — a rail that wraps or scrolls is no longer a
 *  fixed frame of reference. Interactive from the moment a slot fills, which is
 *  the engagement mechanic rather than decoration (§9.4).
 *
 *  On a phone it is the re-pick affordance and belongs in the thumb arc at the
 *  bottom of the stage; on a tablet or a desktop it is a progress indicator and
 *  belongs at the top where progress indicators are read (§4.3). */
function StarRail({
  state,
  activeSlot,
  onSelect,
}: {
  state: HoroscodeState
  activeSlot: SlotId | null
  onSelect: (slot: SlotId) => void
}) {
  return (
    <nav
      aria-label="Your five stars"
      className="grid grid-cols-5 shrink-0 border-dashed border-border max-sm:order-2 max-sm:sticky max-sm:bottom-0 max-sm:z-10 max-sm:bg-background max-sm:border-t sm:border-b"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {SLOT_ORDER.map((id, i) => {
        const slot = SLOTS[id]
        const value = state[id]
        const filled = value !== null
        const isActive = activeSlot === id
        const Icon = filled ? TRAIT_ICON[id][value] : null
        return (
          <button
            key={id}
            type="button"
            // No disabled state on an option anywhere in the app; an empty rail
            // slot is not an option, it is a signpost, and it stays focusable so
            // a keyboard user can read the axis name off it.
            aria-disabled={filled ? undefined : true}
            aria-current={isActive ? 'true' : undefined}
            aria-label={
              filled
                ? `Change ${slot.axis} — currently ${traitName(id, value)}`
                : `${slot.axis} — not yet chosen`
            }
            onClick={() => onSelect(id)}
            className={[
              'horoscode-target group flex flex-col items-center justify-center gap-1.5 px-1 py-2.5 min-h-[64px] border-dashed border-border transition-colors',
              i === SLOT_ORDER.length - 1 ? '' : 'border-r',
              filled ? 'cursor-pointer' : 'cursor-default',
              isActive ? 'bg-foreground/5' : '',
            ].join(' ')}
          >
            <span
              className={[
                'flex items-center justify-center w-7 h-7 border',
                filled ? 'border-solid border-foreground' : 'border-dashed border-border',
              ].join(' ')}
            >
              {Icon ? (
                <Icon
                  size={ICON_SIZE.railSlot}
                  className="horoscode-slot text-foreground"
                  aria-hidden="true"
                />
              ) : (
                <span className="w-[6px] h-[6px] bg-border" aria-hidden="true" />
              )}
            </span>
            {/* Roughly sixty pixels per slot on a phone fits a short axis label
                but not the full names, so the rail shortens below sm. The full
                value is always in the aria-label. */}
            <span
              className={[
                'font-mono text-[9px] uppercase tracking-widest max-w-full truncate',
                filled ? 'text-foreground' : 'text-muted-foreground/70',
              ].join(' ')}
            >
              {filled ? traitName(id, value) : <span className="sm:hidden">{slot.short}</span>}
              {!filled && <span className="max-sm:hidden">{slot.axis}</span>}
            </span>
          </button>
        )
      })}
    </nav>
  )
}

// ─── Pick phase ─────────────────────────────────────────────────────────────

/** Buttons, not radios, with no exceptions — there is no other input of any kind
 *  in the app. One tap commits and advances; there is no second "next" tap to
 *  lose people at (§4.5). */
function PickPhase({
  slotId,
  value,
  labelId,
  firstOptionRef,
  currentOptionRef,
  onPick,
  onEscape,
}: {
  slotId: SlotId
  value: string | null
  labelId: string
  firstOptionRef: React.RefObject<HTMLButtonElement | null>
  currentOptionRef: React.RefObject<HTMLButtonElement | null>
  onPick: (value: string) => void
  onEscape: () => void
}) {
  const slot = SLOTS[slotId]
  const groupRef = useRef<HTMLDivElement | null>(null)

  // Arrow keys move focus within the group. Five short groups, so a roving
  // tabindex is not needed — native tab order is fine (§4.5).
  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Escape') {
        onEscape()
        return
      }
      const step =
        event.key === 'ArrowRight' || event.key === 'ArrowDown'
          ? 1
          : event.key === 'ArrowLeft' || event.key === 'ArrowUp'
            ? -1
            : 0
      if (step === 0 || !groupRef.current) return
      const buttons = Array.from(groupRef.current.querySelectorAll('button'))
      const index = buttons.indexOf(document.activeElement as HTMLButtonElement)
      if (index === -1) return
      event.preventDefault()
      buttons[(index + step + buttons.length) % buttons.length].focus()
    },
    [onEscape],
  )

  return (
    <div className="horoscode-phase flex flex-col flex-1 min-h-0 px-5 py-4 md:px-10 md:py-10 sm:justify-center">
      <h2
        id={labelId}
        className="text-xl md:text-3xl font-light tracking-tight text-foreground text-balance"
      >
        {slot.question}
      </h2>
      {/* Helper text is rendered, never revealed: no information in this app is
          hover-only (§4.2). */}
      {slot.helper && (
        <p className="font-mono text-[10px] leading-snug text-muted-foreground/80 mt-2 md:mt-3 max-w-2xl">
          {slot.helper}
        </p>
      )}
      <div
        ref={groupRef}
        role="group"
        aria-labelledby={labelId}
        onKeyDown={onKeyDown}
        className={`grid grid-cols-1 ${OPTION_GRID[slotId]} border border-dashed border-border mt-4 md:mt-8`}
      >
        {slot.options.map((option, i) => {
          const isCurrent = option.value === value
          return (
            <button
              key={option.value}
              type="button"
              ref={
                i === 0
                  ? isCurrent
                    ? (node) => {
                        firstOptionRef.current = node
                        currentOptionRef.current = node
                      }
                    : firstOptionRef
                  : isCurrent
                    ? currentOptionRef
                    : undefined
              }
              aria-current={isCurrent ? 'true' : undefined}
              onClick={() => onPick(option.value)}
              className={[
                // The button *is* the cell: padding on the button, not the cell,
                // so the whole target is tappable (§4.2).
                'horoscode-target group relative w-full h-full text-left border-dashed border-border transition-colors cursor-pointer',
                'flex items-center gap-4 min-h-[72px] px-4 py-2.5',
                'sm:flex-col sm:items-start sm:justify-start sm:gap-3 sm:p-6 sm:min-h-[190px]',
                optionDividers(slotId, i, slot.options.length),
                // Selection is drawn as an inset ring, not as a border: the
                // borders here are dividers *shared* with the next cell, so a
                // border-based selection would repaint only the edges this cell
                // happens to own and read as a stray rule between two options.
                // An inset ring also leaves `outline` free for :focus-visible.
                isCurrent ? 'bg-foreground/5 inset-ring-1 inset-ring-foreground' : '',
              ].join(' ')}
            >
              {isCurrent && <CrossAccent size={10} className="absolute top-2 right-2" />}
              <OptionIcon slotId={slotId} value={option.value} />
              <span className="flex flex-col gap-1">
                {/* The one place the responsive scale runs backwards: on a phone
                    the option name is the tap target's label and has to be
                    readable at arm's length, in a hurry (§3.2). */}
                <span className="text-base sm:text-sm font-semibold text-foreground">
                  {option.name}
                </span>
                <span className="text-sm sm:text-xs text-muted-foreground font-light leading-snug sm:leading-relaxed">
                  {option.line}
                </span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function OptionIcon({ slotId, value }: { slotId: SlotId; value: string }) {
  const Icon = TRAIT_ICON[slotId][value]
  return (
    <>
      <Icon
        size={ICON_SIZE.optionMobile}
        className="shrink-0 text-foreground sm:hidden"
        aria-hidden="true"
      />
      <Icon
        size={ICON_SIZE.optionDesktop}
        className="shrink-0 text-foreground max-sm:hidden"
        aria-hidden="true"
      />
    </>
  )
}

// ─── The reading, inside the stage ──────────────────────────────────────────

function Reading({
  state,
  headingRef,
}: {
  state: CompleteState
  headingRef: React.RefObject<HTMLHeadingElement | null>
}) {
  const sign = resolveSign(positionOf(state), state.environment)
  const metrics = computeMetrics(positionOf(state), state.environment)
  const meters = metersFor(metrics)
  const Icon = SIGN_ICON[sign.id]

  return (
    <div className="horoscode-phase flex flex-col flex-1 min-h-0 px-5 py-8 md:px-10 md:py-10">
      <Icon
        size={ICON_SIZE.reveal}
        className="horoscode-in-1 text-foreground shrink-0"
        aria-hidden="true"
      />

      <span className="horoscode-in-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground/70 mt-4">
        Your reading
      </span>

      <h2
        ref={headingRef}
        tabIndex={-1}
        className="horoscode-in-2 text-3xl md:text-5xl font-light tracking-tight text-foreground text-balance mt-2 outline-none"
      >
        The <span className="font-semibold">{sign.name.replace('The ', '')}</span>
      </h2>

      {/* Name and epithet, and nothing composed on top of them: Reference is a
          star on the rail like the other four, not a second taxonomy the sign
          wears (§9.4). */}
      <p className="horoscode-in-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground mt-3">
        {sign.epithet}
      </p>

      <div className="horoscode-in-3 mt-5">
        <p className="text-sm md:text-base text-muted-foreground leading-relaxed font-light max-w-3xl">
          {sign.body}
        </p>
      </div>

      <div className="horoscode-in-3 mt-auto pt-6 flex flex-col sm:flex-row sm:items-end gap-6 sm:gap-10">
        <div className="flex gap-8">
          {meters.map((meter) => (
            <StatMeter key={meter.label} meter={meter} />
          ))}
        </div>
        {/* The verdict was always a claim about what happens next; the frame lets
            it be written out loud rather than shipped as a chip (§7). */}
        <div className="sm:ml-auto lg:text-right">
          <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/70 block mb-2">
            Forecast
          </span>
          <VerdictChip verdict={metrics.verdict} />
          <p className="text-[11px] text-muted-foreground font-light leading-relaxed mt-2 max-w-sm lg:ml-auto">
            {forecastFor(metrics, state.environment)}
          </p>
          <p className="text-[11px] text-muted-foreground/80 font-light leading-relaxed mt-2 max-w-sm lg:ml-auto">
            {meterCaption(metrics)}
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── The island ─────────────────────────────────────────────────────────────

export function Horoscode() {
  const router = useRouter()
  const uid = useId()

  const [state, setState] = useState<HoroscodeState>(EMPTY_STATE)
  const [activeSlot, setActiveSlot] = useState<SlotId | null>('code')
  const [hydrated, setHydrated] = useState(false)
  const [canCopy, setCanCopy] = useState(false)
  const [copied, setCopied] = useState<'link' | 'text' | null>(null)

  const stateRef = useRef(state)
  const runRef = useRef(0)
  // Set by the first real interaction. Until then the address bar is left as the
  // visitor found it, so an arrival URL carrying campaign params is not
  // rewritten out from under whatever recorded it (§10.1).
  const dirtyRef = useRef(false)
  // Where a rail jump came from: changing one star from the reading returns
  // straight to the reading, so it is one tap, one tap, done (§9.4).
  const returnToReadingRef = useRef(false)
  const movedRef = useRef(false)

  const stageRef = useRef<HTMLDivElement | null>(null)
  const firstOptionRef = useRef<HTMLButtonElement | null>(null)
  const currentOptionRef = useRef<HTMLButtonElement | null>(null)
  const headingRef = useRef<HTMLHeadingElement | null>(null)

  const labelId = `${uid}-question`

  useEffect(() => {
    stateRef.current = state
  }, [state])

  // The URL is the only source of state, read once after mount — reading
  // `location` during render would diverge from the server tree (§10.1).
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const next = URL_PARAMS.some((key) => params.has(key)) ? parseState(params) : { ...EMPTY_STATE }
    stateRef.current = next
    setState(next)
    setActiveSlot(firstEmptySlot(next))
    setCanCopy(typeof navigator !== 'undefined' && !!navigator.clipboard)
    setHydrated(true)
  }, [])
  /* eslint-enable react-hooks/set-state-in-effect */

  // Discrete picks, so the address bar syncs on each one. No debounce means no
  // pending timer for a copy action to race (§10.1).
  useEffect(() => {
    if (!hydrated || !dirtyRef.current) return
    router.replace(serialise(state), { scroll: false })
  }, [state, hydrated, router])

  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(null), 2000)
    return () => window.clearTimeout(timer)
  }, [copied])

  const complete = isComplete(state)
  const onReading = hydrated && complete && activeSlot === null
  const sign = complete ? resolveSign(positionOf(state), state.environment) : null

  // Fires once per arrival at a reading, keyed on the five stars, so a re-render
  // is not a second result (§12.1).
  useEffect(() => {
    if (!onReading || !isComplete(stateRef.current)) return
    const current = stateRef.current
    const resolved = resolveSign(positionOf(current), current.environment)
    const metrics = computeMetrics(positionOf(current), current.environment)
    runRef.current += 1
    track('horoscode_result', {
      sign: resolved.id,
      verdict: metrics.verdict.id,
      code: current.code,
      review: current.review,
      judgement: current.judgement,
      reference: current.reference,
      environment: current.environment,
      run: runRef.current,
    })
  }, [onReading, state.code, state.review, state.judgement, state.reference, state.environment])

  // Focus follows the phase: the new group's first option, or the current choice
  // when a filled slot is revisited, or the sign heading on the reading. Never
  // on the initial render, which would steal focus from the page (§4.5).
  useEffect(() => {
    if (!hydrated || !movedRef.current) return
    // A viewport-height stage only means something when it is at the viewport,
    // and the browser's own focus scroll only guarantees the focused element is
    // visible. Skipped when already within a pixel, and skipped entirely under
    // reduced motion.
    const stage = stageRef.current
    if (stage) {
      const top = stage.getBoundingClientRect().top + window.scrollY
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (Math.abs(window.scrollY - top) > 1) {
        window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' })
      }
    }
    const target =
      activeSlot === null ? headingRef.current : (currentOptionRef.current ?? firstOptionRef.current)
    target?.focus({ preventScroll: true })
  }, [activeSlot, hydrated])

  const pick = useCallback((slotId: SlotId, value: string) => {
    dirtyRef.current = true
    movedRef.current = true
    track('horoscode_pick', { slot: slotId, trait: value, index: SLOT_ORDER.indexOf(slotId) })

    const next = { ...stateRef.current, [slotId]: value } as HoroscodeState
    stateRef.current = next
    setState(next)

    // Cleared on every move: the ref is re-set during the next phase's render
    // only when that slot already has a value, and a stale node is detached.
    currentOptionRef.current = null
    const returning = returnToReadingRef.current
    returnToReadingRef.current = false
    if (returning && isComplete(next)) {
      setActiveSlot(null)
      return
    }
    setActiveSlot(firstEmptySlot(next))
  }, [])

  const jumpToSlot = useCallback(
    (slotId: SlotId) => {
      if (stateRef.current[slotId] === null) return
      movedRef.current = true
      currentOptionRef.current = null
      returnToReadingRef.current = activeSlot === null
      setActiveSlot(slotId)
    },
    [activeSlot],
  )

  /** Escape on a revisited slot returns to the reading, unchanged (§4.5). */
  const escape = useCallback(() => {
    if (!returnToReadingRef.current || !isComplete(stateRef.current)) return
    movedRef.current = true
    returnToReadingRef.current = false
    currentOptionRef.current = null
    setActiveSlot(null)
  }, [])

  const back = useCallback(() => {
    if (activeSlot === null) return
    const index = SLOT_ORDER.indexOf(activeSlot)
    if (index <= 0) return
    movedRef.current = true
    currentOptionRef.current = null
    returnToReadingRef.current = false
    setActiveSlot(SLOT_ORDER[index - 1])
  }, [activeSlot])

  /** Clears the five stars and the URL params and returns to the first pick.
   *  Nothing else is cleared, because nothing else is kept (§10.2). */
  const readAgain = useCallback(() => {
    dirtyRef.current = false
    movedRef.current = true
    returnToReadingRef.current = false
    currentOptionRef.current = null
    stateRef.current = { ...EMPTY_STATE }
    setState({ ...EMPTY_STATE })
    setActiveSlot('code')
    router.replace(HOROSCODE_PATH, { scroll: false })
  }, [router])

  // Both copy actions use the canonical public origin, even when the app is
  // opened through a preview or noncanonical host (§10.3).
  const copy = useCallback(async (method: 'link' | 'text', current: HoroscodeState) => {
    if (!isComplete(current)) return
    const payload =
      method === 'link'
        ? SITE_URL + serialise(current)
        : summariseAsText(current, SITE_URL)
    try {
      await navigator.clipboard.writeText(payload)
    } catch {
      // Denied permission or an insecure context. Nothing was copied, so say
      // nothing rather than confirming a copy that did not happen.
      return
    }
    setCopied(method)
    track('horoscode_share', {
      method,
      sign: resolveSign(positionOf(current), current.environment).id,
    })
  }, [])

  const stepIndex = activeSlot ? SLOT_ORDER.indexOf(activeSlot) : SLOT_ORDER.length

  return (
    <>
      <section className="border-b border-dashed border-border">
        <div className="max-w-5xl mx-auto px-6">
          {/* svh rather than vh: on mobile Safari `100vh` is the URL-bar-hidden
              height and would push the last option under the browser chrome.
              3rem is the top bar, which scrolls away rather than sitting fixed,
              so the stage subtracts it only on first paint (§4.1). */}
          <div
            ref={stageRef}
            className="flex flex-col min-h-[calc(100svh-3rem)] border-x border-dashed border-border"
          >
            <StarRail state={state} activeSlot={activeSlot} onSelect={jumpToSlot} />

            {/* One region, announcing the phase the stage moved to (§4.5). */}
            <div aria-live="polite" className="sr-only">
              {activeSlot === null && complete && sign
                ? `Your reading. ${sign.name}. ${sign.epithet}.`
                : activeSlot !== null
                  ? SLOTS[activeSlot].question
                  : ''}
            </div>

            <div className="flex flex-col flex-1 min-h-0 max-sm:order-1">
              {activeSlot !== null || !complete ? (
                <PickPhase
                  key={activeSlot ?? 'code'}
                  slotId={activeSlot ?? 'code'}
                  value={activeSlot ? state[activeSlot] : null}
                  labelId={labelId}
                  firstOptionRef={firstOptionRef}
                  currentOptionRef={currentOptionRef}
                  onPick={(value) => pick(activeSlot ?? 'code', value)}
                  onEscape={escape}
                />
              ) : (
                <Reading state={state} headingRef={headingRef} />
              )}
            </div>

            <div className="shrink-0 border-t border-dashed border-border px-5 py-2.5 md:px-10 md:py-3 max-sm:order-3">
              <div className="flex items-center justify-between gap-4">
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  {activeSlot === null
                    ? `${filledCount(state)} of ${SLOT_ORDER.length} stars`
                    : `Star ${stepIndex + 1} of ${SLOT_ORDER.length}`}
                </span>
                {activeSlot !== null && stepIndex > 0 && (
                  <button
                    type="button"
                    onClick={back}
                    className="horoscode-target inline-flex items-center gap-2 min-h-11 px-4 -mr-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors cursor-pointer"
                  >
                    <ArrowLeft size={11} aria-hidden="true" />
                    Back
                  </button>
                )}
                {activeSlot === null && (
                  <button
                    type="button"
                    onClick={readAgain}
                    className="horoscode-target inline-flex items-center gap-2 min-h-11 px-4 -mr-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors cursor-pointer"
                  >
                    <RotateCcw size={11} aria-hidden="true" />
                    Read again
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {onReading && complete && sign && (
        <>
          <ReadingDetail
            state={state}
            canCopy={canCopy}
            copied={copied}
            onCopy={copy}
            onReadAgain={readAgain}
          />
          {/* The one piece of client state the otherwise-static sign catalogue
              accepts (§9.5). */}
          <CurrentSignMarker signId={sign.id} />
        </>
      )}
    </>
  )
}

// ─── Below the stage ────────────────────────────────────────────────────────

function ReadingDetail({
  state,
  canCopy,
  copied,
  onCopy,
  onReadAgain,
}: {
  state: CompleteState
  canCopy: boolean
  copied: 'link' | 'text' | null
  onCopy: (method: 'link' | 'text', state: HoroscodeState) => void
  onReadAgain: () => void
}) {
  const sign = resolveSign(positionOf(state), state.environment)
  const metrics = computeMetrics(positionOf(state), state.environment)

  return (
    <section className="border-b border-dashed border-border">
      <div className="max-w-5xl mx-auto px-6 py-14 md:py-20">
        <SectionHeading label="What this looks like" />

        <div className="mb-10">
          <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/70 block mb-3">
            Signature
          </span>
          <ul className="space-y-2">
            {sign.signature.map((line) => (
              <li
                key={line}
                className="flex items-start gap-3 text-sm text-muted-foreground font-light"
              >
                <CrossAccent size={8} className="mt-1.5" />
                {line}
              </li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-12">
          <div>
            <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/70 block mb-3">
              Plays to
            </span>
            <ul className="space-y-2">
              {sign.strengths.map((line) => (
                <li
                  key={line}
                  className="text-xs text-muted-foreground font-light leading-relaxed"
                >
                  {line}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/70 block mb-3">
              Breaks when
            </span>
            <ul className="space-y-2">
              {sign.failureModes.map((line) => (
                <li
                  key={line}
                  className="text-xs text-muted-foreground font-light leading-relaxed"
                >
                  {line}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-10 lg:gap-16">
          <div>
            <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/70 block mb-4">
              Next moves
            </span>
            <ol className="space-y-6">
              {sign.nextMoves.map((move) => (
                <li key={move} className="flex items-start gap-4">
                  <CrossAccent size={8} className="mt-1.5" />
                  <span className="text-sm text-muted-foreground font-light leading-relaxed">
                    {move}
                  </span>
                </li>
              ))}
            </ol>
          </div>
          <div className="border border-dashed border-border p-5 h-fit">
            <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/70 block mb-3">
              On your margin
            </span>
            <p className="text-xs text-muted-foreground font-light leading-relaxed mb-4">
              {metrics.verdict.blurb}
            </p>
            <p className="text-xs text-muted-foreground font-light leading-relaxed">
              {verdictAdvice(metrics, sign)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-12">
          <button
            type="button"
            onClick={onReadAgain}
            className="horoscode-target inline-flex items-center gap-2 min-h-11 font-mono text-[10px] uppercase tracking-widest border border-dashed border-border px-4 text-muted-foreground transition-colors cursor-pointer"
          >
            <RotateCcw size={11} aria-hidden="true" />
            Read again
          </button>
          {/* A link, not a control: no client state, no scroll-jacking beyond
              the anchor (§9.4). */}
          <a
            href="#signs"
            className="horoscode-target inline-flex items-center gap-2 min-h-11 font-mono text-[10px] uppercase tracking-widest border border-dashed border-border px-4 text-muted-foreground transition-colors"
          >
            See all eighteen signs
            <ArrowDown size={11} aria-hidden="true" />
          </a>
          {canCopy && (
            <>
              <button
                type="button"
                onClick={() => onCopy('link', state)}
                className="horoscode-target horoscode-target-inverted inline-flex items-center gap-2 min-h-11 font-mono text-[10px] uppercase tracking-widest border border-foreground bg-foreground text-background px-4 cursor-pointer"
              >
                {copied === 'link' ? (
                  <Check size={11} aria-hidden="true" />
                ) : (
                  <Copy size={11} aria-hidden="true" />
                )}
                {copied === 'link' ? 'Copied' : 'Copy link'}
              </button>
              <button
                type="button"
                onClick={() => onCopy('text', state)}
                className="horoscode-target inline-flex items-center gap-2 min-h-11 font-mono text-[10px] uppercase tracking-widest border border-dashed border-border px-4 text-muted-foreground transition-colors cursor-pointer"
              >
                {copied === 'text' ? 'Copied' : 'Copy as text'}
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

/**
 * The sign catalogue is server HTML, and the visitor's own card is the only
 * thing in it that depends on a reading. Rather than move eighteen cards into
 * the client tree — which would take the crawlable copy with them — this marks
 * the one card that resolved and clears the mark when the stars change.
 */
function CurrentSignMarker({ signId }: { signId: string }) {
  useEffect(() => {
    const card = document.getElementById(`sign-${signId}`)
    if (!card) return
    card.setAttribute('aria-current', 'true')
    card.classList.add('outline', 'outline-dashed', 'outline-foreground', 'outline-offset-[-1px]')
    return () => {
      card.removeAttribute('aria-current')
      card.classList.remove(
        'outline',
        'outline-dashed',
        'outline-foreground',
        'outline-offset-[-1px]',
      )
    }
  }, [signId])
  return null
}
