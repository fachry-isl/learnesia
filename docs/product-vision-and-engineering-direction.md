# Learnesia Product Vision and Engineering Direction

**Status:** Directional strategy  
**Audience:** Product, engineering, content, and future contributors  
**Last updated:** 2026-08-20

## 1. Purpose

This document describes the intended evolution of Learnesia from an AI-assisted
microlearning course publisher into an Indonesia-first, globally extensible,
adaptive learning platform.

It is a direction, not a frozen implementation specification. Detailed data
models, APIs, algorithms, and infrastructure choices should be recorded in
separate design documents and ADRs as each vertical slice is implemented.

## 2. Vision

Learnesia makes high-quality education accessible by helping every learner move
through knowledge according to readiness rather than age, school grade, or a
fixed course schedule.

The product combines:

- A trusted, open knowledge graph spanning school subjects and broader skills.
- A personal mastery overlay that reflects what each learner likely knows.
- Interactive learning experiences that adapt difficulty and scaffolding.
- AI-assisted content production governed by sources, rubrics, deterministic
  validation, independent evaluation, and human review.
- Procedurally generated exercise variants that reduce marginal delivery cost.

Initial market: Indonesian learners, with Bahasa Indonesia as the default and
alignment to Indonesian curricula as an optional reference lens. Long-term
architecture should support other languages, curricula, and regions without
forking the underlying knowledge model.

### Product promise

> Learn by readiness, not grade level.

Suggested Indonesian expression:

> Belajar berdasarkan kesiapan, bukan batas kelas.

AI is an enabling capability, not the main user promise. Learners should buy
into visible progress, useful feedback, engaging practice, and affordable
access—not content generation technology.

## 3. Product principles

### 3.1 Knowledge is open

School stage, age, and enrollment status must not prevent exploration. A learner
may enter any branch, inspect prerequisites, and continue despite a readiness
warning. Prerequisite locks should normally be recommendations, not hard gates.

### 3.2 Readiness beats grade level

Skills exist independently from SD, SMP, SMA, university, or professional
stages. Curriculum frameworks map onto skills as metadata. They do not own or
contain the canonical skill definitions.

### 3.3 One trusted graph, many personal paths

Learnesia should not invent a completely different ontology for every learner.
All learners share a reviewed knowledge graph. Personalization selects routes,
pace, examples, explanations, scaffolding, and difficulty over that graph.

### 3.4 Interaction beats passive consumption

Long prose followed by a quiz is insufficient. Lessons should alternate concise
explanation, demonstration, prediction, manipulation, practice, feedback, and
reflection. Learners should act every 30–90 seconds where the subject permits.

### 3.5 LLMs propose; systems verify

LLMs may draft curricula, explanations, hints, distractors, and interactive
templates. Deterministic validators, source checks, independent evaluators, and
humans decide whether content is publishable.

### 3.6 Generate templates before generating instances

Prefer one reviewed procedural exercise template capable of producing thousands
of valid variants over thousands of independent LLM calls. This reduces cost,
latency, inconsistency, and hallucination risk.

### 3.7 Explainable adaptation first

Early recommendation and mastery systems should remain inspectable. A content
reviewer or engineer must be able to explain why a skill was recommended and
why mastery changed. More complex models should earn adoption through measured
improvement.

### 3.8 Learning evidence, not engagement theater

Streaks and celebrations may support motivation, but progress must represent
real learning evidence. Avoid manipulative infinite feeds, punitive streak loss,
or points disconnected from mastery.

## 4. Product model

### 4.1 Canonical knowledge graph

The current `Course -> Module -> Lesson -> Content Block` hierarchy remains a
useful authored learning experience. It should eventually sit on top of a
reusable knowledge graph rather than being the only representation of knowledge.

Target conceptual model:

```text
Subject
  -> Domain
      -> Skill
          -> prerequisite Skill(s)
          -> Learning Objective(s)
          -> Content Item(s)
          -> Exercise Template(s)
          -> Assessment Item(s)
```

Example:

```text
Mathematics
  -> Algebra
      -> Variables
      -> Expressions
      -> Linear equations
          -> One-step equations
          -> Two-step equations
          -> Word problems
      -> Functions
```

A skill should carry intrinsic metadata such as:

- Stable identifier and title.
- Description and observable learning objectives.
- Prerequisite and related-skill edges.
- Conceptual complexity and expected effort.
- Common misconceptions.
- Supported languages and available content.
- Exercise and assessment coverage.
- Version and review state.

The graph should initially be curated. AI may suggest nodes and edges, but
canonical graph changes require validation and editorial approval.

### 4.2 Curriculum frameworks are lenses

Curriculum mappings connect external frameworks to canonical skills:

```text
Canonical skill: Linear equations
  -> Indonesian curriculum: approximately SMP grade 7
  -> Algebra foundations path
  -> Physics preparation path
  -> Data literacy path
```

Mappings should store framework, jurisdiction, version, stage, grade range,
source, and reviewer. A curriculum update changes mappings and paths without
rebuilding learner history or duplicating skills.

The UI may communicate a soft equivalence:

> Your current algebra mastery roughly overlaps with SMP grades 7–8.

It should avoid declaring that a learner *is* at a particular grade level.
Knowledge is uneven and multidimensional.

### 4.3 Learning paths

A Learning Path is an ordered or partially ordered route through skills for a
goal. Examples:

- Indonesian SMP mathematics.
- Prepare for introductory physics.
- Learn Python from zero.
- Build financial literacy.
- Explore biology without a school-stage constraint.

Paths can share skills and content. Learners may follow a path, branch away,
return later, or build a goal-based personal path.

### 4.4 Courses

Courses remain valuable as authored narratives and bounded offerings. A Course
should eventually reference the skills it teaches and assesses. It must not
become the exclusive owner of those skills.

This preserves the current domain language defined in `CONTEXT.md` while
enabling reuse across courses, curricula, and personal paths.

## 5. Personal knowledge tree

### 5.1 Shared graph plus learner state

The personal knowledge tree is a projection:

```text
Canonical knowledge graph
  + Learner Skill State
  + Current goal and preferences
  = Personal knowledge tree and recommended path
```

Do not duplicate the entire graph for every learner. Store a sparse overlay for
skills where evidence or explicit learner interest exists.

### 5.2 Learner Skill State

A learner-skill state should eventually represent:

- Estimated mastery.
- Confidence/uncertainty in that estimate.
- Retention or predicted recall.
- Last practiced time.
- Attempt and success history.
- Current challenge band.
- Hint dependence.
- Evidence of common misconceptions.
- Status such as unseen, exploring, learning, mastered, or needs review.

Illustrative shape:

```json
{
  "skill_id": "linear-equations",
  "mastery": 0.72,
  "estimate_confidence": 0.81,
  "retention": 0.64,
  "attempt_count": 18,
  "hint_dependency": 0.25,
  "challenge_band": 4,
  "status": "learning"
}
```

These values are estimates, not objective truths. Product language should avoid
false precision and judgmental labels.

### 5.3 Branch progress

Do not collapse knowledge into one global level. Display branch-level views:

```text
Mathematics
  Coverage: 41%
  Arithmetic: 87% mastery
  Algebra: 64% mastery
  Geometry: 38% mastery
  Calculus: exploring
```

Useful dimensions:

- **Coverage:** how much of the branch has been meaningfully encountered.
- **Mastery:** current evidence of independent performance.
- **Depth:** highest conceptual complexity reached.
- **Retention:** likelihood that prior learning remains recallable.
- **Curriculum equivalence:** optional approximate mapping.

A global score may support motivation, but must not drive recommendations or
replace the multidimensional profile.

### 5.4 Zone of proximal development

The recommendation engine should target activities that are challenging enough
to produce learning without creating repeated failure. An initial product target
may be a predicted independent success probability around 70–85%, subject to
experimentation by activity type and learner context.

Recommendation inputs may include:

- Prerequisite mastery.
- Current skill mastery and estimate uncertainty.
- Recent correctness, response time, and hint usage.
- Detected misconceptions.
- Retention urgency.
- Exercise difficulty dimensions.
- Curriculum or learner-goal priority.
- Repetition, fatigue, and frustration signals.
- Learner interest and explicit choice.

Possible system responses:

- Increase one difficulty dimension.
- Offer a similar variant without hints.
- Introduce a worked example.
- Revisit one weak prerequisite.
- Change representation or context.
- Schedule spaced retrieval.
- Offer two or three ready branches for learner choice.

Difficulty should be multidimensional: number size, number of steps, abstraction,
reading complexity, novelty, distractor similarity, time pressure, prerequisite
load, and available scaffolding must not be treated as one interchangeable value.

### 5.5 Updating mastery

Evidence should carry different weight:

- Correct transfer problem without help: strong positive evidence.
- Correct routine problem without help: positive evidence.
- Correct after hints: weaker positive evidence.
- Multiple-choice correctness with high guessing probability: weak evidence.
- Repeated misconception: targeted negative evidence.
- Successful delayed retrieval: strong retention evidence.

Start with documented, interpretable update rules or Bayesian Knowledge Tracing.
Evaluate Item Response Theory or more complex knowledge-tracing models only after
the platform has sufficient calibrated learner and item data.

The system should store event history so mastery can be recomputed when the model
changes. Avoid making a mutable score the only source of truth.

### 5.6 Cold start

New learners need a respectful entry process:

1. Ask learning goal, available time, language, and optional context.
2. Let the learner self-report familiarity.
3. Run a short adaptive diagnostic, with an option to skip.
4. Initialize uncertain skill estimates rather than declaring mastery.
5. Refine rapidly using early learning evidence.

Age and school grade may improve content presentation and curriculum mapping but
must not become knowledge-access gates.

## 6. Interactive learning engine

### 6.1 Structured content, first-party behavior

AI must not emit arbitrary learner-facing HTML, JavaScript, or React code.
Interactive content should use versioned, declarative JSON payloads rendered by
trusted first-party components, consistent with
`docs/design/interactive-content-blocks.md` and ADR-0001.

The current block types remain valid. Future assessed interactions may require
new block types or a broader assessment contract; they should not silently
change the current ungraded `Exercise block` semantics in `CONTEXT.md`.

Candidate interaction families:

- Numeric and algebraic input.
- Multiple choice and multiple select.
- Matching, ordering, and categorization.
- Fill-in-the-blank.
- Graph plotting and parameter exploration.
- Geometry manipulation.
- Guided step solving.
- Logic grids and rule-based puzzles.
- Sandboxed coding with public and hidden tests.
- Simulations with controlled parameters.

### 6.2 Procedural templates

Example concept:

```json
{
  "schema_version": 1,
  "type": "numeric_input",
  "prompt": "Solve {{a}}x + {{b}} = {{c}}",
  "variables": {
    "a": {"integer": [2, 9]},
    "x": {"integer": [-10, 10]},
    "b": {"integer": [-20, 20]},
    "c": "{{a * x + b}}"
  },
  "answer": "{{x}}",
  "hints": [
    "Subtract {{b}} from both sides.",
    "Divide both sides by {{a}}."
  ]
}
```

The expression language must be parsed through a restricted grammar or AST.
Never execute model-supplied strings through `eval`, unrestricted JavaScript,
shells, or equivalent mechanisms.

Each template should define:

- Learning objective and assessed skill.
- Variable domains and constraints.
- Answer derivation and acceptable forms.
- Difficulty dimensions.
- Hints and worked solution derivation.
- Misconception tags and targeted feedback.
- Accessibility and localization fields.
- Schema and content versions.

### 6.3 Template verification

Before publication:

- Generate a large deterministic sample of variants.
- Confirm every variant is solvable and has an accepted answer.
- Reject invalid domains, division by zero, ambiguity, and impossible states.
- Confirm hints and worked steps use the generated values correctly.
- Verify difficulty bounds and age-appropriate presentation.
- Confirm assessment items measure the declared skill.
- Verify a reference solver passes.
- Verify representative incorrect strategies fail or trigger intended feedback.
- Require human review for the template, not every generated instance.

For coding activities, use isolated execution, explicit resource limits, a
reference solution, public examples, hidden tests, and security controls.

### 6.4 Runtime selection

At learning time, the platform should preferably select:

1. A reviewed template matching the target skill and challenge dimensions.
2. A deterministic seed for reproducibility and debugging.
3. A generated variant that passes runtime invariants.
4. Presentation and scaffolding appropriate to learner context.

Use runtime LLM calls only where they add clear value, such as re-explaining a
concept or generating contextual hints. Correctness and scoring should remain
deterministic wherever possible.

## 7. Content production and quality system

### 7.1 Target pipeline

The existing Generation Pipeline is the foundation. Its target evolution:

```text
Curriculum or learning-goal specification
  -> Skill and prerequisite proposal
  -> Source discovery and ingestion
  -> Lesson and interactive-template generation
  -> Schema and deterministic validation
  -> Independent rubric evaluation
  -> Adversarial variant and assessment tests
  -> Human checkpoint
  -> Immutable published version
  -> Learner evidence and defect reports
  -> Revision candidate
```

### 7.2 Quality gates

Rubrics should be explicit, versioned, and domain-aware. Candidate gates:

- Learning-objective alignment.
- Prerequisite correctness and progression.
- Factual support and citation entailment.
- Mathematical or logical correctness.
- Answer uniqueness and distractor quality.
- Difficulty calibration.
- Bahasa Indonesia naturalness and terminology.
- Age/context appropriateness without age gating.
- Pedagogical scaffolding.
- Accessibility.
- Bias and safety.
- Copyright, license, and plagiarism checks.

An LLM judge is one signal, not proof. Use a different evaluation model or prompt
from the generator where practical, but assume correlated failures remain
possible. Deterministic domain checks and human review remain necessary.

### 7.3 Provenance and versioning

Every generated or revised publishable artifact should be traceable to:

- Generation Run.
- Generator model and provider.
- Prompt and schema versions.
- Input curriculum/objectives.
- Retrieved sources and snapshots where legally permitted.
- Validation results.
- Evaluator model, rubric version, and scores.
- Human decisions and revision notes.
- Published immutable content version.

Published content should not mutate invisibly. A revision creates a candidate
version; the current version remains live until the candidate passes gates.

### 7.4 Human review strategy

Human review effort should be risk-based:

- New skill, new template, or high-impact factual content: mandatory review.
- Existing approved template producing valid deterministic variants: sampled QA.
- Low evaluator confidence or gate disagreement: mandatory review.
- Repeated learner reports or suspicious telemetry: automatic review queue.

The goal is not to remove humans. It is to spend human judgment on reusable,
high-leverage artifacts.

## 8. Target engineering architecture

### 8.1 Architectural style

Prefer a modular monolith before microservices. Learnesia needs clear domain
boundaries, reliable jobs, and fast iteration more than distributed-system
complexity.

Target logical architecture:

```text
Next.js web application
  -> Go API / modular monolith
      -> Identity and access
      -> Knowledge graph and curricula
      -> Courses and content
      -> Learning paths
      -> Attempts and mastery
      -> Assessment and procedural generation
      -> Recommendations
      -> Generation orchestration and review
  -> PostgreSQL
  -> Object storage
  -> Durable job queue
  -> AI and search providers
  -> Optional isolated Python/domain workers
```

Suggested Go package boundaries:

```text
cmd/api
cmd/worker
internal/
  identity/
  knowledge/
  curriculum/
  course/
  content/
  learning/
  assessment/
  recommendation/
  generation/
  review/
  platform/
    postgres/
    queue/
    objectstore/
    ai/
```

Package APIs should follow domain capabilities rather than database tables.

### 8.2 Source of truth and events

PostgreSQL should remain the transactional source of truth. Learner attempts are
append-oriented evidence. Derived mastery and recommendation projections may be
updated asynchronously but must be rebuildable from durable events and model
versions.

Important writes requiring transaction or idempotency design:

- Recording an attempt and its scoring result.
- Updating/recomputing learner skill state.
- Publishing a content version.
- Advancing or resuming a Generation Run.
- Creating a procedural variant from a deterministic seed.

Generation and evaluation must run as durable background jobs rather than
blocking HTTP requests. Jobs need explicit states, bounded retries, idempotency
keys, cancellation, timeouts, and inspectable failure reasons.

### 8.3 API design

Separate compact catalog/read models from detailed learning payloads. Avoid
returning full nested courses and every content block in list endpoints.

Likely API surfaces:

- Knowledge graph exploration.
- Curriculum and path views.
- Course catalog and lesson delivery.
- Attempt submission and deterministic scoring.
- Personal knowledge profile.
- Next-activity recommendations with reason codes.
- Generation Run control and review checkpoints.
- Content/version administration.

Use explicit contracts, pagination, stable identifiers, authorization policies,
and optimistic concurrency/version checks for editorial writes.

### 8.4 Security and privacy

Personal knowledge data may reveal educational ability, interests, behavior, and
potentially minor-related information. Treat it as sensitive.

Required principles:

- Collect only evidence needed for learning and product operation.
- Separate authentication identity from learning analytics where practical.
- Use role-based authorization; authenticated must not imply admin.
- Provide deletion/export and clear retention rules.
- Avoid inferring disability, intelligence, or psychological diagnoses.
- Protect children through age-appropriate defaults and consent requirements.
- Never expose raw provider errors, prompts containing sensitive data, or secret
  evaluation details to public clients.
- Sandbox code execution and treat generated expressions as untrusted input.

Applicable Indonesian and expansion-market privacy requirements require formal
legal review before launch at scale.

### 8.5 Observability

Trace user-facing and generation flows through stable IDs:

- Request/session ID.
- Learner attempt ID.
- Recommendation event ID.
- Template/variant/seed IDs.
- Content version ID.
- Generation Run and job IDs.

Monitor correctness and learning quality, not only latency and errors.

## 9. Django-to-Go migration

### 9.1 Decision direction

Go is a suitable target for the main product backend: typed domain contracts,
low runtime overhead, strong concurrency, and simple deployment fit APIs,
attempt processing, recommendations, and durable workers.

A big-bang rewrite is not recommended while the product model is changing. It
would spend time reproducing CRUD and admin behavior without proving learning
value. Use a strangler migration around new domain capabilities.

Python may remain behind a language-independent worker boundary where its AI,
scientific, symbolic, or evaluation ecosystem provides material value. The
product architecture should not require Python, but also should not remove it
for ideological purity.

### 9.2 Migration sequence

1. Document existing API contracts and database invariants.
2. Stabilize identifiers, authorization rules, and content version boundaries.
3. Build compact public catalog/course reads in Go.
4. Build learner identity/profile, attempts, and mastery in Go.
5. Build deterministic assessment and procedural generation in Go.
6. Move recommendation logic and reviewable reason codes into Go.
7. Move content CRUD/versioning and review workflows after parity tests exist.
8. Move Generation Run orchestration to durable Go workers.
9. Retire Django endpoints incrementally after traffic and parity verification.
10. Retain isolated Python workers only where justified by measurable benefit.

During migration, one service must own writes for each table/domain. Django and
Go must not independently mutate the same aggregate. Use contract tests,
shadow/read comparison, and explicit cutover flags.

### 9.3 What not to migrate first

- Stable admin CRUD with no immediate learner impact.
- Every AI integration before pipeline contracts stabilize.
- Infrastructure purely to achieve microservice separation.
- Existing behavior that should be deleted rather than reproduced.

## 10. Delivery roadmap

### Phase 0: Foundation and research

- Select one narrow learning domain: recommended SMP mathematics, one grade band
  and one semester-sized scope.
- Interview learners, parents, and educators.
- Define learning metrics and baseline diagnostics.
- Formalize canonical Skill vocabulary and graph rules.
- Resolve brand/trademark/domain risk before significant marketing spend.
- Specify privacy and minor-safety requirements.

Exit evidence: validated learner problem, reviewed initial skill graph, and a
small target cohort willing to test repeatedly.

### Phase 1: One complete learning loop

- Add learner accounts and server-side progress.
- Record attempts and deterministic scoring evidence.
- Implement Skill, prerequisite, objective, and Course-to-Skill mappings.
- Implement simple interpretable mastery state.
- Deliver one end-to-end unit with concise content and existing quiz blocks.
- Show personal branch progress and a reasoned next recommendation.

Exit evidence: learners can start, practice, stop, resume on another device, and
see mastery change from real attempts.

### Phase 2: Procedural interactivity

- Define versioned interactive-template contract.
- Ship numeric input and one manipulation/matching interaction.
- Build deterministic seeds, answer derivation, and variant validation.
- Add misconception tags and targeted hints.
- Add template review and sampled variant QA.
- Place interactions throughout lessons, not only at lesson end.

Exit evidence: one reviewed template safely produces many diverse variants;
learning flow stays engaging without a per-attempt LLM call.

### Phase 3: Reliable content factory

- Make Generation Runs asynchronous and durable.
- Add content and template versioning/provenance.
- Add explicit, versioned quality rubrics.
- Combine deterministic validators, independent evaluators, and human queues.
- Add immutable publishing and rollback.
- Track generation cost and reviewer time per approved skill.

Exit evidence: team can repeatedly transform a curriculum objective into a
source-backed, interactive, reviewed skill package with known cost and quality.

### Phase 4: Adaptive path

- Add diagnostics and estimate uncertainty.
- Add prerequisite remediation, challenge adjustment, and spaced review.
- Add recommendation reason codes and learner choice.
- Calibrate exercise difficulty using real attempt data.
- Evaluate mastery model against delayed assessments, not engagement alone.

Exit evidence: adaptive path improves learning gain or retention against a fixed
path without increasing frustration or dropout.

### Phase 5: Expand domain and platform

- Extend mathematics coverage.
- Add logic or coding after sandboxed evaluation exists.
- Add physics after math prerequisite mapping is reliable.
- Add biology with stronger factual/source-review workflows.
- Add additional curriculum and language lenses.
- Complete remaining Go cutovers when domain behavior is stable.

Do not launch mathematics, biology, physics, logic, and coding simultaneously.
Each requires distinct interaction, verification, and editorial capabilities.

## 11. Initial success metrics

### Learning outcomes

- Pre-test to post-test learning gain.
- Delayed retention after 7 and 30 days.
- Transfer-problem success.
- Time and attempts to demonstrated mastery.
- Misconception resolution rate.

### Learner experience

- Exercise completion and abandonment.
- Hint usage and recovery after failure.
- Session return and weekly active learning days.
- Percentage of recommendations accepted or deliberately changed.
- Self-reported challenge: too easy, productive, too hard.

### Content quality

- Published-content defect rate.
- Invalid procedural variant rate.
- Learner report rate by skill/template/version.
- Evaluation-human disagreement rate.
- Percentage of content with sufficient provenance.

### Economics and operations

- Generation cost per approved skill package.
- Human review minutes per approved template.
- Cost per active learner and per mastery event.
- Cache/template reuse rate versus runtime LLM calls.
- Generation pipeline completion and retry rates.

Avoid optimizing only course count, generated word count, time-on-page, or raw
question volume. These can increase while learning quality declines.

## 12. Explicit non-goals for early versions

- Replacing schools, teachers, or national curricula.
- Generating unrestricted UI or executable code from LLM output.
- Fully autonomous publication without accountable review.
- A universal intelligence score or grade label for learners.
- Hard-locking knowledge by age or school stage.
- Social feeds, certificates, marketplaces, or broad creator monetization before
  the core learning loop works.
- Microservices before scaling or team boundaries require them.
- Simultaneous broad subject coverage.

## 13. Decisions to formalize later

Create focused ADRs/designs before implementation for:

- Canonical Skill graph and versioning semantics.
- Curriculum mapping/version model.
- Attempt event and mastery projection model.
- Recommendation policy and reason codes.
- Procedural expression language and sandbox.
- Assessed interactive block taxonomy.
- Content/template immutable publishing model.
- Durable job/checkpoint infrastructure.
- Identity, child safety, consent, and data retention.
- Django/Go data ownership and endpoint cutover strategy.

## 14. Near-term recommendation

Build one narrow, evidence-complete mathematics experience before broad catalog
expansion or a full backend rewrite:

1. Three connected skill branches.
2. One diagnostic entry point.
3. Server-side learner attempts and progress.
4. Personal branch mastery visualization.
5. Two procedural interactive types.
6. One explainable next-activity recommendation.
7. One reviewed content-generation workflow with provenance.
8. Measured learning gain from a small Indonesian learner cohort.

This tracer bullet tests Learnesia's actual advantage:

> Reliable transformation from curriculum and learner goals into verified,
> interactive practice that adapts to each learner and becomes cheaper through
> reusable procedural templates.

## Related documents

- [`CONTEXT.md`](../CONTEXT.md) — current canonical domain language.
- [`docs/adr/0001-hybrid-single-table-content-blocks.md`](adr/0001-hybrid-single-table-content-blocks.md)
  — current Content Block persistence decision.
- [`docs/design/interactive-content-blocks.md`](design/interactive-content-blocks.md)
  — current future-facing interactive block design.
