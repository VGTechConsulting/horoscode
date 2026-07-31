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

import { RISINGS, SIGNS, SIGN_ORDER, type Rising, type Sign, type SignId } from '../content/signs.ts'

export { RISINGS, SIGNS, SIGN_ORDER }
export type { Rising, Sign, SignId }

// ─── Axis types ─────────────────────────────────────────────────────────────

export type Zone = 'hand' | 'blended' | 'delegated'
export type Judgement = 'me' | 'team' | 'process' | 'llm'
export type Requirements = 'fixed' | 'flexible'
export type Environment = 'hobby' | 'team' | 'regulated'

export const ZONE_STOPS = ['hand', 'blended', 'delegated'] as const
export const JUDGEMENT_STOPS = ['me', 'team', 'process', 'llm'] as const
export const REQUIREMENTS_STOPS = ['fixed', 'flexible'] as const
export const ENVIRONMENT_STOPS = ['hobby', 'team', 'regulated'] as const

// ─── The five stars (spec §6.1) ─────────────────────────────────────────────

export const SLOT_ORDER = ['code', 'review', 'judgement', 'requirements', 'environment'] as const
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
    { value: 'hand', name: 'Forged', line: 'I type it. The structure and the details are mine.' },
    { value: 'blended', name: 'Assisted', line: 'I hold the pen, the model fills in around me.' },
    {
      value: 'delegated',
      name: 'Summoned',
      line: 'Agents type it. I write prompts, specs, and harnesses.',
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
      line: 'The model takes a pass, a human takes the ones that matter.',
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
    'How far the decision has been delegated away from you. Monotone in delegation, not in quality.',
  options: [
    { value: 'me', name: 'Own taste', line: 'My experience is the arbiter.' },
    {
      value: 'team',
      name: 'Peer council',
      line: 'Peers decide — review conversations, shared conventions, a senior sign-off.',
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

export const REQUIREMENTS_SLOT: Slot<Requirements> = {
  id: 'requirements',
  axis: 'Requirements',
  short: 'Spec',
  question: 'Was "done" defined before the work started?',
  helper:
    'Waterfall, fixed-bid, coursework, and katas are Specified. Agile product work and weekend projects are Emergent.',
  options: [
    {
      value: 'fixed',
      name: 'Specified',
      line: 'The target is written down first — a spec, a contract, a rubric, a test suite.',
    },
    {
      value: 'flexible',
      name: 'Emergent',
      line: 'The target moves. We iterate with stakeholders and find out what done means.',
    },
  ],
}

export const ENVIRONMENT_SLOT: Slot<Environment> = {
  id: 'environment',
  axis: 'Stakes',
  short: 'Stakes',
  question: 'What happens when it breaks?',
  helper:
    'Answer for the project, not the employer. The same person picks differently for a weekend build and for the day job.',
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
  requirements: REQUIREMENTS_SLOT,
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
  requirements: Requirements | null
  environment: Environment | null
}

export interface CompleteState extends HoroscodeState {
  code: Zone
  review: Zone
  judgement: Judgement
  requirements: Requirements
  environment: Environment
}

export const EMPTY_STATE: HoroscodeState = {
  code: null,
  review: null,
  judgement: null,
  requirements: null,
  environment: null,
}

export function isComplete(state: HoroscodeState): state is CompleteState {
  return (
    state.code !== null &&
    state.review !== null &&
    state.judgement !== null &&
    state.requirements !== null &&
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

/** Retained for one job only: iteration-one links carried numeric `c` and `r`,
 *  and the parser still accepts them (§10.1). */
export function zoneOf(value: number): Zone {
  if (value <= 33) return 'hand'
  if (value <= 66) return 'blended'
  return 'delegated'
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

/** Fixed requirements *add* an oracle; flexible ones do not *remove* one — hence
 *  `{+10, 0}` rather than `{+5, −5}` (§6.2). */
export const REQUIREMENTS_BONUS: Record<Requirements, number> = { fixed: 10, flexible: 0 }

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
    blurb:
      'Verification is a long way behind automation for the blast radius you work at. This is the state the tool exists to find.',
  },
  thin: {
    id: 'thin',
    label: 'Thin margin',
    blurb:
      'Close to the floor for your stakes. It holds while nothing goes wrong, and there is nothing left over for the week it does.',
  },
  balanced: {
    id: 'balanced',
    label: 'Balanced',
    blurb:
      'Independent verification is roughly proportional to what a failure would cost. Keep the ratio as automation rises.',
  },
  'over-controlled': {
    id: 'over-controlled',
    label: 'Over-controlled for the stakes',
    blurb:
      'More verification than the blast radius justifies. Not a compliment — you are paying an enterprise tax on something allowed to break.',
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
  requirements: Requirements
}

export function positionOf(state: CompleteState): Position {
  return {
    code: state.code,
    review: state.review,
    judgement: state.judgement,
    requirements: state.requirements,
  }
}

export function computeMetrics(position: Position, environment: Environment): Metrics {
  const code = CODE_VALUE[position.code]
  const review = REVIEW_VALUE[position.review]

  const automation = (code + review) / 2
  const correlation = Math.round((code * review) / 100)

  // Scaled by ten so the whole expression is exact integer arithmetic.
  const judgementBonus = JUDGEMENT_BONUS[position.judgement]
  const requirementsBonus = REQUIREMENTS_BONUS[position.requirements]
  const raw = 1000 - 6 * review - 4 * correlation + 10 * judgementBonus + 10 * requirementsBonus
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
      'Nothing is downstream of this, so the forecast is quiet — whatever breaks, breaks in front of you and nobody else.',
    team: 'Expect a quiet quarter and then a loud week. What ships unread does not announce itself while it is shipping; it announces itself in somebody else\'s incident channel, and by then the change that caused it is old enough to be hard to find.',
    regulated:
      'Somewhere in what ships next is a line no human read, and the auditor will read it before you do. That is the forecast; the date is the only variable, and it is not the variable you control.',
  },
  thin: {
    hobby:
      'Nothing is coming for you, but there is no slack in this either. The first week you are busy is the week this posture quietly stops being followed.',
    team: 'You are inside tolerance with nothing spare, which feels identical to being fine until something else takes the attention. Expect the near miss first — and expect it to be described afterwards as bad luck.',
    regulated:
      'The margin is thinner than the paperwork implies. Expect a finding rather than an incident, and expect it to be about evidence you cannot produce rather than code you got wrong.',
  },
  balanced: {
    hobby:
      'Aligned, and nothing at stake — the cheapest possible time to be in this position. Expect to learn something here that you will need somewhere it counts.',
    team: 'Nothing in this chart is out of place. What to watch is drift: automation rises quietly, and the day this posture starts feeling slow is the day the balance has already moved.',
    regulated:
      'Independence clears the floor for these stakes. Expect the next problem to come from outside this map — a target that went stale rather than a diff that went unread.',
  },
  'over-controlled': {
    hobby:
      'You are guarding a weekend project like a payments platform. Expect the friction to outlast the enthusiasm, and the project to end for reasons that have nothing to do with correctness.',
    team: 'There is more verification here than the blast radius justifies, and the surplus is paid in human attention. Expect the strongest engineers to notice before the process does.',
    regulated:
      'Even here the controls exceed the exposure, which is a rare reading and still not a free one — the surplus is paid in attention that the stakes did not ask for.',
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
  if (gap > 0) return 'Output is running ahead of the checking, and the gap is where surprises live.'
  if (gap === 0)
    return 'Making and checking move together. Whatever else is true, the picture is proportionate.'
  return 'More checking than making. Everything that ships has been looked at by something that did not write it.'
}

// ─── Houses and resolution (spec §8.1, §8.3) ────────────────────────────────

/**
 * A house on the three-by-three: the sign it resolves to, plus the two
 * discriminators.
 *
 * One discriminator per house, chosen by what the stakes leave undetermined.
 * Below Sandbox the consequence is missing, so Requirements resolves the class.
 * Above Sandbox the consequence defines the class and a pre-written target is a
 * risk modifier instead. In exactly one house — the lights-out corner — the
 * consequence is not enough on its own, and Judgement separates the two
 * postures that share it (§8.3).
 */
export interface House {
  base: SignId
  /** Present on the four houses where zero stakes means a different activity. */
  sandbox?: Record<Requirements, SignId>
  /** Present on the one house where an unchecked model is the last thing in the
   *  loop rather than a modifier on a class a person is still inside. */
  oracle?: SignId
}

export const HOUSES: Record<Zone, Record<Zone, House>> = {
  hand: {
    hand: { base: 'craftsman', sandbox: { fixed: 'learner', flexible: 'hobbyist' } },
    blended: { base: 'practitioner' },
    delegated: {
      base: 'lone-author',
      sandbox: { fixed: 'candidate', flexible: 'weekend-builder' },
    },
  },
  blended: {
    hand: { base: 'pair-programmer' },
    blended: { base: 'centaur' },
    delegated: { base: 'shipper' },
  },
  delegated: {
    hand: { base: 'supervisor', sandbox: { fixed: 'benchmarker', flexible: 'skeptic' } },
    blended: { base: 'orchestrator' },
    delegated: {
      base: 'dark-factory',
      sandbox: { fixed: 'spec-runner', flexible: 'vibe-coder' },
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
  if (environment === 'hobby' && house.sandbox) return SIGNS[house.sandbox[position.requirements]]
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
        for (const requirements of REQUIREMENTS_STOPS) {
          for (const environment of ENVIRONMENT_STOPS) {
            states.push({ code, review, judgement, requirements, environment })
          }
        }
      }
    }
  }
  return states
}

/** What actually reaches each sign, derived from `resolveSign` over all two
 *  hundred and sixteen states. The reference section prints its conditions from
 *  here, so a card can never claim reachability the resolver does not produce
 *  (§9.5). */
export interface Reachability {
  environments: Environment[]
  requirements: Requirements[]
  judgements: Judgement[]
}

export const REACHABILITY: Record<SignId, Reachability> = (() => {
  const seen: Partial<Record<SignId, { [K in keyof Reachability]: Set<string> }>> = {}
  for (const state of allStates()) {
    const id = resolveSign(positionOf(state), state.environment).id
    const entry = (seen[id] ??= {
      environments: new Set(),
      requirements: new Set(),
      judgements: new Set(),
    })
    entry.environments.add(state.environment)
    entry.requirements.add(state.requirements)
    entry.judgements.add(state.judgement)
  }
  const map = {} as Record<SignId, Reachability>
  for (const id of SIGN_ORDER) {
    const entry = seen[id]
    map[id] = {
      environments: ENVIRONMENT_STOPS.filter((v) => entry?.environments.has(v)),
      requirements: REQUIREMENTS_STOPS.filter((v) => entry?.requirements.has(v)),
      judgements: JUDGEMENT_STOPS.filter((v) => entry?.judgements.has(v)),
    }
  }
  return map
})()

/** The eight signs that exist only at Sandbox stakes, and the Requirements value
 *  that reaches each. Derived, so it cannot drift from the houses. */
export const SANDBOX_REQUIREMENTS: Partial<Record<SignId, Requirements>> = (() => {
  const map: Partial<Record<SignId, Requirements>> = {}
  for (const code of ZONE_STOPS) {
    for (const review of ZONE_STOPS) {
      const { sandbox } = HOUSES[code][review]
      if (!sandbox) continue
      for (const requirements of REQUIREMENTS_STOPS) map[sandbox[requirements]] = requirements
    }
  }
  return map
})()

/**
 * The conditions line each reference card prints: house, stakes tiers, and the
 * Requirements or Judgement values where one of those resolves the sign. With no
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
  if (reach.requirements.length < REQUIREMENTS_STOPS.length) {
    lines.push(reach.requirements.map((r) => traitName('requirements', r)).join(' · '))
  }
  if (reach.judgements.length < JUDGEMENT_STOPS.length) {
    lines.push(
      `Judgement: ${reach.judgements.map((j) => traitName('judgement', j)).join(' · ')}`,
    )
  }
  return lines
}

// ─── Risings (spec §8.4) ────────────────────────────────────────────────────

/**
 * The badge renders only where Requirements did *not* already name the class.
 * On a Hobbyist reading, "Emergent rising" would restate the class name in
 * smaller type, and the eight Sandbox records were written knowing their origin.
 * Risings are absent on exactly those eight, and the harness asserts it.
 */
export function risingFor(state: CompleteState): Rising | null {
  const house = HOUSES[state.code][state.review]
  return state.environment === 'hobby' && house.sandbox ? null : RISINGS[state.requirements]
}

// ─── Verdict follow-up line (spec §6.4) ─────────────────────────────────────

/** Qualitative by rule, not by accident: it names the direction and the cheapest
 *  axis to move, never a point value. Citing a scale the visitor cannot see is
 *  worse than showing the score. */
export function verdictAdvice(metrics: Metrics, sign: Sign): string {
  switch (metrics.verdict.id) {
    case 'under-verified':
      return 'Verification is behind the stakes, and it is a gap rather than a rounding error. The cheapest point of leverage is the Verification star: pulling the last set of eyes back to a human or a codified gate buys more independence than any other single change, and it buys most while authorship stays Summoned.'
    case 'thin':
      return 'You are inside tolerance with nothing spare. Moving Judgement to Codified law is usually the cheapest change available, because it changes who decides without changing how much ships.'
    case 'balanced':
      return `Independence clears the floor for these stakes. The thing to watch is drift — automation rises quietly, so re-check this when the ${sign.name.replace('The ', '').toLowerCase()} posture starts feeling slow.`
    default:
      return 'There is more verification here than the blast radius justifies, and the surplus is paid for in human attention. Spend it somewhere the blast radius warrants it, or delegate a class of change you are currently reading in full.'
  }
}

// ─── URL serialisation (spec §10.1) ─────────────────────────────────────────

/** The app is one route. Both legacy paths redirect here, single-hop, with the
 *  query string preserved — see next.config.mjs. */
export const HOROSCODE_PATH = '/'

/** Five params, one per star, and no sixth. `s` for spec — `r` was taken by
 *  Verification. */
export const URL_PARAMS = ['c', 'r', 'j', 's', 'e'] as const

function isZone(v: string | null | undefined): v is Zone {
  return v != null && (ZONE_STOPS as readonly string[]).includes(v)
}
function isJudgement(v: string | null | undefined): v is Judgement {
  return v != null && (JUDGEMENT_STOPS as readonly string[]).includes(v)
}
function isRequirements(v: string | null | undefined): v is Requirements {
  return v != null && (REQUIREMENTS_STOPS as readonly string[]).includes(v)
}
function isEnvironment(v: string | null | undefined): v is Environment {
  return v != null && (ENVIRONMENT_STOPS as readonly string[]).includes(v)
}

/** Words now, numbers during iteration one. One line keeps every link made then
 *  working, and costs nothing (§10.1). */
function parseZone(v: string | null | undefined): Zone | null {
  if (isZone(v)) return v
  if (v == null || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? zoneOf(clamp(n, 0, 100)) : null
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
  if (state.requirements) q.set('s', state.requirements)
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
 * normalised away rather than passed through.
 */
export function parseState(source: ParamSource | null | undefined): HoroscodeState {
  if (!source) return { ...EMPTY_STATE }
  const judgement = source.get('j')
  const requirements = source.get('s')
  const environment = source.get('e')

  return {
    code: parseZone(source.get('c')),
    review: parseZone(source.get('r')),
    judgement: isJudgement(judgement) ? judgement : null,
    requirements: isRequirements(requirements) ? requirements : null,
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
 *  screen. The forecast travels with it, because a verdict label alone is the
 *  clinical half of the reading (§7). */
export function summariseAsText(state: CompleteState, origin: string): string {
  const sign = resolveSign(positionOf(state), state.environment)
  const rising = RISINGS[state.requirements]
  const metrics = computeMetrics(positionOf(state), state.environment)
  return [
    `${sign.name} · ${rising.name} — ${sign.epithet}`,
    metrics.verdict.label,
    forecastFor(metrics, state.environment),
    SLOT_ORDER.map((slot) => `${SLOTS[slot].axis}: ${traitName(slot, state[slot])}`).join(' · '),
    `${origin}${serialise(state)}`,
  ].join('\n')
}
