// One thin wrapper so the vendor is a single import (spec §12.1).
//
// Three events, no cookies, no Google Analytics, no Clarity, no Meta pixel.
// That is what lets the honesty line and the privacy page both be true without
// a paragraph of exceptions.

import { track as vercelTrack } from '@vercel/analytics'

import type { Environment, Judgement, Requirements, SignId, SlotId, VerdictId, Zone } from './horoscode'

interface PickEvent {
  slot: SlotId
  trait: string
  index: number
}

interface ResultEvent {
  sign: SignId
  verdict: VerdictId
  code: Zone
  review: Zone
  judgement: Judgement
  requirements: Requirements
  environment: Environment
  /** One-based, per session. */
  run: number
}

interface ShareEvent {
  method: 'link' | 'text'
  sign: SignId
}

interface Events {
  horoscode_pick: PickEvent
  horoscode_result: ResultEvent
  horoscode_share: ShareEvent
}

export function track<K extends keyof Events>(event: K, payload: Events[K]): void {
  vercelTrack(event, { ...payload })
}
