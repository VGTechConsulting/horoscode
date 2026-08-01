// The eighteen signs (spec §8, §14).
//
// Seventeen of the eighteen records port verbatim from the in-site version's
// `ARCHETYPES`; The Believer is authored in §8.3 of the spec and does not exist
// upstream. Upstream's `ORIGINS` are not ported — there is no second result
// taxonomy here (§15). Three mechanical changes are the only permitted edits on
// the ported copy (§14):
//
//   1. `link.href` is absolute and points at vgtc.io.
//   2. `relatedGoals` is deleted — there are no transits here (§15).
//   3. `Archetype` → `Sign`, `ARCHETYPES` → `SIGNS`, `cell` → `house`. The
//      *string ids* stay aligned with the ported records, and they are in every
//      `#sign-<id>` anchor.
//
// Data only: no React, no icons, no DOM, and the axis types arrive as type-only
// imports, so this module is loadable from a plain node script alongside
// lib/horoscode.ts (§5, §13).

import type { Environment, Zone } from '../lib/horoscode.ts'

export type SignId =
  | 'learner'
  | 'hobbyist'
  | 'craftsman'
  | 'practitioner'
  | 'candidate'
  | 'weekend-builder'
  | 'lone-author'
  | 'pair-programmer'
  | 'centaur'
  | 'shipper'
  | 'benchmarker'
  | 'skeptic'
  | 'supervisor'
  | 'orchestrator'
  | 'spec-runner'
  | 'vibe-coder'
  | 'dark-factory'
  | 'believer'

export interface Sign {
  id: SignId
  name: string
  /** A class name, not a job title — mono subtitle on the reading and the card. */
  epithet: string
  /** Plain-language description of the house. */
  tagline: string
  body: string
  /** What a day looks like. */
  signature: [string, string, string]
  strengths: [string, string]
  failureModes: [string, string]
  nextMoves: [string, string, string]
  link: { label: string; href: string }
  /** Where it sits on the three-by-three, for the sign catalogue. */
  house: { code: Zone; review: Zone }
  /** Stakes tiers this sign occupies within its house. */
  environments: Environment[]
}

export const SIGNS: Record<SignId, Sign> = {
  learner: {
    id: 'learner',
    name: 'The Learner',
    epithet: 'the long way round',
    tagline: 'Hand-written, self-reviewed, nothing at stake',
    // "every other archetype" is upstream's word, kept because §14 makes the
    // port verbatim and the vocabulary rename explicitly covers identifiers
    // rather than prose. It is the one place a visitor meets a noun the frame
    // never defines, and it is a copy decision rather than a port decision.
    body: 'Writing it all yourself on something that cannot hurt anyone. The slowest path and the only one that builds the intuition every other archetype spends down. The friction here is not waste — it is the deliverable.',
    signature: [
      'You reach for the docs before you reach for a prompt',
      'Bugs get found by reading, not by a reviewer telling you',
      'The thing you are building matters less than what building it teaches',
    ],
    strengths: [
      'Builds the mental model that lets you judge generated code later',
      'No dependency on a tool that may not exist in two years',
    ],
    failureModes: [
      'Mistaking tool avoidance for rigour',
      'Staying here past the point of return, so the first agent-heavy job is a cold start',
    ],
    nextMoves: [
      'Keep writing the first draft by hand, but start reading a model\'s critique of it afterwards — grading is a different skill from generating.',
      'Pick one finished project and rewrite it with an agent, so you have a felt comparison rather than an opinion.',
      'Set an exit condition now: a date or a project after which you start delegating authorship deliberately.',
    ],
    link: {
      label: 'From manual coding to an agentic SDLC',
      href: 'https://www.vgtc.io/insights/manual-to-agentic-sdlc',
    },
    house: { code: 'hand', review: 'hand' },
    environments: ['hobby'],
  },
  hobbyist: {
    id: 'hobbyist',
    name: 'The Hobbyist',
    epithet: 'for its own sake',
    tagline: 'hand-written, self-reviewed, no target but yours',
    body: 'You type it, you read it, and nothing was written down about what done means. The project is the point — you find out what you are building by building it, and the only reviewer is the person who wrote it. This is the most independent position on the map and the least consequential, which is exactly why it is a good place to learn things that would be expensive to learn anywhere else.',
    signature: [
      'The repo has no board, no tickets, and no definition of done',
      'You refactor things nobody asked you to refactor, because you wanted to see it clean',
      'You stop when it stops being interesting rather than when it is finished',
    ],
    strengths: [
      'The highest verification independence on the map — you wrote it, you read it, and nothing in it is unexamined',
      'A place to be wrong cheaply, which is how some lessons get learned at all',
    ],
    failureModes: [
      'Nothing here transfers automatically — the habits that work when you are the only stakeholder are the ones that break first at Live service',
      'Nothing was written down, so returning to it later means reconstructing the intent from the code, and the code is all there is',
    ],
    nextMoves: [
      'Write down what done means for the next one before you start — a paragraph is enough to find out whether you can.',
      'Let a model review something finished and read what it catches; you are not obliged to act on any of it.',
      'Keep one project deliberately unspecified. This posture is worth having on purpose rather than only by default.',
    ],
    link: {
      label: 'Individual vs corporate AI plans',
      href: 'https://www.vgtc.io/insights/individual-vs-corporate-ai-plans',
    },
    house: { code: 'hand', review: 'hand' },
    environments: ['hobby'],
  },
  craftsman: {
    id: 'craftsman',
    name: 'The Craftsman',
    epithet: 'nothing ships unread',
    tagline: 'Hand-written, human-read, real consequences',
    body: 'Hand-written and human-read in an environment that has consequences. The highest independence of any position in the matrix and the lowest throughput. Everything that ships has been understood by a person who could be asked about it.',
    signature: [
      'Every diff has a human name on both sides of it',
      'Design decisions are argued before they are typed',
      'The backlog moves at the speed of the reviewers',
    ],
    strengths: [
      'Maximum independent verification — the failure mode this whole model measures barely exists here',
      'Institutional knowledge stays in people, not in prompt history',
    ],
    failureModes: [
      'The review queue becomes the bottleneck and the team routes around it',
      'Throughput expectations rise without the verification model changing to match',
    ],
    nextMoves: [
      'Delegate authorship on one low-stakes class of change (migrations, fixtures, glue) while keeping review fully human — that is a Supervisor move and it costs you nothing in independence.',
      'Measure review latency for a fortnight. If it is the top of the cycle-time chart, the bottleneck is real and not a preference.',
      'Write down which change classes must stay hand-written, so the answer is policy rather than habit when the pressure arrives.',
    ],
    link: { label: 'AI SDLC, CI/CD & Quality Gates', href: 'https://www.vgtc.io/services/ai-sdlc' },
    house: { code: 'hand', review: 'hand' },
    environments: ['team', 'regulated'],
  },
  practitioner: {
    id: 'practitioner',
    name: 'The Practitioner',
    epithet: 'hand-made, machine-checked',
    tagline: 'Hand-written, machine-assisted review',
    body: 'Writes by hand and accepts a machine as a second pair of eyes. Keeps the authoring muscle while cutting the cost of the first review pass — and because the model did not write the code, its review is genuinely independent of the priors that produced the bug.',
    signature: [
      'The AI reviewer comments before a human does',
      'You still open the diff yourself, but you are triaging rather than reading cold',
      'Style and mechanical issues are gone before a person sees the PR',
    ],
    strengths: [
      'Real independence — a different set of priors checks the code than wrote it',
      'The first review pass costs minutes instead of a colleague\'s afternoon',
    ],
    failureModes: [
      'The AI pass becomes the only pass without anyone deciding it should',
      'Reviewers learn to trust a green check they have not calibrated',
    ],
    nextMoves: [
      'Write down which change classes still need a human read, and enforce it in CODEOWNERS rather than in culture.',
      'Sample twenty AI-approved diffs and read them properly. The hit rate tells you whether the green check has earned its trust.',
      'Move judgement from taste to Codified law — tests, gates, and policy scale past the point where a person can hold the standard.',
    ],
    link: {
      label: 'Setting up Claude Code for automated test generation',
      href: 'https://www.vgtc.io/insights/claude-code-test-generation',
    },
    house: { code: 'hand', review: 'blended' },
    environments: ['hobby', 'team', 'regulated'],
  },
  candidate: {
    id: 'candidate',
    name: 'The Candidate',
    epithet: 'unaided, then graded',
    tagline: 'Unaided practice, machine as grader',
    body: 'Interview prep, katas, deliberate practice. Writing everything unaided is the point; the model is a grader, not a collaborator. Independence is high for the same reason as the Practitioner — nothing the model checks is anything the model wrote.',
    signature: [
      'You finish the attempt before you ask anything to look at it',
      'The model grades the work after it is done, not while it is being done',
      'The same problem gets solved twice, differently',
    ],
    strengths: [
      'Fast, honest feedback on work that is genuinely your own',
      'Builds the recall that a whiteboard or a take-home actually tests',
    ],
    failureModes: [
      'Optimising for a rubric that no longer resembles the job',
      'Practising generation while the job has moved to specification and verification',
    ],
    nextMoves: [
      'Ask the grader to critique your approach, not just your solution — the design conversation is what senior loops actually test.',
      'Spend a fraction of the practice time on the inverse exercise: review agent-written code and find the planted bug.',
      'When the practice ends, change the traits. This posture is correct for learning and expensive for delivery.',
    ],
    link: {
      label: 'Coding agent evaluation matrix',
      href: 'https://www.vgtc.io/insights/coding-agent-evaluation-matrix',
    },
    house: { code: 'hand', review: 'delegated' },
    environments: ['hobby'],
  },
  'weekend-builder': {
    id: 'weekend-builder',
    name: 'The Weekend Builder',
    epithet: 'shipped by Sunday, gated by the model',
    tagline: 'hand-written, machine-checked, whatever you feel like building',
    body: 'You write the code yourself and let the AI reviewer be the gate, because it is your project and the stakes are your Saturday. The target moves as you go. It is a fast, genuinely pleasant way to work, and the reason it is fine is the stakes — the same posture at Live service is a Lone Author with a thin margin.',
    signature: [
      'You write the code and the model reads it, never the other way round',
      'Merge happens when the reviewer is happy and you are tired',
      'The scope changed twice this weekend and that was fine',
    ],
    strengths: [
      'Hand authorship keeps the mental model intact even though nobody else reads the diff',
      'Machine review catches the class of mistake a solo builder has no second pair of eyes for',
    ],
    failureModes: [
      'The model\'s approval is the only signal you get, and you will not notice the day it stops being a good one, because nothing here fails loudly',
      'The identical posture at Live service is a Lone Author on a thin margin, and it does not feel any different from the inside',
    ],
    nextMoves: [
      'Ask the reviewer what it was least sure about, so its silence stops reading as agreement.',
      'Read one diff end to end yourself now and then — a calibration check on the reviewer rather than on the code.',
      'Name what would have to be true before you would read every line again, and you will know when this posture has outgrown its stakes.',
    ],
    link: {
      label: 'VS Code and its forks: the landscape in 2026',
      href: 'https://www.vgtc.io/insights/vs-code-forks-ide-landscape-2026-h1',
    },
    house: { code: 'hand', review: 'delegated' },
    environments: ['hobby'],
  },
  'lone-author': {
    id: 'lone-author',
    name: 'The Lone Author',
    epithet: 'a team of one',
    tagline: 'Every line yours, no human reads it',
    body: 'Every line hand-written and no human reads it. Common in a team of one inside a larger org, or a senior engineer nobody feels qualified to review. The model checking the work is at least independent of the person who wrote it — which is why this sits well above the fully delegated corner.',
    signature: [
      'Pull requests are approved by a bot or merged straight to main',
      'Nobody else could name the last three things you changed',
      'Context lives in your head and in the commit log, in that order',
    ],
    strengths: [
      'No coordination cost — decisions land the day they are made',
      'The reviewer, machine as it is, does not share your blind spots',
    ],
    failureModes: [
      'No human has read this code in months and the model does not know what the business cares about',
      'A bus factor of one, in a system somebody is paying for',
    ],
    nextMoves: [
      'Find one external human reviewer — another team, a contractor, a peer in a different squad — for anything touching money or data.',
      'Encode what the business cares about as tests and policy, so the machine reviewer is checking your rules rather than generic ones.',
      'Write the runbook now, while you are still here to write it.',
    ],
    link: { label: 'AI SDLC, CI/CD & Quality Gates', href: 'https://www.vgtc.io/services/ai-sdlc' },
    house: { code: 'hand', review: 'delegated' },
    environments: ['team', 'regulated'],
  },
  'pair-programmer': {
    id: 'pair-programmer',
    name: 'The Pair Programmer',
    epithet: 'two hands, one pen',
    tagline: 'AI drafts, you edit, you review',
    body: 'AI drafts, human edits, human reviews. The most conservative way to take the productivity gain: authorship moves to the machine, verification does not move at all, and independence stays at the ceiling.',
    signature: [
      'Autocomplete finishes the thought, you decide whether it was the right thought',
      'The diff you open is one you already half-wrote',
      'You reject more suggestions than you accept and that feels fine',
    ],
    strengths: [
      'Independence stays at the maximum while the first draft gets cheaper',
      'You remain able to review the output, because you are still writing next to it',
    ],
    failureModes: [
      'Reviewing generated code at the same depth as hand-written code, and quietly halving the gain',
      'Accepting a suggestion that is locally right and globally wrong, because it reads well',
    ],
    nextMoves: [
      'Give agents a whole task rather than a line — the gain is in delegating the unit of work, not the keystroke.',
      'Differentiate review depth by change class instead of reading everything at the same speed.',
      'Add the tests and gates that let you skim safely, before you start skimming anyway.',
    ],
    link: {
      label: 'Agent workflow patterns for engineering teams',
      href: 'https://www.vgtc.io/insights/agent-workflow-patterns',
    },
    house: { code: 'blended', review: 'hand' },
    environments: ['hobby', 'team', 'regulated'],
  },
  centaur: {
    id: 'centaur',
    name: 'The Centaur',
    epithet: 'half and half, both ways',
    tagline: 'Human and machine on both sides of the loop',
    body: 'Human and machine on both sides of the loop, with a human still holding the pen on anything load-bearing. The most common serious-team position right now, and a defensible one — provided somebody can say which class of change gets which treatment.',
    signature: [
      'Some PRs are agent-authored and machine-approved, some are neither, and the split is mostly instinct',
      'The AI reviewer runs on everything; a human reads the ones that feel risky',
      'Velocity is up and nobody is entirely sure by how much',
    ],
    strengths: [
      'Genuine throughput gain with a human still in the path of the important changes',
      'Flexible — the mix moves per change without a process rewrite',
    ],
    failureModes: [
      'The split is habit rather than policy, so nobody can say which class of change gets which treatment',
      'Under deadline the human half of the loop is the half that gets dropped',
    ],
    nextMoves: [
      'Write the split down: which paths, packages, or change types always get human review. One page, in the repo.',
      'Instrument it — count how many merged diffs had no human reader last month. The number is usually a surprise.',
      'Move judgement from Peer council to Codified law on the load-bearing paths, so the standard survives the sprint that gets busy.',
    ],
    link: { label: 'AI SDLC, CI/CD & Quality Gates', href: 'https://www.vgtc.io/services/ai-sdlc' },
    house: { code: 'blended', review: 'blended' },
    environments: ['hobby', 'team', 'regulated'],
  },
  shipper: {
    id: 'shipper',
    name: 'The Shipper',
    epithet: 'merge and move',
    tagline: 'Fast iteration, machine verification',
    body: 'Fast iteration with machine verification. Works when the blast radius is small and reversibility is high — and both of those are assumptions about today, not properties of the code.',
    signature: [
      'Merge to deploy is minutes and nobody blocks it',
      'The AI reviewer is the gate, and it is usually right',
      'Rollback is the plan, and it has worked so far',
    ],
    strengths: [
      'Iteration speed that a human review queue cannot match',
      'Correct posture for reversible, low-consequence surface area',
    ],
    failureModes: [
      'The code that ships this way outlives the assumption that made it safe',
      'Reversibility quietly degrades — a schema, a payment path, an integration — and the posture does not change with it',
    ],
    nextMoves: [
      'Name the surfaces where rollback is not actually a remedy, and put a human gate on those only.',
      'Build the golden dataset and the evals that let a machine gate mean something specific rather than generic.',
      'Re-check the blast radius quarterly. This posture is safe because of a fact that changes without telling you.',
    ],
    link: {
      label: 'Golden datasets for testing AI',
      href: 'https://www.vgtc.io/insights/golden-datasets-for-ai-testing',
    },
    house: { code: 'blended', review: 'delegated' },
    environments: ['hobby', 'team', 'regulated'],
  },
  benchmarker: {
    id: 'benchmarker',
    name: 'The Benchmarker',
    epithet: 'runs agents against a known answer',
    tagline: 'agents write it, you read all of it, and the target was set in advance',
    body: 'You hand agents a task whose answer was settled before they started — a kata, a benchmark, a rubric, a spec you wrote yourself — and read everything that comes back. You are not shipping; you are finding out what these things can actually do, which requires a target they cannot influence and eyes that read every line. This is how most people who trust agents at work earned the trust.',
    signature: [
      'You run the same task through more than one agent and keep the transcripts',
      'You read the whole diff even though the answer is already known',
      'The interesting output is not the code, it is where the code went wrong',
    ],
    strengths: [
      'A target the agent cannot influence, which is the only setup where trust in the result means anything',
      'The habit transfers — this is how a team learns what to delegate before it delegates it',
    ],
    failureModes: [
      'Benchmark results are not delivery results — the task with a known answer is the task agents are best at, and the gap between that and your codebase is what you have not measured',
      'Reading every line does not scale past the experiment, so conclusions drawn here quietly assume attention you will not have later',
    ],
    nextMoves: [
      'Run the next evaluation on a task from your own codebase, where the known answer is a merged pull request.',
      'Write down the failure you expect before the run, so the result is able to contradict you.',
      'Evaluate the review as well as the code: hand the same diff to a second model and see whether it agrees.',
    ],
    link: {
      label: 'Coding agent evaluation matrix',
      href: 'https://www.vgtc.io/insights/coding-agent-evaluation-matrix',
    },
    house: { code: 'delegated', review: 'hand' },
    environments: ['hobby'],
  },
  skeptic: {
    id: 'skeptic',
    name: 'The Skeptic',
    epithet: 'read it all anyway',
    tagline: 'Agents write, you read every line anyway',
    body: 'Lets the agents write and reads every line anyway. Usually someone evaluating the tools rather than depending on them — which is exactly the right way to find out whether they can be depended on.',
    signature: [
      'The agent runs, then you read the whole thing before you believe any of it',
      'You keep a private list of what it gets wrong',
      'Nothing is riding on the answer yet',
    ],
    strengths: [
      'You are building calibrated judgement about the tool rather than an opinion about it',
      'Maximum independence — nothing ships that a human has not read',
    ],
    failureModes: [
      'Reading output at a volume no human sustains, then stopping without noticing',
      'Evaluating forever instead of deciding',
    ],
    nextMoves: [
      'Write the evaluation down: what you checked, what it got wrong, what would change your mind. Otherwise it is a vibe.',
      'Pick a change class you will stop reading in full, and the tests that replace the reading.',
      'Decide a date to graduate. Skeptic is a posture for evaluation, not a destination.',
    ],
    link: {
      label: 'Coding agent evaluation matrix',
      href: 'https://www.vgtc.io/insights/coding-agent-evaluation-matrix',
    },
    house: { code: 'delegated', review: 'hand' },
    environments: ['hobby'],
  },
  supervisor: {
    id: 'supervisor',
    name: 'The Supervisor',
    epithet: 'the human gate',
    tagline: 'Agents generate, humans verify, real stakes',
    body: 'Agents generate, humans verify, on systems that matter. The deliberate high-risk posture: the highest independence available at high automation, bought with human attention. Delegating authorship costs nothing in independence provided verification stays human — that is the substantive claim of this whole model.',
    signature: [
      'Most code is agent-written and none of it merges unread',
      'Your day is diffs, not implementation',
      'The constraint on shipping is how much a person can read, not how much can be generated',
    ],
    strengths: [
      'Ties the Craftsman for independence while running at several times the output',
      'Defensible under audit — a named human approved every change',
    ],
    failureModes: [
      'Review capacity, not generation capacity, sets the ceiling, and it does not scale with headcount',
      'Reviewer fatigue turns a real gate into a rubber stamp nobody has measured',
    ],
    nextMoves: [
      'Convert the parts of review that are mechanical into tests and policy-as-code, so human attention goes where only humans help.',
      'Track approval latency and diff size per reviewer. Fatigue shows up as approval speed before it shows up as incidents.',
      'Tier the changes: full human read for the audited paths, gated automation for the rest. Blanket review is what collapses.',
    ],
    link: {
      label: 'Compliance-Ready AI Operations',
      href: 'https://www.vgtc.io/services/compliance-ai-operations',
    },
    house: { code: 'delegated', review: 'hand' },
    environments: ['team', 'regulated'],
  },
  orchestrator: {
    id: 'orchestrator',
    name: 'The Orchestrator',
    epithet: 'fleets, not diffs',
    tagline: 'Fleets of agents, harnesses instead of diffs',
    body: 'Runs fleets of agents and spends their own time on harnesses, evals, and specs rather than diffs. The unit of work is a pipeline, not a change. Independence holds up because the verification layer is engineered rather than delegated wholesale.',
    signature: [
      'You write specs and test harnesses; the agents write the implementation',
      'A bad day is a broken eval, not a broken build',
      'You could not name every file that changed this week',
    ],
    strengths: [
      'Throughput that does not scale with headcount',
      'Verification is a system you own rather than an attention budget you spend',
    ],
    failureModes: [
      'Nobody can reconstruct why a given decision was made, because no human made it',
      'The evals measure what was easy to measure, and the gap is invisible until production finds it',
    ],
    nextMoves: [
      'Make decisions durable: have the pipeline emit the rationale, not just the diff, and keep it where a human will find it in a year.',
      'Grow the golden dataset from real incidents, so the harness gets sharper on the failures you actually have.',
      'Keep a human gate on the change classes where a wrong answer is not reversible, and name them explicitly.',
    ],
    link: {
      label: 'Agentic Systems & AI Employees',
      href: 'https://www.vgtc.io/services/agentic-systems',
    },
    house: { code: 'delegated', review: 'blended' },
    environments: ['hobby', 'team', 'regulated'],
  },
  'spec-runner': {
    id: 'spec-runner',
    name: 'The Spec Runner',
    epithet: 'wrote the spec, let it rip',
    tagline: 'a personal dark factory, at zero stakes',
    body: 'You write down what done means, point agents at it, and let the AI reviewer decide whether they got there. Nobody reads the diff. At Sandbox this is the cheapest way there has ever been to find out whether a written target is machine-checkable — and finding that out is worth more than the code it produces.',
    signature: [
      'The spec is the artefact you edit; the code is the output you skim',
      'A failed run means the spec was ambiguous, not that the agent was careless',
      'Nobody has read the diff, and that is the design rather than an oversight',
    ],
    strengths: [
      'Finds out whether a written target is machine-checkable, which is the prerequisite for every autonomous pipeline that works',
      'Costs a weekend to learn what teams usually learn in production over quarters',
    ],
    failureModes: [
      'The spec is the only oracle in the loop, so an ambiguous line becomes a silent wrong answer that nothing downstream is positioned to catch',
      'Success here reads as proof the loop works, when what made it safe was that nothing was at stake',
    ],
    nextMoves: [
      'Add a check the agent cannot satisfy by rewriting the spec — a fixture, a golden output, a property test.',
      'Re-run last week\'s spec against a fresh agent and see whether it lands in the same place.',
      'Name the failure the AI reviewer would not catch, and you have named the human gate this needs before it points at anything real.',
    ],
    link: {
      label: 'Golden datasets for testing AI',
      href: 'https://www.vgtc.io/insights/golden-datasets-for-ai-testing',
    },
    house: { code: 'delegated', review: 'delegated' },
    environments: ['hobby'],
  },
  'vibe-coder': {
    id: 'vibe-coder',
    name: 'The Vibe Coder',
    epithet: 'ship it and see',
    tagline: 'Describe it, run it, keep it if it works',
    body: 'Describe it, run it, keep it if it works. Genuinely the right answer for prototypes, demos, and things that are allowed to break — the machine closed both halves of the loop, and at these stakes that costs nothing.',
    signature: [
      'You have not opened most of the files',
      '"Does it run" is the acceptance criterion',
      'The whole thing was built in an afternoon',
    ],
    strengths: [
      'Fastest path from idea to something you can look at',
      'Correct trade at zero blast radius — verification you do not need is waste',
    ],
    failureModes: [
      'The prototype gets users',
      'The demo becomes the codebase and nobody marks the moment it happened',
    ],
    nextMoves: [
      'Decide now what happens if this gets users, and write it in the README where a future you will see it.',
      'If it is going to live, read it once end to end before that becomes impossible.',
      'Add the two tests that would catch the failure you would actually be embarrassed by.',
    ],
    link: {
      label: 'How to build an AI agent with modern frameworks',
      href: 'https://www.vgtc.io/insights/building-an-agent-modern-frameworks-mid-2026',
    },
    house: { code: 'delegated', review: 'delegated' },
    environments: ['hobby'],
  },
  'dark-factory': {
    id: 'dark-factory',
    name: 'The Dark Factory',
    epithet: 'lights-out delivery',
    tagline: 'Machines write, machines check, humans watch dashboards',
    body: 'Machines write, machines check, humans watch the dashboards. Real throughput, and the position with the least independent verification in the entire matrix — the priors that produced the bug are the priors used to look for it. When judgement sits at Own taste or The oracle, no external oracle exists at all: the single most exposed state this tool can report.',
    signature: [
      'Changes merge and deploy with no human in the path',
      'The dashboard is how you find out what shipped',
      'Nobody on the team could describe last week\'s changes without reading the log',
    ],
    strengths: [
      'The highest throughput any position on this map can produce',
      'Consistency — the pipeline applies the same standard at midnight as at noon',
    ],
    failureModes: [
      'Correlated failure: the model that wrote the bug is the model that cleared it, and it fails silently',
      'The first serious incident is also the first time anyone reads the code',
    ],
    nextMoves: [
      'Introduce one oracle the generator does not control — a different model, a property-based suite, a human gate on the audited paths.',
      'If judgement sits at Own taste or The oracle, move it to Codified law first. Rules are the only oracle that scales with agent count.',
      'Define the change classes that must never reach production unread, and enforce that in the pipeline rather than in policy documents.',
    ],
    link: {
      label: 'Compliance-Ready AI Operations',
      href: 'https://www.vgtc.io/services/compliance-ai-operations',
    },
    house: { code: 'delegated', review: 'delegated' },
    environments: ['team', 'regulated'],
  },
  // The eighteenth sign, authored in spec §8.3 — it does not exist upstream. The
  // lights-out house splits on Judgement because a Dark Factory keeps at least
  // one authority outside the model, and this one keeps none.
  believer: {
    id: 'believer',
    name: 'The Believer',
    epithet: 'takes the model at its word',
    tagline: 'Machines write it, machines check it, and the machine says it is correct',
    body: 'Agents write it, an AI reviewer clears it, and when someone asks how you know it is right, the answer is that the model said so. The Dark Factory next door keeps at least one authority outside the model — a person, a team, or a codified gate can still contradict what the machines produced. Here the final authority is the model\'s own opinion, so the thing that generated the code, the thing that reviewed it, and the thing that ruled on it all share a set of priors, and a wrong answer gets confirmed three times instead of caught once. This is the lowest independence the map can reach, and it is the only sign that gets there by trusting rather than by cutting corners — which is exactly why it is invisible from the inside.',
    signature: [
      'The answer to how do you know it works is a transcript of the model agreeing',
      'Nobody on the team can name a check the model does not also run',
      'The last time a person disagreed with the reviewer, the person was talked out of it',
    ],
    strengths: [
      'Genuinely fast, and the speed is not an illusion — nothing in this loop is waiting on a human',
      'The standard gets applied to every change, at every hour, without fatigue and without the politics of a review conversation',
    ],
    failureModes: [
      'Every oracle in the loop shares its priors with whatever wrote the code, so the mistakes it is worst at finding are the ones it is most likely to make',
      'Confidence rises while independence falls, and nothing in this posture can detect that direction of drift — the model reports the same clean result either way',
    ],
    nextMoves: [
      'Write down one standard the model does not get a vote on — a test it cannot edit, a policy file it cannot approve a change to. One is enough to start finding out what has been getting through.',
      'Take a handful of model-approved diffs and read them yourself, cold. The hit rate is the only calibration you have, and right now you do not have it.',
      'Move Judgement to Codified law before you move anything else. It costs no throughput, it is the cheapest change available here, and it is the whole difference between this sign and the Dark Factory.',
    ],
    link: {
      label: 'Golden datasets for testing AI',
      href: 'https://www.vgtc.io/insights/golden-datasets-for-ai-testing',
    },
    house: { code: 'delegated', review: 'delegated' },
    environments: ['team', 'regulated'],
  },
}

/** House by house, base class first, then the Independent-reference sign, then
 *  the Loop-owned one — so the sign catalogue reads in the same order the matrix
 *  does (§8.2). The Believer sits with its house-mate, because the two are the
 *  split. */
export const SIGN_ORDER: SignId[] = [
  'craftsman',
  'learner',
  'hobbyist',
  'practitioner',
  'lone-author',
  'candidate',
  'weekend-builder',
  'pair-programmer',
  'centaur',
  'shipper',
  'supervisor',
  'benchmarker',
  'skeptic',
  'orchestrator',
  'dark-factory',
  'believer',
  'spec-runner',
  'vibe-coder',
]
