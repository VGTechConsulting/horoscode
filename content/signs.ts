// The canonical content for all eighteen signs (spec §8, §14). Public links are
// absolute, record ids align with each `#sign-<id>` anchor, and the schema uses
// the product vocabulary throughout.
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
    // "Every other archetype" is deliberate user-facing copy. The code model
    // itself consistently uses Sign terminology.
    body: 'You write every line of a project that cannot hurt anyone. It is slow, but the work builds the intuition you will need when you start delegating. Learning through the friction is part of the result.',
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
      'Keep writing first drafts by hand, then read a model\'s critique. Reviewing and generating are different skills.',
      'Rewrite one finished project with an agent so you can compare the two workflows from experience.',
      'Choose a date or project when you will start delegating some authorship.',
    ],
    house: { code: 'hand', review: 'hand' },
    environments: ['hobby'],
  },
  hobbyist: {
    id: 'hobbyist',
    name: 'The Hobbyist',
    epithet: 'for its own sake',
    tagline: 'hand-written, self-reviewed, no target but yours',
    body: 'You write and review the code yourself, without a written definition of done. The project takes shape as you build it. With no other stakeholder and little at risk, you can learn lessons that would be costly on a live service.',
    signature: [
      'The repo has no board, no tickets, and no definition of done',
      'You refactor things nobody asked you to refactor, because you wanted to see it clean',
      'You stop when it stops being interesting rather than when it is finished',
    ],
    strengths: [
      'Every line gets your attention because you both write and review it',
      'Mistakes are cheap enough to become useful lessons',
    ],
    failureModes: [
      'Habits that work for a solo project fail when users or teammates start depending on it',
      'Nothing was written down, so returning to it later means reconstructing the intent from the code, and the code is all there is',
    ],
    nextMoves: [
      'Before the next project, try describing done in one paragraph.',
      'Let a model review something finished and read what it catches; you are not obliged to act on any of it.',
      'Keep one project deliberately open-ended, and be clear that you chose to work that way.',
    ],
    house: { code: 'hand', review: 'hand' },
    environments: ['hobby'],
  },
  craftsman: {
    id: 'craftsman',
    name: 'The Craftsman',
    epithet: 'nothing ships unread',
    tagline: 'Hand-written, human-read, real consequences',
    body: 'People write the code and people read every change before it ships. That gives you strong independent review at the cost of speed. Someone can explain every line in production.',
    signature: [
      'Every diff has a human name on both sides of it',
      'Design decisions are argued before they are typed',
      'The backlog moves at the speed of the reviewers',
    ],
    strengths: [
      'Strong independent review with very little risk of unread code reaching production',
      'Institutional knowledge stays in people, not in prompt history',
    ],
    failureModes: [
      'The review queue becomes the bottleneck and the team routes around it',
      'Throughput expectations rise without the verification model changing to match',
    ],
    nextMoves: [
      'Let an agent write one low-risk class of change, such as fixtures or glue code, while keeping review human.',
      'Measure review time for two weeks. If it dominates cycle time, you have found the bottleneck.',
      'Write down which change classes must stay hand-written, so the answer is policy rather than habit when the pressure arrives.',
    ],
    house: { code: 'hand', review: 'hand' },
    environments: ['team', 'regulated'],
  },
  practitioner: {
    id: 'practitioner',
    name: 'The Practitioner',
    epithet: 'hand-made, machine-checked',
    tagline: 'Hand-written, machine-assisted review',
    body: 'You write the code and use a model as a second pair of eyes. The model handles the first review pass, but it did not produce the code it is checking. That separation makes the review useful.',
    signature: [
      'The AI reviewer comments before a human does',
      'You still open the diff yourself, but you are triaging rather than reading cold',
      'Style and mechanical issues are gone before a person sees the PR',
    ],
    strengths: [
      'The reviewer has different blind spots from the person who wrote the code',
      'The first review pass costs minutes instead of a colleague\'s afternoon',
    ],
    failureModes: [
      'The AI pass becomes the only pass without anyone deciding it should',
      'Reviewers learn to trust a green check they have not calibrated',
    ],
    nextMoves: [
      'Write down which change classes still need a human read, and enforce it in CODEOWNERS rather than in culture.',
      'Sample twenty AI-approved diffs and read them properly. The hit rate tells you whether the green check has earned its trust.',
      'Turn recurring review decisions into tests, gates, or policy that the team can enforce consistently.',
    ],
    house: { code: 'hand', review: 'blended' },
    environments: ['hobby', 'team', 'regulated'],
  },
  candidate: {
    id: 'candidate',
    name: 'The Candidate',
    epithet: 'unaided, then graded',
    tagline: 'Unaided practice, machine as grader',
    body: 'This is interview prep, katas, or deliberate practice. You work unaided, then ask a model to grade the result. Because the model did not help write the answer, it can provide a useful outside view.',
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
      'Ask the grader about your approach as well as the final answer. Senior interviews often care more about the design discussion.',
      'Spend a fraction of the practice time on the inverse exercise: review agent-written code and find the planted bug.',
      'When the practice ends, change the traits. This posture is correct for learning and expensive for delivery.',
    ],
    house: { code: 'hand', review: 'delegated' },
    environments: ['hobby'],
  },
  'weekend-builder': {
    id: 'weekend-builder',
    name: 'The Weekend Builder',
    epithet: 'shipped by Sunday, gated by the model',
    tagline: 'hand-written, machine-checked, whatever you feel like building',
    body: 'You write the code and let an AI reviewer approve it. The scope changes as you go, but only your weekend is at stake. The same workflow on a live service would leave a much thinner margin.',
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
      'Read an occasional diff end to end to check whether the reviewer still deserves your trust.',
      'Name what would have to be true before you would read every line again, and you will know when this posture has outgrown its stakes.',
    ],
    house: { code: 'hand', review: 'delegated' },
    environments: ['hobby'],
  },
  'lone-author': {
    id: 'lone-author',
    name: 'The Lone Author',
    epithet: 'a team of one',
    tagline: 'Every line yours, no human reads it',
    body: 'You write every line, but no other person reviews it. This often happens to a solo engineer inside a larger company, or to a senior engineer nobody feels qualified to challenge. A machine reviewer offers some independence, but business context still lives with one person.',
    signature: [
      'Pull requests are approved by a bot or merged straight to main',
      'Nobody else could name the last three things you changed',
      'Context lives in your head and in the commit log, in that order',
    ],
    strengths: [
      'Decisions move quickly because there is no review queue',
      'The reviewer, machine as it is, does not share your blind spots',
    ],
    failureModes: [
      'No human has read this code in months and the model does not know what the business cares about',
      'A bus factor of one, in a system somebody is paying for',
    ],
    nextMoves: [
      'Find a human outside your immediate team to review changes that touch money or data.',
      'Encode what the business cares about as tests and policy, so the machine reviewer is checking your rules rather than generic ones.',
      'Write the runbook now, while you are still here to write it.',
    ],
    house: { code: 'hand', review: 'delegated' },
    environments: ['team', 'regulated'],
  },
  'pair-programmer': {
    id: 'pair-programmer',
    name: 'The Pair Programmer',
    epithet: 'two hands, one pen',
    tagline: 'AI drafts, you edit, you review',
    body: 'AI drafts, you edit, and a person reviews the result. You save time on the first draft without giving up human verification.',
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
      'Give an agent a small, complete task instead of using it only for line-by-line completion.',
      'Differentiate review depth by change class instead of reading everything at the same speed.',
      'Add the tests and gates that let you skim safely, before you start skimming anyway.',
    ],
    house: { code: 'blended', review: 'hand' },
    environments: ['hobby', 'team', 'regulated'],
  },
  centaur: {
    id: 'centaur',
    name: 'The Centaur',
    epithet: 'half and half, both ways',
    tagline: 'Human and machine on both sides of the loop',
    body: 'People and models share both writing and review. A human stays responsible for load-bearing code. This common team setup works well when everyone knows which changes require which kind of attention.',
    signature: [
      'Some PRs are agent-authored and machine-approved, some are neither, and the split is mostly instinct',
      'The AI reviewer runs on everything; a human reads the ones that feel risky',
      'Velocity is up and nobody is entirely sure by how much',
    ],
    strengths: [
      'Higher throughput while a person still reviews important changes',
      'The team can change the mix from one type of work to another',
    ],
    failureModes: [
      'Habit decides which changes get human attention because the team never wrote down the rule',
      'Human review disappears first when a deadline gets tight',
    ],
    nextMoves: [
      'Write the split down: which paths, packages, or change types always get human review. One page, in the repo.',
      'Count how many diffs merged without a human reader last month. Compare the result with what the team expected.',
      'Move judgement from Peer council to Codified law on the load-bearing paths, so the standard survives the sprint that gets busy.',
    ],
    house: { code: 'blended', review: 'blended' },
    environments: ['hobby', 'team', 'regulated'],
  },
  shipper: {
    id: 'shipper',
    name: 'The Shipper',
    epithet: 'merge and move',
    tagline: 'Fast iteration, machine verification',
    body: 'You iterate quickly and let machines handle verification. That works while failures stay small and changes remain easy to reverse. Both conditions need regular checking.',
    signature: [
      'Merge to deploy is minutes and nobody blocks it',
      'The AI reviewer is the gate, and it is usually right',
      'Rollback is the plan, and it has worked so far',
    ],
    strengths: [
      'Iteration speed that a human review queue cannot match',
      'A good fit for low-risk changes that are easy to reverse',
    ],
    failureModes: [
      'The code that ships this way outlives the assumption that made it safe',
      'A schema, payment path, or integration becomes hard to reverse without triggering a review change',
    ],
    nextMoves: [
      'Name the surfaces where rollback is not actually a remedy, and put a human gate on those only.',
      'Build a reference dataset and evals so the machine gate checks requirements specific to your product.',
      'Review the blast radius each quarter. The assumptions that make this workflow safe can change.',
    ],
    house: { code: 'blended', review: 'delegated' },
    environments: ['hobby', 'team', 'regulated'],
  },
  benchmarker: {
    id: 'benchmarker',
    name: 'The Benchmarker',
    epithet: 'runs agents against a known answer',
    tagline: 'agents write it, you read all of it, and the target was set in advance',
    body: 'You give agents a task with a known answer, such as a kata, benchmark, rubric, or written spec, then read everything they return. The goal is to learn what the tools can do before you depend on them. A fixed target and a full human review make that test meaningful.',
    signature: [
      'You run the same task through more than one agent and keep the transcripts',
      'You read the whole diff even though the answer is already known',
      'The interesting output is not the code, it is where the code went wrong',
    ],
    strengths: [
      'A fixed target makes the result a meaningful test of the agent',
      'The team learns what to delegate before using agents on delivery work',
    ],
    failureModes: [
      'A good benchmark result is mistaken for proof that the agent will handle an unfamiliar codebase',
      'The experiment assumes a level of human attention that will not scale to delivery work',
    ],
    nextMoves: [
      'Run the next evaluation on a task from your own codebase, where the known answer is a merged pull request.',
      'Write down the failure you expect before the run, so the result is able to contradict you.',
      'Evaluate the review as well as the code: hand the same diff to a second model and see whether it agrees.',
    ],
    house: { code: 'delegated', review: 'hand' },
    environments: ['hobby'],
  },
  skeptic: {
    id: 'skeptic',
    name: 'The Skeptic',
    epithet: 'read it all anyway',
    tagline: 'Agents write, you read every line anyway',
    body: 'Agents write the code, but you still read every line. You are testing the tools before relying on them, and building an evidence-based view of where they help and fail.',
    signature: [
      'The agent runs, then you read the whole thing before you believe any of it',
      'You keep a private list of what it gets wrong',
      'Nothing is riding on the answer yet',
    ],
    strengths: [
      'You are building an evidence-based view of the tool',
      'A person reads all the code before it ships',
    ],
    failureModes: [
      'Reading output at a volume no human sustains, then stopping without noticing',
      'Evaluating forever instead of deciding',
    ],
    nextMoves: [
      'Write the evaluation down: what you checked, what it got wrong, what would change your mind. Otherwise it is a vibe.',
      'Pick a change class you will stop reading in full, and the tests that replace the reading.',
      'Set a date to decide which work, if any, you will trust the agent to handle.',
    ],
    house: { code: 'delegated', review: 'hand' },
    environments: ['hobby'],
  },
  supervisor: {
    id: 'supervisor',
    name: 'The Supervisor',
    epithet: 'the human gate',
    tagline: 'Agents generate, humans verify, real stakes',
    body: 'Agents write code for systems that matter, and people review every change. This preserves strong independent checking at high automation, but it consumes a great deal of human attention.',
    signature: [
      'Most code is agent-written and none of it merges unread',
      'Your day is diffs, not implementation',
      'The constraint on shipping is how much a person can read, not how much can be generated',
    ],
    strengths: [
      'Ties the Craftsman for independence while running at several times the output',
      'A named person approved every change, which gives auditors a clear record',
    ],
    failureModes: [
      'Review capacity sets the limit even when agents can generate much more code',
      'Reviewer fatigue turns a real gate into a rubber stamp nobody has measured',
    ],
    nextMoves: [
      'Convert the parts of review that are mechanical into tests and policy-as-code, so human attention goes where only humans help.',
      'Track approval latency and diff size per reviewer. Fatigue shows up as approval speed before it shows up as incidents.',
      'Require full human review on audited paths and use automated gates elsewhere. One rule for every change will not scale.',
    ],
    house: { code: 'delegated', review: 'hand' },
    environments: ['team', 'regulated'],
  },
  orchestrator: {
    id: 'orchestrator',
    name: 'The Orchestrator',
    epithet: 'fleets, not diffs',
    tagline: 'Fleets of agents, harnesses instead of diffs',
    body: 'You run several agents and spend your time on specs, harnesses, and evals instead of individual diffs. The pipeline is the unit of work. Verification remains independent because you design and maintain it as its own system.',
    signature: [
      'You write specs and test harnesses; the agents write the implementation',
      'A bad day is a broken eval, not a broken build',
      'You could not name every file that changed this week',
    ],
    strengths: [
      'Throughput that does not scale with headcount',
      'Verification lives in a maintained system instead of depending on individual attention',
    ],
    failureModes: [
      'Nobody can reconstruct why a given decision was made, because no human made it',
      'The evals measure what was easy to measure, and the gap is invisible until production finds it',
    ],
    nextMoves: [
      'Have the pipeline record its reasoning with each diff so a person can reconstruct the decision later.',
      'Grow the golden dataset from real incidents, so the harness gets sharper on the failures you actually have.',
      'Keep a human gate on the change classes where a wrong answer is not reversible, and name them explicitly.',
    ],
    house: { code: 'delegated', review: 'blended' },
    environments: ['hobby', 'team', 'regulated'],
  },
  'spec-runner': {
    id: 'spec-runner',
    name: 'The Spec Runner',
    epithet: 'wrote the spec, let it rip',
    tagline: 'a personal dark factory, at zero stakes',
    body: 'You define “done,” hand the work to agents, and let an AI reviewer judge the result. Nobody reads the diff. In a sandbox, this is a cheap way to learn whether your written target can be checked by a machine.',
    signature: [
      'The spec is the artefact you edit; the code is the output you skim',
      'A failed run sends you back to the spec before it sends you into the code',
      'Skipping the diff is part of the experiment',
    ],
    strengths: [
      'Tests whether a written target is specific enough for an autonomous pipeline',
      'Costs a weekend to learn what teams usually learn in production over quarters',
    ],
    failureModes: [
      'An ambiguous line in the spec becomes a wrong answer with no outside check',
      'A safe sandbox result is treated as proof that the workflow is ready for live systems',
    ],
    nextMoves: [
      'Add a fixture, reference output, or property test that the agent cannot rewrite.',
      'Re-run last week\'s spec against a fresh agent and see whether it lands in the same place.',
      'Name the failure the AI reviewer would not catch, and you have named the human gate this needs before it points at anything real.',
    ],
    house: { code: 'delegated', review: 'delegated' },
    environments: ['hobby'],
  },
  'vibe-coder': {
    id: 'vibe-coder',
    name: 'The Vibe Coder',
    epithet: 'ship it and see',
    tagline: 'Describe it, run it, keep it if it works',
    body: 'Describe it, run it, and keep it if it works. For a disposable prototype or demo, that can be a sensible trade. The machine handles both writing and review, and a failure affects only you.',
    signature: [
      'You have not opened most of the files',
      '"Does it run" is the acceptance criterion',
      'The whole thing was built in an afternoon',
    ],
    strengths: [
      'Fastest path from idea to something you can look at',
      'Very little review overhead for work that is safe to discard',
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
    house: { code: 'delegated', review: 'delegated' },
    environments: ['hobby'],
  },
  'dark-factory': {
    id: 'dark-factory',
    name: 'The Dark Factory',
    epithet: 'lights-out delivery',
    tagline: 'Machines write, machines check, humans watch dashboards',
    body: 'Machines write and check the code while people watch dashboards. Throughput is high, but independent verification is low because the writer and reviewer often share the same blind spots. If the model also has the final say, there is no outside authority left in the process.',
    signature: [
      'Changes merge and deploy with no human in the path',
      'The dashboard is how you find out what shipped',
      'Nobody on the team could describe last week\'s changes without reading the log',
    ],
    strengths: [
      'The highest throughput any position on this map can produce',
      'The pipeline applies the same standard at every hour',
    ],
    failureModes: [
      'Correlated failure: the model that wrote the bug is the model that cleared it, and it fails silently',
      'The first serious incident is also the first time anyone reads the code',
    ],
    nextMoves: [
      'Add one check the generator cannot control: a different model, a property-based suite, or a human gate on audited paths.',
      'If judgement sits at Own taste or The oracle, move it to Codified law first. Rules are the only oracle that scales with agent count.',
      'Define which changes must never reach production unread, then enforce the rule in the pipeline.',
    ],
    house: { code: 'delegated', review: 'delegated' },
    environments: ['team', 'regulated'],
  },
  // The lights-out house splits on Judgement as specified in §8.3: a Dark
  // Factory keeps at least one authority outside the model, while this sign
  // keeps none.
  believer: {
    id: 'believer',
    name: 'The Believer',
    epithet: 'takes the model at its word',
    tagline: 'Machines write it, machines check it, and the machine says it is correct',
    body: 'Agents write the code, an AI reviewer approves it, and the model has the final say. Unlike a Dark Factory, no person, team, or fixed gate can overrule the system. The writer, reviewer, and judge share similar blind spots, so one bad answer can be approved three times. This is the least independent position on the map, and it can look perfectly healthy from inside the loop.',
    signature: [
      'The answer to how do you know it works is a transcript of the model agreeing',
      'Nobody on the team can name a check the model does not also run',
      'The last time a person disagreed with the reviewer, the person was talked out of it',
    ],
    strengths: [
      'The workflow is fast because it never waits for a person',
      'Every change receives the same automated check without fatigue or review politics',
    ],
    failureModes: [
      'The writer and every checker share blind spots, making some mistakes hard for the whole system to see',
      'Confidence grows even as independent checking falls, and the model continues to report a clean result',
    ],
    nextMoves: [
      'Create one standard the model cannot edit or approve, such as a protected test or policy file.',
      'Read a sample of model-approved diffs without seeing the review first. Record what the model missed.',
      'Move Judgement to Codified law first. It preserves throughput while adding an authority outside the model.',
    ],
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
