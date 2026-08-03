#!/usr/bin/env node
// The assertion harness (spec §13).
//
// There is no test runner. This script is the test suite: it imports
// lib/horoscode.ts directly — Node ≥ 22.18 strips types on load — and asserts
// the properties the spec claims in prose. Exits non-zero on the first failure.
//
// Usage:
//   node scripts/verify.mjs          # everything except the link check
//   CI=1 node scripts/verify.mjs     # adds the outbound-link HEAD check

import { readFileSync, readdirSync } from 'node:fs'

import {
  CODE_VALUE,
  EMPTY_STATE,
  ENVIRONMENT_STOPS,
  FORECASTS,
  HOROSCODE_PATH,
  HOUSES,
  JUDGEMENT_BONUS,
  JUDGEMENT_STOPS,
  PIP_COUNT,
  REACHABILITY,
  REFERENCE_BONUS,
  REFERENCE_STOPS,
  REQUIRED_INDEPENDENCE,
  REVIEW_VALUE,
  SANDBOX_REFERENCE,
  SIGNS,
  SIGN_ORDER,
  SLOTS,
  SLOT_ORDER,
  URL_PARAMS,
  VERDICTS,
  ZONE_STOPS,
  allStates,
  computeMetrics,
  filledCount,
  firstEmptySlot,
  forecastFor,
  isComplete,
  meterCaption,
  parseSerialised,
  parseState,
  pips,
  positionOf,
  resolveSign,
  serialise,
  summariseAsText,
  traitName,
  verdictAdvice,
  verdictFor,
} from '../lib/horoscode.ts'
import { ICON_SIZE, SIGN_ICON, TRAIT_ICON } from '../lib/horoscode-icons.ts'
import { SIGN_GLYPH, glyphDataUri } from '../lib/sign-glyphs.ts'

const ROOT = new URL('../', import.meta.url)

let failures = 0
let checks = 0

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

function check(name, fn) {
  checks += 1
  try {
    fn()
    console.log(`  ok   ${name}`)
  } catch (error) {
    failures += 1
    console.error(`  FAIL ${name}\n       ${error.message}`)
  }
}

const states = allStates()
const positionKey = (p) => `${p.code}:${p.review}:${p.judgement}:${p.reference}`

// ─── Totality and arithmetic (§13) ──────────────────────────────────────────

check('All two hundred and sixteen states resolve, with integer metrics in range', () => {
  assert(states.length === 216, `expected 216 states, got ${states.length}`)
  assert(new Set(states.map((s) => `${positionKey(s)}:${s.environment}`)).size === 216, 'duplicate states')
  for (const state of states) {
    const m = computeMetrics(positionOf(state), state.environment)
    assert(Number.isInteger(m.correlation), `correlation is not an integer at ${positionKey(state)}`)
    assert(Number.isInteger(m.independence), `independence is not an integer at ${positionKey(state)}`)
    assert(Number.isInteger(m.margin), `margin is not an integer at ${positionKey(state)}`)
    assert(m.independence >= 0 && m.independence <= 100, `independence out of range at ${positionKey(state)}`)
    assert(m.automation >= 0 && m.automation <= 100, `automation out of range at ${positionKey(state)}`)
    assert(m.verdict === VERDICTS[m.verdict.id], `verdict is not the shared record at ${positionKey(state)}`)
    assert(m.required === REQUIRED_INDEPENDENCE[state.environment], 'required floor drifted')
    assert(m.margin === m.independence - m.required, 'margin is not independence minus the floor')
  }
})

check('The scaled-integer identity: the float expression rounds to the same value once', () => {
  for (const state of states) {
    const code = CODE_VALUE[state.code]
    const review = REVIEW_VALUE[state.review]
    const correlation = Math.round((code * review) / 100)
    const float =
      100 -
      0.6 * review -
      0.4 * correlation +
      JUDGEMENT_BONUS[state.judgement] +
      REFERENCE_BONUS[state.reference]
    const expected = Math.min(100, Math.max(0, Math.round(float)))
    const actual = computeMetrics(positionOf(state), state.environment).independence
    assert(actual === expected, `independence ${actual} != float-rounded ${expected} at ${positionKey(state)}`)
  }
})

check('The four bands partition the integer margin range — no gap, no overlap', () => {
  const bands = {
    'under-verified': (m) => m < -25,
    thin: (m) => m >= -25 && m < -5,
    balanced: (m) => m >= -5 && m <= 30,
    'over-controlled': (m) => m > 30,
  }
  for (let margin = -200; margin <= 200; margin += 1) {
    const matching = Object.entries(bands).filter(([, test]) => test(margin)).map(([id]) => id)
    assert(matching.length === 1, `margin ${margin} falls in ${matching.length} bands`)
    const verdict = verdictFor(margin)
    assert(verdict.id === matching[0], `verdictFor(${margin}) is ${verdict.id}, expected ${matching[0]}`)
    assert(verdict === VERDICTS[verdict.id], `verdictFor(${margin}) returned a copy`)
  }
})

check('Independence is monotone non-increasing in review, then in code, under both References', () => {
  for (const reference of REFERENCE_STOPS) {
    for (const judgement of JUDGEMENT_STOPS) {
      for (const code of ZONE_STOPS) {
        let previous = Infinity
        for (const review of ZONE_STOPS) {
          const value = computeMetrics({ code, review, judgement, reference }, 'team').independence
          assert(value <= previous, `independence rose with review at ${code}/${review}/${judgement}`)
          previous = value
        }
      }
      for (const review of ZONE_STOPS) {
        let previous = Infinity
        for (const code of ZONE_STOPS) {
          const value = computeMetrics({ code, review, judgement, reference }, 'team').independence
          assert(value <= previous, `independence rose with code at ${code}/${review}/${judgement}`)
          previous = value
        }
      }
    }
  }
})

check('Reference moves independence by the declared bonus, and moves nothing else', () => {
  // Changing `loop` to `independent` changes only independence, by
  // REFERENCE_BONUS.independent, except where the clamp applies (§13).
  const delta = REFERENCE_BONUS.independent - REFERENCE_BONUS.loop
  for (const code of ZONE_STOPS) {
    for (const review of ZONE_STOPS) {
      for (const judgement of JUDGEMENT_STOPS) {
        for (const environment of ENVIRONMENT_STOPS) {
          const loop = computeMetrics({ code, review, judgement, reference: 'loop' }, environment)
          const independent = computeMetrics(
            { code, review, judgement, reference: 'independent' },
            environment,
          )
          assert(
            loop.automation === independent.automation,
            `Reference changed automation at ${code}/${review}/${judgement}`,
          )
          assert(
            loop.correlation === independent.correlation && loop.required === independent.required,
            `Reference changed a term other than independence at ${code}/${review}/${judgement}`,
          )
          const clamped = loop.independence === 0 || independent.independence === 100
          assert(
            independent.independence - loop.independence === delta || clamped,
            `Reference moved independence by ${independent.independence - loop.independence} at ${code}/${review}/${judgement}`,
          )
          assert(
            independent.margin - loop.margin === independent.independence - loop.independence,
            `margin did not follow independence at ${code}/${review}/${judgement}`,
          )
        }
      }
    }
  }
})

check('Summoned × Machine-gated is strictly lowest at the trait centroids', () => {
  for (const reference of REFERENCE_STOPS) {
    for (const judgement of JUDGEMENT_STOPS) {
      const corner = computeMetrics(
        { code: 'delegated', review: 'delegated', judgement, reference },
        'team',
      ).independence
      for (const code of ZONE_STOPS) {
        for (const review of ZONE_STOPS) {
          if (code === 'delegated' && review === 'delegated') continue
          const other = computeMetrics({ code, review, judgement, reference }, 'team').independence
          assert(corner < other, `${code}/${review} is not above the lights-out corner`)
        }
      }
    }
  }
})

check('The minimum independence is a unique argmin over positions (§8.3)', () => {
  // Independence does not read Stakes, so this is a statement about the
  // position. Asserted as a unique argmin, not as a threshold, because a
  // threshold passes when a third position ties it.
  const byPosition = new Map()
  for (const state of states) {
    byPosition.set(positionKey(state), computeMetrics(positionOf(state), state.environment).independence)
  }
  const minimum = Math.min(...byPosition.values())
  const argmin = [...byPosition.entries()].filter(([, v]) => v === minimum).map(([k]) => k)
  assert(argmin.length === 1, `minimum independence is attained by ${argmin.length} positions: ${argmin.join(', ')}`)
  assert(
    argmin[0] === 'delegated:delegated:llm:loop',
    `the unique minimum is at ${argmin[0]}, expected delegated:delegated:llm:loop`,
  )
  // Independence never reads Stakes, and the assertion above depends on it.
  for (const key of byPosition.keys()) {
    const [code, review, judgement, reference] = key.split(':')
    const values = ENVIRONMENT_STOPS.map(
      (environment) => computeMetrics({ code, review, judgement, reference }, environment).independence,
    )
    assert(new Set(values).size === 1, `independence read Stakes at ${key}`)
  }
  // And the position it names is a Believer everywhere except Sandbox, where it
  // is the Vibe Coder.
  const position = { code: 'delegated', review: 'delegated', judgement: 'llm', reference: 'loop' }
  assert(resolveSign(position, 'hobby').id === 'vibe-coder', 'the minimum position is not the Vibe Coder at Sandbox')
  for (const environment of ['team', 'regulated']) {
    assert(resolveSign(position, environment).id === 'believer', `the minimum position is not a Believer at ${environment}`)
  }
})

check('pips is monotone non-decreasing and bounded', () => {
  let previous = 0
  for (let value = 0; value <= 100; value += 1) {
    const p = pips(value)
    assert(Number.isInteger(p) && p >= 0 && p <= PIP_COUNT, `pips(${value}) out of range`)
    assert(p >= previous, `pips fell at ${value}`)
    previous = p
  }
  assert(pips(0) === 0 && pips(-5) === 0, 'pips of nothing is not zero')
})

// ─── Signs (§13) ────────────────────────────────────────────────────────────

check('All eighteen signs are reachable, and the eight Sandbox signs only at Sandbox', () => {
  const reached = new Map()
  for (const state of states) {
    const sign = resolveSign(positionOf(state), state.environment)
    assert(SIGNS[sign.id] === sign, `resolveSign returned a copy at ${positionKey(state)}`)
    if (!reached.has(sign.id)) reached.set(sign.id, new Set())
    reached.get(sign.id).add(state.environment)
  }
  assert(reached.size === 18, `${reached.size} signs are reachable, expected eighteen`)
  assert(SIGN_ORDER.length === 18, `SIGN_ORDER has ${SIGN_ORDER.length} entries`)
  for (const id of SIGN_ORDER) assert(reached.has(id), `${id} is unreachable`)

  const sandboxOnly = SIGN_ORDER.filter((id) => id in SANDBOX_REFERENCE).sort()
  assert(sandboxOnly.length === 8, `${sandboxOnly.length} signs are Sandbox-named, expected eight`)
  for (const id of sandboxOnly) {
    const environments = [...reached.get(id)]
    assert(environments.length === 1 && environments[0] === 'hobby', `${id} is reachable at ${environments.join(', ')}`)
  }
  const believer = [...reached.get('believer')].sort()
  assert(
    JSON.stringify(believer) === JSON.stringify(['regulated', 'team']),
    `The Believer is reachable at [${believer.join(', ')}], expected above Sandbox only`,
  )
})

check('Reference changes the sign in exactly the four split houses, and only at Sandbox', () => {
  const split = new Set()
  for (const code of ZONE_STOPS) {
    for (const review of ZONE_STOPS) {
      for (const judgement of JUDGEMENT_STOPS) {
        for (const environment of ENVIRONMENT_STOPS) {
          const [independent, loop] = REFERENCE_STOPS.map(
            (reference) => resolveSign({ code, review, judgement, reference }, environment).id,
          )
          if (independent === loop) continue
          assert(environment === 'hobby', `Reference moved the sign at ${environment} in ${code}/${review}`)
          split.add(`${code}:${review}`)
        }
      }
    }
  }
  const expected = ['delegated:delegated', 'delegated:hand', 'hand:delegated', 'hand:hand']
  assert(
    JSON.stringify([...split].sort()) === JSON.stringify(expected),
    `Reference splits [${[...split].sort().join(', ')}], expected [${expected.join(', ')}]`,
  )
})

check('Judgement changes the sign in exactly one house, and only above Sandbox (§8.3)', () => {
  // Set equality, not a count: a count would pass if the split landed on the
  // wrong house.
  const split = new Set()
  for (const code of ZONE_STOPS) {
    for (const review of ZONE_STOPS) {
      for (const reference of REFERENCE_STOPS) {
        for (const environment of ENVIRONMENT_STOPS) {
          const ids = JUDGEMENT_STOPS.map(
            (judgement) => resolveSign({ code, review, judgement, reference }, environment).id,
          )
          if (new Set(ids).size === 1) continue
          assert(environment !== 'hobby', `Judgement moved the sign at Sandbox in ${code}/${review}`)
          split.add(`${code}:${review}`)
        }
      }
    }
  }
  assert(
    JSON.stringify([...split]) === JSON.stringify(['delegated:delegated']),
    `Judgement splits [${[...split].join(', ')}], expected only Summoned × Machine-gated`,
  )
  // Within it: the oracle resolves to The Believer, the other three to the Dark
  // Factory.
  for (const reference of REFERENCE_STOPS) {
    for (const environment of ['team', 'regulated']) {
      for (const judgement of JUDGEMENT_STOPS) {
        const id = resolveSign({ code: 'delegated', review: 'delegated', judgement, reference }, environment).id
        assert(
          id === (judgement === 'llm' ? 'believer' : 'dark-factory'),
          `${judgement} at ${environment} resolves to ${id}`,
        )
      }
    }
  }
})

check('Every state that reaches The Believer is under-verified, and no other sign is', () => {
  const verdictsBySign = new Map()
  for (const state of states) {
    const sign = resolveSign(positionOf(state), state.environment)
    const metrics = computeMetrics(positionOf(state), state.environment)
    if (!verdictsBySign.has(sign.id)) verdictsBySign.set(sign.id, new Set())
    verdictsBySign.get(sign.id).add(metrics.verdict.id)
  }
  const alwaysUnderVerified = [...verdictsBySign.entries()]
    .filter(([, verdicts]) => verdicts.size === 1 && verdicts.has('under-verified'))
    .map(([id]) => id)
  assert(
    JSON.stringify(alwaysUnderVerified) === JSON.stringify(['believer']),
    `signs that are always under-verified: [${alwaysUnderVerified.join(', ')}], expected only believer`,
  )
  // The arithmetic agreeing with the split: the Dark Factory next door spans
  // under-verified and thin.
  const darkFactory = [...verdictsBySign.get('dark-factory')].sort()
  assert(
    JSON.stringify(darkFactory) === JSON.stringify(['thin', 'under-verified']),
    `the Dark Factory spans [${darkFactory.join(', ')}]`,
  )
})

check('The two branches of resolveSign are ordered, not overlapping', () => {
  // Checked by construction over all two hundred and sixteen rather than by
  // reading the function: no Sandbox state reaches the Judgement branch.
  for (const state of states) {
    const house = HOUSES[state.code][state.review]
    if (state.environment !== 'hobby' || !house.sandbox) continue
    const id = resolveSign(positionOf(state), state.environment).id
    assert(
      id === house.sandbox[state.reference],
      `a Sandbox state resolved to ${id} rather than its Reference pair at ${positionKey(state)}`,
    )
    if (house.oracle) assert(id !== house.oracle, `a Sandbox state reached the Judgement branch at ${positionKey(state)}`)
  }
})

check('`environments` on every record matches what resolution actually produces', () => {
  for (const id of SIGN_ORDER) {
    const declared = [...SIGNS[id].environments].sort()
    const actual = [...REACHABILITY[id].environments].sort()
    assert(
      JSON.stringify(declared) === JSON.stringify(actual),
      `${id}: record declares [${declared.join(', ')}], resolution produces [${actual.join(', ')}]`,
    )
    assert(
      HOUSES[SIGNS[id].house.code][SIGNS[id].house.review] !== undefined,
      `${id}: house is not on the three-by-three`,
    )
  }
})

check('Margin −5 is attainable — the band edge is not decorative', () => {
  const margins = new Set(states.map((s) => computeMetrics(positionOf(s), s.environment).margin))
  assert(margins.has(-5), 'no state lands on the balanced band edge')
  assert(margins.has(-25) || margins.has(-26), 'nothing lands near the thin band edge')
})

// ─── Forecasts (§13) ────────────────────────────────────────────────────────

check('Forecasts are twelve, digit-free, and total over all two hundred and sixteen states', () => {
  const lines = Object.values(FORECASTS).flatMap((byEnvironment) => Object.values(byEnvironment))
  assert(lines.length === 12, `${lines.length} forecast lines, expected twelve`)
  assert(new Set(lines).size === 12, 'two forecast cells carry the same line')
  for (const line of lines) assert(/^\D*$/.test(line), `forecast leaked a digit: ${line}`)
  for (const state of states) {
    const metrics = computeMetrics(positionOf(state), state.environment)
    const line = forecastFor(metrics, state.environment)
    assert(
      line === FORECASTS[metrics.verdict.id][state.environment],
      `forecast lookup drifted at ${positionKey(state)}`,
    )
  }
})

check('Exactly two forecast cells are unreachable, as set equality', () => {
  const reached = new Set()
  for (const state of states) {
    const metrics = computeMetrics(positionOf(state), state.environment)
    reached.add(`${metrics.verdict.id}:${state.environment}`)
  }
  const all = Object.entries(FORECASTS).flatMap(([verdict, byEnvironment]) =>
    Object.keys(byEnvironment).map((environment) => `${verdict}:${environment}`),
  )
  const unreachable = all.filter((cell) => !reached.has(cell)).sort()
  const expected = ['over-controlled:regulated', 'under-verified:hobby']
  assert(
    JSON.stringify(unreachable) === JSON.stringify(expected),
    `unreachable cells are [${unreachable.join(', ')}], expected [${expected.join(', ')}]`,
  )
})

check('No forecast line appears verbatim inside any verdictAdvice output', () => {
  const advice = new Set()
  for (const state of states) {
    const metrics = computeMetrics(positionOf(state), state.environment)
    advice.add(verdictAdvice(metrics, resolveSign(positionOf(state), state.environment)))
  }
  for (const byEnvironment of Object.values(FORECASTS)) {
    for (const line of Object.values(byEnvironment)) {
      for (const instruction of advice) {
        assert(!instruction.includes(line), `forecast is repeated inside advice: ${line}`)
      }
    }
  }
})

// ─── Copy and contract (§13) ────────────────────────────────────────────────

check('No user-facing string contains a digit', () => {
  // `link.label` and `link.href` are exempt: published titles and slugs carry
  // years, and those are not scores.
  for (const slotId of SLOT_ORDER) {
    const slot = SLOTS[slotId]
    for (const field of [slot.axis, slot.short, slot.question, slot.helper ?? '']) {
      assert(/^\D*$/.test(field), `${slotId}: slot copy contains a digit — ${field}`)
    }
    for (const option of slot.options) {
      assert(/^\D*$/.test(option.name), `${slotId}: option name contains a digit — ${option.name}`)
      assert(/^\D*$/.test(option.line), `${slotId}: option line contains a digit — ${option.line}`)
    }
  }
  for (const verdict of Object.values(VERDICTS)) {
    assert(/^\D*$/.test(verdict.label), `verdict label contains a digit — ${verdict.label}`)
    assert(/^\D*$/.test(verdict.blurb), `verdict blurb contains a digit — ${verdict.blurb}`)
  }
  for (const state of states) {
    const metrics = computeMetrics(positionOf(state), state.environment)
    const sign = resolveSign(positionOf(state), state.environment)
    for (const line of [verdictAdvice(metrics, sign), meterCaption(metrics)]) {
      assert(/^\D*$/.test(line), `derived line leaked a digit at ${positionKey(state)}: ${line}`)
    }
    // Prose lines only — the URL line is exempt, though it happens to be
    // digit-free too now that every param value is a word.
    for (const line of summariseAsText(state, 'https://horoscode.vgtc.io').split('\n').slice(0, -1)) {
      assert(/^\D*$/.test(line), `summariseAsText leaked a digit at ${positionKey(state)}: ${line}`)
    }
  }
  const PROSE_FIELDS = ['name', 'epithet', 'tagline', 'body']
  const PROSE_LISTS = ['signature', 'strengths', 'failureModes', 'nextMoves']
  for (const id of SIGN_ORDER) {
    const sign = SIGNS[id]
    for (const field of PROSE_FIELDS) {
      assert(/^\D*$/.test(sign[field]), `${id}: ${field} contains a digit — ${sign[field]}`)
    }
    for (const field of PROSE_LISTS) {
      for (const line of sign[field]) assert(/^\D*$/.test(line), `${id}: ${field} contains a digit — ${line}`)
    }
  }
})

check('Sign records carry every authored field, at the shape the reading expects', () => {
  const EXPECTED_FIELDS = [
    'id',
    'name',
    'epithet',
    'tagline',
    'body',
    'signature',
    'strengths',
    'failureModes',
    'nextMoves',
    'link',
    'house',
    'environments',
  ].sort()
  for (const id of SIGN_ORDER) {
    const sign = SIGNS[id]
    assert(sign.id === id, `${id}: record id is ${sign.id}`)
    assert(sign.signature.length === 3, `${id}: expected three signature lines`)
    assert(sign.strengths.length === 2, `${id}: expected two strengths`)
    assert(sign.failureModes.length === 2, `${id}: expected two failure modes`)
    assert(sign.nextMoves.length === 3, `${id}: expected three next moves`)
    assert(sign.link.href.startsWith('https://www.vgtc.io/'), `${id}: link is not absolute — ${sign.link.href}`)
    assert(
      JSON.stringify(Object.keys(sign).sort()) === JSON.stringify(EXPECTED_FIELDS),
      `${id}: record fields drifted`,
    )
  }
  assert(new Set(SIGN_ORDER).size === SIGN_ORDER.length, 'SIGN_ORDER repeats an id')
  assert(
    JSON.stringify([...SIGN_ORDER].sort()) === JSON.stringify(Object.keys(SIGNS).sort()),
    'SIGN_ORDER and SIGNS disagree on the set of signs',
  )
})

check('serialise round-trips over every complete, partial, and empty state', () => {
  const partials = []
  for (const state of states) {
    for (let n = 0; n <= SLOT_ORDER.length; n += 1) {
      const partial = { ...EMPTY_STATE }
      for (const slot of SLOT_ORDER.slice(0, n)) partial[slot] = state[slot]
      partials.push(partial)
    }
  }
  for (const state of [...states, ...partials, { ...EMPTY_STATE }]) {
    const round = parseSerialised(serialise(state))
    for (const slot of SLOT_ORDER) {
      assert(round[slot] === state[slot], `${slot} did not round-trip: ${serialise(state)}`)
    }
    assert(filledCount(round) === filledCount(state), 'filled count changed across a round-trip')
    assert(firstEmptySlot(round) === firstEmptySlot(state), 'first empty slot changed across a round-trip')
    assert(isComplete(round) === isComplete(state), 'completeness changed across a round-trip')
  }
  assert(serialise({ ...EMPTY_STATE }) === HOROSCODE_PATH, 'an empty state does not serialise to the bare path')
})

check('serialise emits exactly the five star params, and parseState drops the rest', () => {
  assert(URL_PARAMS.length === 5, `URL_PARAMS has ${URL_PARAMS.length} entries, expected five`)
  const keys = new Set()
  for (const state of states) {
    const query = serialise(state).split('?')[1] ?? ''
    for (const key of new URLSearchParams(query).keys()) keys.add(key)
  }
  assert(
    JSON.stringify([...keys].sort()) === JSON.stringify([...URL_PARAMS].sort()),
    `serialise emitted [${[...keys].sort().join(', ')}]`,
  )
  // The assertion that catches a sixth param being reintroduced by a feature
  // that needs somewhere to put its state.
  const noisy = new URLSearchParams({
    c: 'delegated',
    r: 'delegated',
    j: 'llm',
    s: 'loop',
    e: 'team',
    g: 'autonomous',
    utm_source: 'newsletter',
    seen: 'believer',
  })
  const parsed = parseState(noisy)
  assert(Object.keys(parsed).length === 5, `parseState returned ${Object.keys(parsed).length} keys`)
  assert(!('goal' in parsed), 'parseState kept a goal')
  assert(serialise(parsed) === '/?c=delegated&r=delegated&j=llm&s=loop&e=team', `unknown params survived: ${serialise(parsed)}`)
  // No legacy aliases: a value outside the table is invalid rather than
  // translated into a current trait (§10.1).
  const aliased = parseState(new URLSearchParams({ c: '90', r: '10', j: 'me', s: 'fixed', e: 'hobby' }))
  assert(
    aliased.code === null && aliased.review === null && aliased.reference === null,
    'a legacy value was translated into a current trait',
  )
  // An unrecognised value is normalised away rather than trusted.
  const bogus = parseState(new URLSearchParams({ c: 'wizard', j: 'coin-flip' }))
  assert(bogus.code === null && bogus.judgement === null, 'an unknown trait value survived parsing')
})

check('Icons are exhaustive, disjoint, and thirty-three in number', () => {
  const signIcons = SIGN_ORDER.map((id) => SIGN_ICON[id])
  for (const [i, icon] of signIcons.entries()) assert(icon, `${SIGN_ORDER[i]} has no icon`)
  const traitIcons = SLOT_ORDER.flatMap((slotId) =>
    SLOTS[slotId].options.map((option) => {
      const icon = TRAIT_ICON[slotId][option.value]
      assert(icon, `${slotId}/${option.value} has no icon`)
      return icon
    }),
  )
  const signSet = new Set(signIcons)
  const traitSet = new Set(traitIcons)
  assert(signSet.size === 18, `${signSet.size} distinct sign icons, expected eighteen`)
  assert(traitSet.size === 15, `${traitSet.size} distinct trait icons, expected fifteen`)
  for (const icon of signSet) assert(!traitSet.has(icon), 'a sign icon is also a trait icon')
  assert(signSet.size + traitSet.size === 33, 'the icon set is not thirty-three')
  assert(ICON_SIZE.optionMobile === 20 && ICON_SIZE.optionDesktop === 28, 'option icon sizes drifted')
  assert(ICON_SIZE.railSlot === 14 && ICON_SIZE.reveal === 40 && ICON_SIZE.card === 18, 'icon sizes drifted')
})

check('The vendored share-card glyphs are exhaustive and distinct (§11.2)', () => {
  assert(
    JSON.stringify(Object.keys(SIGN_GLYPH).sort()) === JSON.stringify([...SIGN_ORDER].sort()),
    'SIGN_GLYPH and the eighteen signs disagree',
  )
  const markup = Object.values(SIGN_GLYPH)
  assert(new Set(markup).size === 18, 'two signs share a glyph')
  for (const [id, glyph] of Object.entries(SIGN_GLYPH)) {
    assert(/^<(path|circle|rect|line|polyline|polygon|ellipse)\s/.test(glyph), `${id}: glyph is not flat SVG markup`)
    assert(!glyph.includes('<script'), `${id}: glyph carries a script`)
  }
  for (const id of SIGN_ORDER) {
    const uri = glyphDataUri(id)
    assert(uri.startsWith('data:image/svg+xml;utf8,'), `${id}: glyph is not a data URI`)
    assert(!uri.includes('currentColor'), `${id}: a data URI cannot resolve currentColor`)
  }
})

check('The icon is one scalable file, and the manifest and the palette agree with it', () => {
  // The favicon is a static file convention, not a generated route, so nothing
  // downstream renames it the way finalize-export.mjs renames the share card.
  // What is worth asserting is the part that is easy to break silently: an icon
  // that inverts with the system the way everything else does, an opaque square
  // so it cannot land on its own colour, and a manifest that actually points at
  // it — `display: standalone` with no icons is an uninstallable manifest.
  const icon = readFileSync(new URL('app/icon.svg', ROOT), 'utf8')
  assert(icon.includes('viewBox="0 0 32 32"'), 'app/icon.svg lost its viewBox')
  assert(
    !/<svg[^>]*\s(width|height)=/.test(icon),
    'app/icon.svg pins a pixel size — it would stop being treated as scalable',
  )
  assert(icon.includes('prefers-color-scheme: dark'), 'app/icon.svg does not invert with the system')
  assert(/<rect class="bg"/.test(icon), 'app/icon.svg has no opaque ground')
  assert(!icon.includes('<script'), 'app/icon.svg carries a script')
  // Both ends of the palette, and nothing in between: the icon is the same
  // black-and-white system as §3.1, with no brand colour and no accent hue.
  const fills = [...icon.matchAll(/fill:\s*(#[0-9a-f]{3,8})/gi)].map((m) => m[1].toLowerCase())
  assert(fills.length > 0, 'app/icon.svg declares no fill')
  for (const fill of fills) {
    assert(fill === '#ffffff' || fill === '#000000', `app/icon.svg introduces a colour — ${fill}`)
  }

  const manifest = readFileSync(new URL('app/manifest.ts', ROOT), 'utf8')
  assert(manifest.includes("src: '/icon.svg'"), 'app/manifest.ts does not reference the icon')
  assert(manifest.includes("sizes: 'any'"), 'the manifest icon is not declared scalable')
  assert(manifest.includes("type: 'image/svg+xml'"), 'the manifest icon declares no media type')
})

// ─── Mechanical guards (§13) ────────────────────────────────────────────────

function sourceFiles(dirs) {
  const files = []
  const walk = (url) => {
    for (const entry of readdirSync(url, { withFileTypes: true })) {
      const child = new URL(entry.name + (entry.isDirectory() ? '/' : ''), url)
      if (entry.isDirectory()) walk(child)
      else if (/\.(ts|tsx|mjs|css)$/.test(entry.name)) files.push(child)
    }
  }
  for (const dir of dirs) walk(new URL(`${dir}/`, ROOT))
  return files
}

const shipped = sourceFiles(['app', 'components', 'lib', 'content'])
const relative = (url) => url.href.slice(ROOT.href.length)

check('No randomness anywhere in the shipped sources (§1.1)', () => {
  for (const file of shipped) {
    const source = readFileSync(file, 'utf8')
    for (const forbidden of ['Math.random', 'Date.now', 'new Date(']) {
      assert(!source.includes(forbidden), `${relative(file)} contains ${forbidden}`)
    }
  }
})

check('No second result taxonomy anywhere in the shipped sources (§15)', () => {
  // Identifiers, not prose: natural-language uses of "rises" remain valid in
  // forecast copy, which is why the needles are capitalised or suffixed.
  for (const file of shipped) {
    const source = readFileSync(file, 'utf8')
    for (const forbidden of ['Rising', 'RISINGS', 'risingFor']) {
      assert(!source.includes(forbidden), `${relative(file)} carries the identifier ${forbidden}`)
    }
  }
})

check('The reading and summariseAsText carry the same name (§13)', () => {
  // No Reference-derived modifier is composed onto the sign name on either
  // surface. One of them is JSX, so it is checked as a source: it must render
  // the resolved sign's own name and epithet and nothing beside it. The share
  // card is no longer a surface here — it is generic, and names no sign at all
  // (github-pages-deployment.spec.md §4.1).
  for (const state of states) {
    const sign = resolveSign(positionOf(state), state.environment)
    const first = summariseAsText(state, 'https://horoscode.vgtc.io').split('\n')[0]
    assert(
      first === `${sign.name} — ${sign.epithet}`,
      `summariseAsText composed something onto the name at ${positionKey(state)}: ${first}`,
    )
  }
  const surfaces = ['components/horoscode.tsx']
  const traitNames = REFERENCE_STOPS.map((value) => traitName('reference', value))
  for (const path of surfaces) {
    const source = readFileSync(new URL(path, ROOT), 'utf8')
    assert(source.includes('resolveSign('), `${path} does not resolve the sign itself`)
    assert(source.includes('sign.epithet'), `${path} does not render the resolved epithet`)
    for (const name of traitNames) {
      assert(!source.includes(name), `${path} composes the Reference trait "${name}" onto the sign`)
    }
  }
})

check('No client-side storage anywhere in the shipped sources (§10.2)', () => {
  // §10.2 is a claim the privacy page repeats, so it is worth a grep rather than
  // a convention.
  for (const file of shipped) {
    const source = readFileSync(file, 'utf8')
    for (const forbidden of ['localStorage', 'sessionStorage', 'document.cookie', 'indexedDB']) {
      assert(!source.includes(forbidden), `${relative(file)} contains ${forbidden}`)
    }
  }
})

check('Both copy actions use the canonical site URL (§10.3)', () => {
  const source = readFileSync(new URL('components/horoscode.tsx', ROOT), 'utf8')
  assert(!source.includes('window.location.origin'), 'copy actions derive their origin from the current host')
  assert(source.includes('SITE_URL + serialise(current)'), 'Copy link does not use SITE_URL')
  assert(
    source.includes('summariseAsText(current, SITE_URL)'),
    'Copy as text does not use SITE_URL',
  )
})

check('No shipped source references a removed vendor or a retired origin', () => {
  // Vercel Analytics is gone because `/_vercel/insights/*` does not exist on
  // GitHub Pages, and `horoscode.dev` is not the origin any more. Both are the
  // kind of thing that comes back one import at a time
  // (github-pages-deployment.spec.md §8.1).
  for (const file of shipped) {
    const source = readFileSync(file, 'utf8')
    for (const forbidden of ['@vercel/analytics', '/_vercel/insights', 'horoscode.dev']) {
      assert(!source.includes(forbidden), `${relative(file)} references ${forbidden}`)
    }
  }
})

check('The build is rooted at `/`, not at `/horoscode` (§1.1)', () => {
  // A basePath would make the unredirected project URL work and move the
  // custom-domain app to https://horoscode.vgtc.io/horoscode/, which is not the
  // public URL. The export config is asserted here too, since every artifact
  // check downstream assumes it.
  const config = readFileSync(new URL('next.config.mjs', ROOT), 'utf8')
  for (const forbidden of ['basePath', 'assetPrefix']) {
    assert(!config.includes(forbidden), `next.config.mjs sets ${forbidden}`)
  }
  assert(config.includes("output: 'export'"), 'next.config.mjs does not enable static export')
  assert(config.includes('trailingSlash: true'), 'next.config.mjs does not enable trailing slashes')
})

check('The app carries no booking surface, chat widget, navbar, or site footer (§2)', () => {
  for (const file of shipped) {
    const source = readFileSync(file, 'utf8')
    assert(!source.includes('data-cal-link'), `${relative(file)} carries a Cal booking trigger`)
    assert(!/cal\.com|hoverbot|intercom|drift\.com/i.test(source), `${relative(file)} loads a third-party widget`)
    assert(!/from ['"][^'"]*\/(navbar|footer)['"]/i.test(source), `${relative(file)} imports a site Navbar or Footer`)
  }
})

check('Every button declares one of the sanctioned minimum targets (§4.2)', () => {
  const SANCTIONED = ['min-h-11', 'min-h-[44px]', 'min-h-[64px]', 'min-h-[72px]', 'sm:min-h-[190px]']
  for (const file of sourceFiles(['components'])) {
    const source = readFileSync(file, 'utf8')
    for (const match of source.matchAll(/<button|role="button"/g)) {
      // The opening tag: from the match to the `>` that closes it, ignoring any
      // `>` nested inside a JSX expression.
      let depth = 0
      let end = match.index
      while (end < source.length) {
        const c = source[end]
        if (c === '{') depth += 1
        else if (c === '}') depth -= 1
        else if (c === '>' && depth === 0) break
        end += 1
      }
      const tag = source.slice(match.index, end)
      assert(
        SANCTIONED.some((utility) => tag.includes(utility)),
        `${relative(file)}: a button near offset ${match.index} declares no minimum target`,
      )
    }
  }
})

check('The five stars, their questions, and their helpers are intact (§6.1)', () => {
  assert(
    JSON.stringify([...SLOT_ORDER]) ===
      JSON.stringify(['code', 'review', 'judgement', 'reference', 'environment']),
    'the slot order moved',
  )
  const counts = { code: 3, review: 3, judgement: 4, reference: 2, environment: 3 }
  const withHelper = SLOT_ORDER.filter((id) => SLOTS[id].helper)
  for (const id of SLOT_ORDER) {
    assert(SLOTS[id].options.length === counts[id], `${id}: option count moved`)
    assert(SLOTS[id].id === id, `${id}: slot record is mis-keyed`)
    for (const option of SLOTS[id].options) {
      assert(traitName(id, option.value) === option.name, `${id}/${option.value}: traitName disagrees`)
    }
  }
  assert(
    JSON.stringify(withHelper) === JSON.stringify(['judgement', 'reference', 'environment']),
    `helpers sit on [${withHelper.join(', ')}], expected the three that get misread`,
  )
})

// ─── Outbound links, in CI only (§13) ───────────────────────────────────────

const linkCheck = process.env.CI
  ? (async () => {
      checks += 1
      const hrefs = [...new Set(SIGN_ORDER.map((id) => SIGNS[id].link.href))]
      const bad = []
      for (const href of hrefs) {
        try {
          const response = await fetch(href, { method: 'HEAD', redirect: 'follow' })
          if (!response.ok) bad.push(`${href} → ${response.status}`)
        } catch (error) {
          bad.push(`${href} → ${error.message}`)
        }
      }
      if (bad.length === 0) {
        console.log('  ok   Every outbound link in the eighteen records resolves')
      } else {
        failures += 1
        console.error(`  FAIL Outbound links\n       ${bad.join('\n       ')}`)
      }
    })()
  : Promise.resolve()

await linkCheck

console.log(`\n${checks - failures} of ${checks} checks passed.`)
if (failures > 0) process.exit(1)
