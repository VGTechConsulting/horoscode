// Horoscode — the engineering sign model (spec §6–§8, §10).
//
// Pure and dependency-free: no React, no icons, no DOM, no `window`, and no
// storage of any kind. The only import is the authored copy in content/signs.ts,
// which is data. That is what makes scripts/verify.mjs possible without a test
// runner — Node ≥ 22.18 strips types on load, so the harness imports this file
// directly (§5, §13).
//
// Arithmetic note: `correlation` and `independence` are computed in scaled
// integers and rounded exactly once each (§6.2). Nothing downstream re-rounds,
// so the verdict is always evaluated against the value that selected it.
//
// No-digits note: the metrics are computed on every pick and decide the verdict,
// the meters, and the analytics payload. They are never rendered (§6.4), which
// makes every string-producing function in this file part of that rule rather
// than incidental to it.

import { SIGNS, SIGN_ORDER, type Sign, type SignId } from '../content/signs.ts'

export { SIGNS, SIGN_ORDER }
export type { Sign, SignId }

// ─── Axis types ─────────────────────────────────────────────────────────────

export type Zone = 'hand' | 'blended' | 'delegated'
export type Judgement = 'me' | 'team' | 'process' | 'llm'
export type Reference = 'independent' | 'loop'
export type Environment = 'hobby' | 'team' | 'regulated'

export const ZONE_STOPS = ['hand', 'blended', 'delegated'] as const
export const JUDGEMENT_STOPS = ['me', 'team', 'process', 'llm'] as const
export const REFERENCE_STOPS = ['independent', 'loop'] as const
export const ENVIRONMENT_STOPS = ['hobby', 'team', 'regulated'] as const

// ─── The five stars (spec §6.1) ─────────────────────────────────────────────

export const SLOT_ORDER = ['code', 'review', 'judgement', 'reference', 'environment'] as const
export type SlotId = (typeof SLOT_ORDER)[number]

export interface TraitOption<T extends string> {
  value: T
  /** The trait name, e.g. "Machine-gated". */
  name: string
  /** One line, first person, shown under the name on the option card. */
  line: string
}

export interface Slot<T extends string> {
  id: SlotId
  /** Full axis name, used in the rail above `sm` and in the reading. */
  axis: string
  /** Short rail label below `sm`, where roughly sixty pixels per slot is all
   *  there is. */
  short: string
  question: string
  /** Only the three slots that get misread carry one (§6.1). */
  helper?: string
  options: readonly TraitOption<T>[]
}

export const CODE_SLOT: Slot<Zone> = {
  id: 'code',
  axis: 'Authorship',
  short: 'Code',
  question: 'How does the code get written?',
  options: [
    { value: 'hand', name: 'Forged', line: 'I write it. I own the structure and the details.' },
    { value: 'blended', name: 'Assisted', line: 'I lead; the model helps with the draft.' },
    {
      value: 'delegated',
      name: 'Summoned',
      line: 'Agents write it. I provide prompts, specs, and harnesses.',
    },
  ],
}

export const REVIEW_SLOT: Slot<Zone> = {
  id: 'review',
  axis: 'Verification',
  short: 'Review',
  question: 'Who is the last set of eyes before it ships?',
  options: [
    { value: 'hand', name: 'Every line', line: 'A human reads the diff. All of it.' },
    {
      value: 'blended',
      name: 'Second pair',
      line: 'A model reviews every change; a human reviews the risky ones.',
    },
    { value: 'delegated', name: 'Machine-gated', line: 'If the AI reviewer is happy, it ships.' },
  ],
}

export const JUDGEMENT_SLOT: Slot<Judgement> = {
  id: 'judgement',
  axis: 'Judgement',
  short: 'Judge',
  question: 'Who decides it is correct?',
  helper:
    'This measures how far you delegate the decision, not how good the decision is.',
  options: [
    { value: 'me', name: 'Own taste', line: 'My experience is the arbiter.' },
    {
      value: 'team',
      name: 'Peer council',
      line: 'Peers decide through review, shared conventions, or senior sign-off.',
    },
    {
      value: 'process',
      name: 'Codified law',
      line: 'Tests, gates, checklists, SLOs, policy-as-code.',
    },
    {
      value: 'llm',
      name: 'The oracle',
      line: 'The model decides. If it passes the AI reviewer, it is correct.',
    },
  ],
}

export const REFERENCE_SLOT: Slot<Reference> = {
  id: 'reference',
  axis: 'Reference',
  short: 'Ref',
  question: 'Is there an acceptance standard the code-and-review loop cannot change?',
  helper:
    'Standards can evolve. What matters here is who can change them.',
  options: [
    {
      value: 'independent',
      name: 'Independent reference',
      line: 'Someone outside the code-and-review loop controls the contract, tests, policy, rubric, or dataset.',
    },
    {
      value: 'loop',
      name: 'Loop-owned reference',
      line: 'The same loop can reinterpret or edit what counts as done.',
    },
  ],
}

export const ENVIRONMENT_SLOT: Slot<Environment> = {
  id: 'environment',
  axis: 'Stakes',
  short: 'Stakes',
  question: 'What happens when it breaks?',
  helper:
    'Answer for this project. Your weekend build and your day job may need different answers.',
  options: [
    {
      value: 'hobby',
      name: 'Sandbox',
      line: 'Nobody else is affected. Worst case is my weekend.',
    },
    {
      value: 'team',
      name: 'Live service',
      line: 'Real users, real revenue, a team that lives with it.',
    },
    {
      value: 'regulated',
      name: 'Under audit',
      line: 'Compliance, safety, or money movement. Failures are reportable.',
    },
  ],
}

/** Fixed order, deliberately not configurable (§6). */
export const SLOTS = {
  code: CODE_SLOT,
  review: REVIEW_SLOT,
  judgement: JUDGEMENT_SLOT,
  reference: REFERENCE_SLOT,
  environment: ENVIRONMENT_SLOT,
} as const

/** Trait value → its display name, per slot. */
export function traitName(slot: SlotId, value: string): string {
  const option = (SLOTS[slot].options as readonly TraitOption<string>[]).find(
    (o) => o.value === value,
  )
  return option ? option.name : value
}

// ─── State ──────────────────────────────────────────────────────────────────

/** A star is either filled or empty. There is no default and no restore: a naked
 *  URL starts every slot empty (§10.1). */
export interface HoroscodeState {
  code: Zone | null
  review: Zone | null
  judgement: Judgement | null
  reference: Reference | null
  environment: Environment | null
}

export interface CompleteState extends HoroscodeState {
  code: Zone
  review: Zone
  judgement: Judgement
  reference: Reference
  environment: Environment
}

export const EMPTY_STATE: HoroscodeState = {
  code: null,
  review: null,
  judgement: null,
  reference: null,
  environment: null,
}

export function isComplete(state: HoroscodeState): state is CompleteState {
  return (
    state.code !== null &&
    state.review !== null &&
    state.judgement !== null &&
    state.reference !== null &&
    state.environment !== null
  )
}

/** The slot the flow opens on: the first empty one, or null when complete. */
export function firstEmptySlot(state: HoroscodeState): SlotId | null {
  for (const id of SLOT_ORDER) {
    if (state[id] === null) return id
  }
  return null
}

export function filledCount(state: HoroscodeState): number {
  return SLOT_ORDER.reduce((n, id) => (state[id] === null ? n : n + 1), 0)
}

// ─── Primitives ─────────────────────────────────────────────────────────────

export function clamp(n: number, min: number, max: number): number {
  return n < min ? min : n > max ? max : n
}

// ─── Derived metrics (spec §6.2) ────────────────────────────────────────────

/** Trait centroids — the representative value of each zone. */
export const CODE_VALUE: Record<Zone, number> = { hand: 15, blended: 50, delegated: 85 }
export const REVIEW_VALUE: Record<Zone, number> = { hand: 15, blended: 50, delegated: 85 }

export const JUDGEMENT_BONUS: Record<Judgement, number> = {
  me: -10,
  team: 10,
  process: 15,
  llm: -15,
}

/**
 * A standard the loop cannot edit *adds* an oracle; a loop-owned one does not
 * *remove* one — hence `{+10, 0}` rather than `{+5, −5}` (§6.2).
 *
 * Reference and Judgement are deliberately orthogonal: Reference asks who
 * controls the acceptance standard, Judgement asks who or what applies it and
 * declares the result correct. A codified gate earns the Judgement bonus because
 * enforcement is consistent; it earns this one only when the code-and-review
 * loop cannot edit or reinterpret the standard it applies. A test suite
 * generated and freely rewritten by that same loop is `process` + `loop`, not
 * the same control counted twice.
 */
export const REFERENCE_BONUS: Record<Reference, number> = { independent: 10, loop: 0 }

export const REQUIRED_INDEPENDENCE: Record<Environment, number> = {
  hobby: 20,
  team: 55,
  regulated: 85,
}

export type VerdictId = 'under-verified' | 'thin' | 'balanced' | 'over-controlled'

export interface Verdict {
  id: VerdictId
  label: string
  blurb: string
}

/** No tone field, and that is the point: the four verdicts are distinguished
 *  typographically, never chromatically, because a colour-coded verdict reads as
 *  a score and §1 says there is no score (§3.1). */
export const VERDICTS: Record<VerdictId, Verdict> = {
  'under-verified': {
    id: 'under-verified',
    label: 'Under-verified for the stakes',
    blurb: 'Automation has moved well ahead of verification for work with this much risk.',
  },
  thin: {
    id: 'thin',
    label: 'Thin margin',
    blurb: 'Your checks just meet the needs of the project, with little room for a bad week.',
  },
  balanced: {
    id: 'balanced',
    label: 'Balanced',
    blurb: 'Your independent checks are in line with the cost of a failure.',
  },
  'over-controlled': {
    id: 'over-controlled',
    label: 'Over-controlled for the stakes',
    blurb: 'The project has more controls than its likely failures warrant.',
  },
}

/** Half-open and exhaustive: every integer margin falls in exactly one band. */
export function verdictFor(margin: number): Verdict {
  if (margin < -25) return VERDICTS['under-verified']
  if (margin < -5) return VERDICTS.thin
  if (margin <= 30) return VERDICTS.balanced
  return VERDICTS['over-controlled']
}

export interface Metrics {
  automation: number
  correlation: number
  independence: number
  required: number
  margin: number
  verdict: Verdict
}

/** Four traits. Never numbers — the UI has no vocabulary for a number, so a
 *  position expressed as one could not be displayed honestly (§6.4). */
export interface Position {
  code: Zone
  review: Zone
  judgement: Judgement
  reference: Reference
}

export function positionOf(state: CompleteState): Position {
  return {
    code: state.code,
    review: state.review,
    judgement: state.judgement,
    reference: state.reference,
  }
}

export function computeMetrics(position: Position, environment: Environment): Metrics {
  const code = CODE_VALUE[position.code]
  const review = REVIEW_VALUE[position.review]

  const automation = (code + review) / 2
  const correlation = Math.round((code * review) / 100)

  // Scaled by ten so the whole expression is exact integer arithmetic.
  const judgementBonus = JUDGEMENT_BONUS[position.judgement]
  const referenceBonus = REFERENCE_BONUS[position.reference]
  const raw = 1000 - 6 * review - 4 * correlation + 10 * judgementBonus + 10 * referenceBonus
  const independence = clamp(Math.round(raw / 10), 0, 100)

  const required = REQUIRED_INDEPENDENCE[environment]
  const margin = independence - required

  return {
    automation,
    correlation,
    independence,
    required,
    margin,
    verdict: verdictFor(margin),
  }
}

// ─── The forecast (spec §7) ─────────────────────────────────────────────────

/**
 * The verdict, written out as a prediction. Twelve authored lines, because the
 * same verdict means different things at different stakes — a thin margin on a
 * weekend project and a thin margin under audit are the same number and not the
 * same news.
 *
 * Rules: digit-free; no overlap with `verdictAdvice`, which says the cheapest
 * axis to move rather than what happens if nothing does; `over-controlled` still
 * names its cost; and a balanced reading gets a calm line, because the frame
 * does not manufacture drama the arithmetic did not find.
 *
 * Two cells cannot be reached — nothing at Sandbox stakes is under-verified,
 * because nothing is downstream of it, and nothing under audit is
 * over-controlled once the floor is that high. Both are authored anyway: the
 * `Record` is exhaustive by type and a weight change would make them live. The
 * harness asserts that exactly those two are dead, as set equality.
 */
export const FORECASTS: Record<VerdictId, Record<Environment, string>> = {
  'under-verified': {
    hobby:
      'Only you depend on this project. If it breaks, you will see it first and nobody else is affected.',
    team: 'Things may look fine for months. Then an old, unread change causes an incident and takes longer than expected to trace.',
    regulated:
      'Unread code is likely to meet an auditor before it meets a human reviewer. When it does, the team may struggle to explain or defend it.',
  },
  thin: {
    hobby:
      'The process works while you have time to follow it. A busy week is enough for the checks to slip.',
    team: 'The process has no spare capacity. When attention shifts elsewhere, expect a near miss that looks like bad luck in hindsight.',
    regulated:
      'The paperwork suggests more coverage than the process provides. An audit is more likely to find missing evidence than faulty code.',
  },
  balanced: {
    hobby:
      'Your checks fit the stakes. This is a cheap place to learn habits that will matter on a larger project.',
    team: 'The balance fits the work today. Recheck it as automation grows, especially when the current process starts to feel slow.',
    regulated:
      'Independent review meets the needs of the work. The next risk is more likely to be an outdated requirement than an unread change.',
  },
  'over-controlled': {
    hobby:
      'A weekend project is carrying payments-platform controls. The friction may kill your interest before correctness becomes a concern.',
    team: 'The checks cost more attention than the risk warrants. Experienced engineers will probably start working around them.',
    regulated:
      'Even for audited work, these controls exceed the exposure. The extra cost shows up in time and attention.',
  },
}

/** One lookup, no branching. Total over all two hundred and sixteen states. */
export function forecastFor(metrics: Metrics, environment: Environment): string {
  return FORECASTS[metrics.verdict.id][environment]
}

// ─── Meters (spec §6.4) ─────────────────────────────────────────────────────

export const PIP_COUNT = 5

/** Ordinal, not a score. Five pips of automation against one of verification is
 *  the picture the whole app exists to draw. */
export function pips(value: number): number {
  if (value <= 0) return 0
  return Math.min(PIP_COUNT, Math.ceil(value / 20))
}

export interface Meter {
  label: string
  filled: number
  total: number
}

export function metersFor(metrics: Metrics): [Meter, Meter] {
  return [
    { label: 'Automation', filled: pips(metrics.automation), total: PIP_COUNT },
    { label: 'Verification', filled: pips(metrics.independence), total: PIP_COUNT },
  ]
}

/** One line under the pair, from the *shape* of the two meters rather than from
 *  either value. Digit-free by construction (§6.4). */
export function meterCaption(metrics: Metrics): string {
  const automation = pips(metrics.automation)
  const verification = pips(metrics.independence)
  const gap = automation - verification
  if (gap >= 3)
    return 'Machines write it, machines check it. Nobody independent is left in the loop.'
  if (gap > 0) return 'Code is being produced faster than it can be checked independently.'
  if (gap === 0)
    return 'Code production and independent checking are moving at about the same pace.'
  return 'Independent checking is running ahead of code production.'
}

// ─── Houses and resolution (spec §8.1, §8.3) ────────────────────────────────

/**
 * A house on the three-by-three: the sign it resolves to, plus the two
 * discriminators.
 *
 * One discriminator per house, chosen by what the stakes leave undetermined. At
 * Sandbox the consequence is absent, so Reference resolves the class: an
 * independent target makes the work directed, a loop-owned one makes it
 * exploratory. Above Sandbox the consequence defines the class and an
 * independent reference is a risk modifier instead. In exactly one house — the
 * lights-out corner — the consequence is not enough on its own, and Judgement
 * separates the two postures that share it (§8.3).
 */
export interface House {
  base: SignId
  /** Present on the four houses where zero stakes means a different activity. */
  sandbox?: Record<Reference, SignId>
  /** Present on the one house where an unchecked model is the last thing in the
   *  loop rather than a modifier on a class a person is still inside. */
  oracle?: SignId
}

export const HOUSES: Record<Zone, Record<Zone, House>> = {
  hand: {
    hand: { base: 'craftsman', sandbox: { independent: 'learner', loop: 'hobbyist' } },
    blended: { base: 'practitioner' },
    delegated: {
      base: 'lone-author',
      sandbox: { independent: 'candidate', loop: 'weekend-builder' },
    },
  },
  blended: {
    hand: { base: 'pair-programmer' },
    blended: { base: 'centaur' },
    delegated: { base: 'shipper' },
  },
  delegated: {
    hand: { base: 'supervisor', sandbox: { independent: 'benchmarker', loop: 'skeptic' } },
    blended: { base: 'orchestrator' },
    delegated: {
      base: 'dark-factory',
      sandbox: { independent: 'spec-runner', loop: 'vibe-coder' },
      oracle: 'believer',
    },
  },
}

/**
 * Pure, total, exhaustive: two hundred and sixteen combinations, eighteen signs,
 * no fallback.
 *
 * Order matters and the harness asserts it: the Sandbox branch is tested first,
 * so nothing at Sandbox stakes ever reaches the Judgement branch — which is why
 * The Believer is reachable at Live service and Under audit only (§8.3).
 */
export function resolveSign(position: Position, environment: Environment): Sign {
  const house = HOUSES[position.code][position.review]
  if (environment === 'hobby' && house.sandbox) return SIGNS[house.sandbox[position.reference]]
  if (house.oracle && position.judgement === 'llm') return SIGNS[house.oracle]
  return SIGNS[house.base]
}

/** Every complete state, in a fixed order. The one place the two hundred and
 *  sixteen are enumerated, so the harness and the derived tables below agree by
 *  construction rather than by convention. */
export function allStates(): CompleteState[] {
  const states: CompleteState[] = []
  for (const code of ZONE_STOPS) {
    for (const review of ZONE_STOPS) {
      for (const judgement of JUDGEMENT_STOPS) {
        for (const reference of REFERENCE_STOPS) {
          for (const environment of ENVIRONMENT_STOPS) {
            states.push({ code, review, judgement, reference, environment })
          }
        }
      }
    }
  }
  return states
}

/** What actually reaches each sign, derived from `resolveSign` over all two
 *  hundred and sixteen states. The sign catalogue prints its conditions from
 *  here, so a card can never claim reachability the resolver does not produce
 *  (§9.5). */
export interface Reachability {
  environments: Environment[]
  references: Reference[]
  judgements: Judgement[]
}

export const REACHABILITY: Record<SignId, Reachability> = (() => {
  const seen: Partial<Record<SignId, { [K in keyof Reachability]: Set<string> }>> = {}
  for (const state of allStates()) {
    const id = resolveSign(positionOf(state), state.environment).id
    const entry = (seen[id] ??= {
      environments: new Set(),
      references: new Set(),
      judgements: new Set(),
    })
    entry.environments.add(state.environment)
    entry.references.add(state.reference)
    entry.judgements.add(state.judgement)
  }
  const map = {} as Record<SignId, Reachability>
  for (const id of SIGN_ORDER) {
    const entry = seen[id]
    map[id] = {
      environments: ENVIRONMENT_STOPS.filter((v) => entry?.environments.has(v)),
      references: REFERENCE_STOPS.filter((v) => entry?.references.has(v)),
      judgements: JUDGEMENT_STOPS.filter((v) => entry?.judgements.has(v)),
    }
  }
  return map
})()

/** The eight signs that exist only at Sandbox stakes, and the Reference value
 *  that reaches each. Derived, so it cannot drift from the houses. */
export const SANDBOX_REFERENCE: Partial<Record<SignId, Reference>> = (() => {
  const map: Partial<Record<SignId, Reference>> = {}
  for (const code of ZONE_STOPS) {
    for (const review of ZONE_STOPS) {
      const { sandbox } = HOUSES[code][review]
      if (!sandbox) continue
      for (const reference of REFERENCE_STOPS) map[sandbox[reference]] = reference
    }
  }
  return map
})()

/**
 * The conditions line each catalogue card prints: house, stakes tiers, and the
 * Reference or Judgement values where one of those resolves the sign. With no
 * chart on the page this is the only place reachability is stated, so it carries
 * all of it (§9.5).
 */
export function conditionsFor(id: SignId): string[] {
  const sign = SIGNS[id]
  const reach = REACHABILITY[id]
  const lines = [
    `${traitName('code', sign.house.code)} · ${traitName('review', sign.house.review)}`,
    reach.environments.map((e) => traitName('environment', e)).join(' · '),
  ]
  if (reach.references.length < REFERENCE_STOPS.length) {
    lines.push(reach.references.map((r) => traitName('reference', r)).join(' · '))
  }
  if (reach.judgements.length < JUDGEMENT_STOPS.length) {
    lines.push(
      `Judgement: ${reach.judgements.map((j) => traitName('judgement', j)).join(' · ')}`,
    )
  }
  return lines
}

// ─── Verdict follow-up line (spec §6.4) ─────────────────────────────────────

/** Qualitative by rule, not by accident: it names the direction and the cheapest
 *  axis to move, never a point value. Citing a scale the visitor cannot see is
 *  worse than showing the score. */
export function verdictAdvice(metrics: Metrics, sign: Sign): string {
  switch (metrics.verdict.id) {
    case 'under-verified':
      return 'Verification is well behind the stakes. Start with the Verification star: add a human reviewer or a gate the authoring model cannot change.'
    case 'thin':
      return 'Your margin is thin. Moving Judgement to Codified law is usually the cheapest improvement because it changes who decides without slowing authorship.'
    case 'balanced':
      return `The balance fits the stakes. Check again when the ${sign.name.replace('The ', '').toLowerCase()} workflow starts to feel slow; that often means automation has moved ahead.`
    default:
      return 'The controls cost more attention than the risk warrants. Relax them for one low-risk class of change, or spend that review time on higher-risk work.'
  }
}

// ─── URL serialisation (spec §10.1) ─────────────────────────────────────────

/** The app is one route. */
export const HOROSCODE_PATH = '/'

/** Five params, one per star, and no sixth. `s` for standard — `r` was taken by
 *  Verification. */
export const URL_PARAMS = ['c', 'r', 'j', 's', 'e'] as const

function isZone(v: string | null | undefined): v is Zone {
  return v != null && (ZONE_STOPS as readonly string[]).includes(v)
}
function isJudgement(v: string | null | undefined): v is Judgement {
  return v != null && (JUDGEMENT_STOPS as readonly string[]).includes(v)
}
function isReference(v: string | null | undefined): v is Reference {
  return v != null && (REFERENCE_STOPS as readonly string[]).includes(v)
}
function isEnvironment(v: string | null | undefined): v is Environment {
  return v != null && (ENVIRONMENT_STOPS as readonly string[]).includes(v)
}

/**
 * Pure and synchronous — no `window`, no router. Emits only the filled stars, so
 * a partial link opens at the first empty slot and a complete one opens on the
 * reading. Exactly the five star params and no others.
 */
export function serialise(state: HoroscodeState): string {
  const q = new URLSearchParams()
  if (state.code) q.set('c', state.code)
  if (state.review) q.set('r', state.review)
  if (state.judgement) q.set('j', state.judgement)
  if (state.reference) q.set('s', state.reference)
  if (state.environment) q.set('e', state.environment)
  const query = q.toString()
  return query ? `${HOROSCODE_PATH}?${query}` : HOROSCODE_PATH
}

type ParamSource = { get(key: string): string | null }

/**
 * A pure function of the URL. It never reads storage, never merges a previous
 * session, and never falls back to a default — each star is read against
 * *empty* (§10.1). Unset means empty slot, which means the flow starts there,
 * which is why a naked path is an empty flow for everybody. Unknown params are
 * normalised away rather than passed through, and there are no legacy aliases:
 * a value outside the table is invalid rather than translated into a current
 * trait.
 */
export function parseState(source: ParamSource | null | undefined): HoroscodeState {
  if (!source) return { ...EMPTY_STATE }
  const code = source.get('c')
  const review = source.get('r')
  const judgement = source.get('j')
  const reference = source.get('s')
  const environment = source.get('e')

  return {
    code: isZone(code) ? code : null,
    review: isZone(review) ? review : null,
    judgement: isJudgement(judgement) ? judgement : null,
    reference: isReference(reference) ? reference : null,
    environment: isEnvironment(environment) ? environment : null,
  }
}

/** Parse the query portion of a serialised path. Used by the round-trip check. */
export function parseSerialised(url: string): HoroscodeState {
  const qIndex = url.indexOf('?')
  return parseState(new URLSearchParams(qIndex === -1 ? '' : url.slice(qIndex + 1)))
}

// ─── Plain-text summary (spec §10.3) ────────────────────────────────────────

/** Words only. No metric ever reaches a clipboard that never appeared on
 *  screen, and no modifier is added to the name that was not present in the
 *  reading — the reading, the share card, and this string resolve the same sign
 *  name and epithet. The forecast travels with it, because a verdict label alone
 *  is the clinical half of the reading (§7, §10.3). */
export function summariseAsText(state: CompleteState, origin: string): string {
  const sign = resolveSign(positionOf(state), state.environment)
  const metrics = computeMetrics(positionOf(state), state.environment)
  return [
    `${sign.name} — ${sign.epithet}`,
    metrics.verdict.label,
    forecastFor(metrics, state.environment),
    SLOT_ORDER.map((slot) => `${SLOTS[slot].axis}: ${traitName(slot, state[slot])}`).join(' · '),
    `${origin}${serialise(state)}`,
  ].join('\n')
}
