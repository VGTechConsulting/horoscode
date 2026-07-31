// Horoscode icons (spec §8.5).
//
// Kept out of lib/horoscode.ts so the model stays pure and dependency-free and
// can be loaded from a plain node script — importing `lucide-react` there would
// drag React into scripts/verify.mjs.
//
// Rule: thirty-three line icons, `currentColor`, no fills, no colour coding, no
// emoji. The trait set and the sign set are disjoint by construction, so a slot
// never looks like a result; both maps are exhaustively keyed, so a nineteenth
// sign without an icon is a compile error rather than a blank square.

import {
  Anvil,
  Banknote,
  Binoculars,
  Blend,
  Bot,
  Church,
  Cpu,
  Eye,
  Factory,
  Feather,
  FileCog,
  FlaskConical,
  Gamepad2,
  Gavel,
  Glasses,
  GraduationCap,
  Hammer,
  Handshake,
  Network,
  PenTool,
  Puzzle,
  Radar,
  RefreshCw,
  Rocket,
  ScrollText,
  ShieldCheck,
  Sparkles,
  Sprout,
  Stamp,
  Tent,
  User,
  Users,
  Wrench,
  type LucideIcon,
} from 'lucide-react'
// Relative and type-only, so this module carries no runtime dependency on the
// model and the model carries none on lucide.
import type { Requirements, SignId, SlotId } from './horoscode.ts'

export const SIGN_ICON: Record<SignId, LucideIcon> = {
  craftsman: Anvil,
  learner: Sprout,
  hobbyist: Puzzle,
  practitioner: Wrench,
  'lone-author': Feather,
  candidate: GraduationCap,
  'weekend-builder': Tent,
  'pair-programmer': Handshake,
  centaur: Blend,
  shipper: Rocket,
  supervisor: Radar,
  benchmarker: FlaskConical,
  skeptic: Binoculars,
  orchestrator: Network,
  'dark-factory': Factory,
  // The one piece of overt horoscope iconography in the set, and it earns the
  // exception because the name has already committed to the metaphor.
  // `BadgeCheck` is the documented swap if it reads as commentary rather than as
  // a joke; it was not the default because at small sizes it is hard to tell
  // from `ShieldCheck`, the Machine-gated trait icon, which appears on the same
  // reading (§8.5).
  believer: Church,
  'spec-runner': FileCog,
  'vibe-coder': Sparkles,
}

/** Keyed slot → trait value. Values repeat across slots (`hand` is both an
 *  Authorship and a Verification value), so the slot has to be part of the key. */
export const TRAIT_ICON: Record<SlotId, Record<string, LucideIcon>> = {
  code: { hand: Hammer, blended: PenTool, delegated: Bot },
  review: { hand: Eye, blended: Glasses, delegated: ShieldCheck },
  judgement: { me: User, team: Users, process: Stamp, llm: Cpu },
  requirements: { fixed: ScrollText, flexible: RefreshCw },
  environment: { hobby: Gamepad2, team: Banknote, regulated: Gavel },
}

/** The rising badge restates the trait, so it reuses the trait's own icon. */
export const RISING_ICON: Record<Requirements, LucideIcon> = {
  fixed: ScrollText,
  flexible: RefreshCw,
}

/** Sizes (§8.5). */
export const ICON_SIZE = {
  optionMobile: 20,
  optionDesktop: 28,
  railSlot: 14,
  risingBadge: 14,
  reveal: 40,
  card: 18,
} as const
