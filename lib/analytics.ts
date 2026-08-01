// The typed boundary the interaction components call (main spec §12.1), kept
// after the Vercel Analytics vendor was removed — GitHub Pages has none of the
// runtime endpoints that client would beacon to
// (github-pages-deployment.spec.md §5.1).
//
// It is deliberately a no-op with the same public signature: no console output,
// no storage write, no request, no queue. Keeping the boundary is what stops
// eighteen call sites from growing vendor-specific conditionals, and what makes
// choosing a replacement provider a change to this file alone — separate work,
// with its own privacy review.

import type { Environment, Judgement, Reference, SignId, SlotId, VerdictId, Zone } from './horoscode'

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
  reference: Reference
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
  // Deliberately discarded, not forwarded. See the note above.
  void event
  void payload
}
