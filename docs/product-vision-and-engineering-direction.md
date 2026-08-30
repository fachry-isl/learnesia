# Learnesia Product Vision and Engineering Direction

**Status:** Directional strategy, plus the current architecture of record
**Audience:** Product, engineering, content, and future contributors
**Last updated:** 2026-08-30
**Absorbs:** [#29 — PRD: Content Architecture v2](https://github.com/fachry-isl/learnesia/issues/29)

## 1. Purpose

This document describes the intended evolution of Learnesia from an AI-assisted
microlearning course publisher into an Indonesia-first, globally extensible,
adaptive learning platform.

It now serves two roles:

- **Sections 5–6** record the *architecture of record* — what Learnesia is being
  built as today, merged in from PRD #29 (Content Architecture v2). This part is
  binding on current implementation work.
- **Sections 7–13** remain *direction, not specification*. Detailed data models,
  APIs, algorithms, and infrastructure choices should be recorded in separate
  design documents and ADRs as each vertical slice is implemented.

Domain vocabulary is canonical in [`CONTEXT.md`](../CONTEXT.md). Where this
document and `CONTEXT.md` disagree on a term, `CONTEXT.md` wins.

## 2. What changed in this revision

Previously the vision document and PRD #29 were separate and partly
contradictory: the vision described a knowledge-graph platform whose first
delivery phase was a learner loop, while #29 described — and the team was
actually building — a block-based content model and a multi-agent generation
pipeline. This revision merges them.

Substantive changes:

1. **Content Architecture v2 is now recorded as the architecture of record**
   (new section 5), not as a parallel proposal. The `Course → Module → Lesson →
   Content Block` hierarchy, the Content Block registry, the Reference/Citation
   system, the Generation Pipeline, the two LLM seams, and the Resource Provider
   interface are all folded in from #29.
2. **The old vision text assumed a flat authored-course model.** Section 6
   (formerly section 4) now positions the canonical knowledge graph as a layer
   *above* the shipped v2 hierarchy rather than a replacement for an unspecified
   one, and states explicitly that Courses reference Skills rather than owning
   them.
3. **The roadmap is annotated with real delivery status** (section 12). The
   honest position: work jumped ahead to the content factory (original Phase 3)
   before the learner loop (original Phase 1) exists. The phases are not
   renumbered — the original sequencing argument still holds and is now recorded
   as an explicit risk with a gate, rather than silently violated.
4. **#29's out-of-scope list is merged into the non-goals** (section 14), so
   there is one place that says what Learnesia is deliberately not building.
5. **#29's testing decisions are merged into the quality system** (section 9.5).
6. **The near-term recommendation is revised** (section 16): finish the #29
   slices already in flight, then gate catalog expansion behind a working
   learner loop, rather than starting a new narrow-domain build from zero.
7. Related documents now include #29 and its child issues.

No product principle was weakened or removed. The knowledge-graph, mastery, and
Go-migration direction is unchanged; it is now sequenced against work that
actually exists.

## 3. Vision

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

The AI's role is specifically **curation and orchestration**: it finds the best
existing free resources, structures them into a coherent learning path, and
generates supporting content around them in the learner's native language. It is
not primarily a content author competing with the open web.

## 4. Product principles

### 4.1 Knowledge is open

School stage, age, and enrollment status must not prevent exploration. A learner
may enter any branch, inspect prerequisites, and continue despite a readiness
warning. Prerequisite locks should normally be recommendations, not hard gates.

### 4.2 Readiness beats grade level

Skills exist independently from SD, SMP, SMA, university, or professional
stages. Curriculum frameworks map onto skills as metadata. They do not own or
contain the canonical skill definitions.

### 4.3 One trusted graph, many personal paths

Learnesia should not invent a completely different ontology for every learner.
All learners share a reviewed knowledge graph. Personalization selects routes,
pace, examples, explanations, scaffolding, and difficulty over that graph.

### 4.4 Interaction beats passive consumption

Long prose followed by a quiz is insufficient. Lessons should alternate concise
explanation, demonstration, prediction, manipulation, practice, feedback, and
reflection. Learners should act every 30–90 seconds where the subject permits.

This principle is the reason Lessons are an ordered sequence of typed Content
Blocks rather than a single markdown body (section 5.1).

### 4.5 LLMs propose; systems verify

LLMs may draft curricula, explanations, hints, distractors, and interactive
templates. Deterministic validators, source checks, independent evaluators, and
humans decide whether content is publishable.

The v2 pipeline implements the first version of this: a separate Evaluation LLM
seam, flat-file rubrics, and two mandatory human checkpoints (section 5.5).

### 4.6 Generate templates before generating instances

Prefer one reviewed procedural exercise template capable of producing thousands
of valid variants over thousands of independent LLM calls. This reduces cost,
latency, inconsistency, and hallucination risk.

### 4.7 Explainable adaptation first

Early recommendation and mastery systems should remain inspectable. A content
reviewer or engineer must be able to explain why a skill was recommended and
why mastery changed. More complex models should earn adoption through measured
improvement.

### 4.8 Learning evidence, not engagement theater

Streaks and celebrations may support motivation, but progress must represent
real learning evidence. Avoid manipulative infinite feeds, punitive streak loss,
or points disconnected from mastery.

### 4.9 Changeability over completeness

Where a decision is likely to be revisited — prompts, rubrics, search providers,
LLM vendors, block types — the design must expose a seam so the change is a
config or file edit rather than a refactor. Section 5.10 lists the seams that
exist today.

## 5. Architecture of record: Content Architecture v2

This section merges PRD [#29](https://github.com/fachry-isl/learnesia/issues/29).
It describes the content model, generation pipeline, and reference system that
current implementation work targets. Terms are defined canonically in
[`CONTEXT.md`](../CONTEXT.md); this section states the engineering decisions, not
the vocabulary.

### 5.1 Content hierarchy and Content Blocks

The v1 model was a flat `Course → Lesson` hierarchy where each Lesson was a
single markdown blob, quizzes were a 1:1 sibling entity, and video embeds were
buried inside markdown where the pipeline could not reason about them.

v2 replaces it with:

```text
Course
  -> Module            (ordered; every Course has at least one)
      -> Lesson        (ordered)
          -> Content Block   (ordered, typed)
```

- A Lesson's content is an ordered list of Content Blocks. The v1
  `Lesson.lesson_content` TextField is retained only as a legacy fallback for
  rows not yet migrated, and the public renderer falls back to it when a Lesson
  has no blocks. It carries no new content and should be dropped once the
  fallback is provably unused. Note that `estimated_time` still reads it.
- `ContentBlock` is a single table with a `lesson` FK, `order`, a `block_type`
  discriminator, a JSON `payload`, and a nullable `quiz` FK used only when
  `block_type == 'quiz'`. Rationale and alternatives considered:
  [ADR-0001](adr/0001-hybrid-single-table-content-blocks.md).
- Block types are a **closed registry**, not a runtime plugin system. Current
  types: `text`, `video`, `quiz`, `exercise`. Adding a JSON-shaped type costs a
  registry entry plus a renderer. Adding a relationally-backed type (as `quiz`
  is) additionally costs a nullable FK migration.

Payload schemas (validated in the application layer, strict mode — unknown fields
rejected):

| `block_type` | Payload |
|---|---|
| `text` | `{markdown: string}` |
| `video` | `{url: string, title: string, start?: int, end?: int}` |
| `quiz` | empty — data lives in the `Quiz → QuizQuestion → QuestionOption` tree via the nullable FK |
| `exercise` | `{prompt: string, sample_solution?: string, hints?: string[]}` |

Two constraints carried from `CONTEXT.md` that the pipeline and evaluators must
enforce:

- A **Video block is never standalone.** It must have at least one adjacent Text
  block that primes ("watch for X") or debriefs ("building on what you saw…").
- **A Lesson may contain more than one Quiz block.** The v1 `unique=True`
  constraint on `Quiz.lesson` is dropped.

Payload integrity for JSON-shaped types is not enforced by the database. This is
accepted for an admin-authored system with a small editorial team, and is a known
liability if authoring is ever opened up more widely.

### 5.2 Reference and citation system

`LessonReference` is replaced by two models:

- **`Reference`** — a standalone record of an external source: `url`, `title`,
  `source_type` (link / document / video). One Reference can be cited by many
  Lessons.
- **`LessonCitation`** — a join carrying `role` (`citation` | `supplementary`),
  `order`, and a **nullable `content_block` FK** reserved for future block-level
  linking (unused in v1).

Citations are surfaced as a per-Lesson "Sources" list. There are no inline `[n]`
markers — deliberately deferred (section 14).

The `content_block` FK is the seam that later lets a specific claim point at a
specific source, which is a prerequisite for the citation-entailment quality gate
in section 9.2.

### 5.3 Course lifecycle and language

- **Status collapses to `draft` | `published`.** The legacy `template` status is
  removed from the model; existing `template` rows migrate to `draft`. "Template"
  implied reusability that was never actually implemented. Admin routes and
  components still carrying the `template` name are leftovers to delete, not a
  surviving concept.
- **Fine-grained pipeline progress lives on the Generation Run, not on Course
  status.** A Course being generated is simply a Draft.
- **`Course.language`** (default `id`, Bahasa Indonesia) governs the language of
  all pipeline-generated content. It does **not** constrain resource search — the
  Resource Agent searches language-agnostically for the best resource regardless
  of its language. Language is Course-level only; a different-language version of
  a course is a different Course.
- Prompt-level rule: preserve technical terms in the form Indonesian
  practitioners actually use ("Machine Learning", not "Mesin Belajar").

This is the concrete expression of the product bet: **native-language scaffolding
around the world's best resources**, rather than machine translation of them.

### 5.4 Generation Pipeline

```text
Outline Agent
  -> Outline Evaluator        (bounded retries)
  -> HUMAN CHECKPOINT 1       (outline review)
  -> Resource Agent
  -> Content Agent
  -> Content Evaluator        (bounded retries)
  -> HUMAN CHECKPOINT 2       (draft review)
  -> persist as Draft Course
```

Implementation decisions:

- Built as a **LangGraph `StateGraph`** with `interrupt()` at the two human
  checkpoints. State is persisted to PostgreSQL via `langgraph-checkpoint`, so a
  pause is durable and may last minutes or days.
- **Execution model:** the start endpoint spawns the graph as an async background
  task on the ASGI event loop and returns immediately; the frontend polls
  `GenerationRun` status. No Celery/Redis is introduced at this stage.
- **`GenerationRun`** is the durable record: status enum (`generating_outline`,
  `awaiting_outline_approval`, `gathering_resources`, `generating_content`,
  `awaiting_draft_approval`, `completed`, `failed`), nullable FK to the resulting
  Course, the LangGraph thread ID for resumption, timestamps, and an
  `evaluator_notes` JSON field carrying unresolved evaluator feedback.
- **The Resource Agent runs before the Content Agent** so prose is written
  *around* the chosen resources rather than duplicating them. This ordering is a
  product decision, not an implementation detail.

The async-on-ASGI execution model is adequate for admin-triggered runs at current
volume, but it is not durable against process restart in the way section 10.2
requires. See section 12 for when this must be replaced.

### 5.5 Evaluators and human checkpoints

Evaluators are **advisory, not gates**. They score against a small, tunable
rubric using the Evaluation LLM and send revision notes back for regeneration,
bounded at 2 retries (3 total attempts). On exhaustion the pipeline **degrades to
the next human checkpoint** with the best attempt plus unresolved notes attached
to the `GenerationRun`. The pipeline never hard-fails on evaluator disagreement,
and never dead-ends — the human checkpoint is the backstop.

- **Outline Evaluator:** coverage of stated objectives, logical ordering,
  difficulty progression, no redundant or empty modules.
- **Content Evaluator:** objective alignment, factual consistency with the
  gathered References, reading level, and video integration — every Video block
  must have adjacent scaffolding text, and videos longer than 10 minutes without
  timestamps are flagged for human review.

Human checkpoint UX:

- **Checkpoint 1 (outline):** admin sees the `Course → Module → Lesson` tree with
  objectives and planned block types, and can reorder, rename, add, and remove.
  Approve resumes at the Resource Agent; reject sends notes back for one more
  outline attempt.
- **Checkpoint 2 (draft):** admin sees the full lesson content block-by-block
  with gathered resources and citations, can edit any block directly, sees
  evaluator complaints flagged inline, and has a per-block **Regenerate** button
  that makes a standalone LLM call for that block rather than re-running the
  pipeline. Approve persists the Course as a Draft.

An LLM judge is one signal, not proof. Using a different model for evaluation
than for generation reduces self-review bias but does not eliminate correlated
failure; see section 9.2.

### 5.6 Model configuration: two LLM seams

Both seams are env-configured through an OpenAI-compatible `base_url` + `model` +
`api_key`, initialized via LangChain's `init_chat_model`. Both may point at the
same model when the split is not needed.

| Seam | Used by | Volume | Optimize for |
|---|---|---|---|
| **Generation LLM** | Outline Agent, Resource Agent (transcript analysis), Content Agent | ~90% of token spend | cost / speed |
| **Evaluation LLM** | Outline Evaluator, Content Evaluator | ~10% of token spend | reasoning / judgment |

The seam is defined by the **API contract**, not by a vendor name. No provider
name should be hardcoded in pipeline code; switching providers must be a config
change. API keys come from environment/secrets and must never be written into
`GenerationRun` state or any other persisted record.

### 5.7 Resource Provider

- **`ResourceProvider`** — an abstract interface: `search(query) → list[SearchResult]`,
  where a result carries `url`, `title`, `snippet`, and an inferred `source_type`.
  A factory selects the implementation from env config.
- **Default: `TavilyProvider`.** Alternates: `SearXNGProvider` (self-hosted) and
  `GeminiGroundingProvider`.
- **Grounding is an opt-in optimization, not the canonical path.** The canonical
  Resource Agent always performs explicit search so that pipeline behavior is
  identical regardless of which LLM backs it.
- **Video timestamp extraction** is a post-discovery enrichment step, best-effort
  and two-stage: (1) YouTube Data API v3 `videos.list` metadata, parsing chapter
  markers from the description; (2) fallback to `youtube-transcript-api` plus an
  LLM call to identify the relevant segment. If both fail, timestamps are left
  empty and the Content Evaluator flags the video.

Resource discovery is the part of the pipeline most exposed to third-party
breakage (API quota, transcript availability, page structure). Every stage
degrades rather than failing the run.

### 5.8 Prompts and rubrics as flat files

All agent prompts and evaluator rubrics live as flat files in
`backend/learnesia/prompts/` (e.g. `outline_agent.md`,
`content_evaluator_rubric.yaml`), git-versioned, loaded through a prompt loader
that substitutes template variables such as `{language}`. Changing a prompt or a
rubric is a file edit, not a code change.

This is what makes "same pipeline architecture, any language" true: the language
lens is a prompt variable, not a fork.

### 5.9 Migration from v1

- `template` status → `draft`.
- Each existing Course's Lessons wrapped in one auto-generated Module.
- Each `Lesson.lesson_content` → a single `text` Content Block at `order=0`.
- Each existing Quiz → a `quiz` Content Block at `order=1` pointing at the Quiz
  row; drop `unique=True` on `Quiz.lesson`.
- Each `LessonReference` row → a `Reference` plus a `LessonCitation` with
  `role=supplementary`.
- `LessonFeedback` stays attached to Lesson, unchanged.

### 5.10 Changeability axes

The seams that are deliberately cheap to change:

| Axis | Mechanism | Cost of change |
|---|---|---|
| Pipeline steps | LangGraph nodes and edges | add/remove/reorder a node |
| Prompts and rubrics | flat files in `prompts/` | file edit, no deploy of code |
| Resource providers | `ResourceProvider` interface | env config |
| LLM model/provider | OpenAI-compatible seam | env config |
| Block types | closed registry | registry entry + renderer (+ migration if relational) |

Note what is deliberately *not* a seam: the content hierarchy itself, the human
checkpoints, and the requirement that generated content be reviewed before
publication.

### 5.11 Delivery status of #29

PRD #29 is decomposed into tracer-bullet slices:

| Issue | Slice | State |
|---|---|---|
| [#30](https://github.com/fachry-isl/learnesia/issues/30) | Schema foundation: Module + ContentBlock + Text block + API + migration | closed |
| [#31](https://github.com/fachry-isl/learnesia/issues/31) | Quiz block type end-to-end | closed |
| [#32](https://github.com/fachry-isl/learnesia/issues/32) | Video block + Exercise block types end-to-end | closed |
| [#33](https://github.com/fachry-isl/learnesia/issues/33) | Reference system: Reference + LessonCitation | closed |
| [#34](https://github.com/fachry-isl/learnesia/issues/34) | Public frontend: module hierarchy + block renderers + Sources list | closed |
| [#35](https://github.com/fachry-isl/learnesia/issues/35) | Admin frontend: manual course creation + block editing | open |
| [#36](https://github.com/fachry-isl/learnesia/issues/36) | Pipeline foundation: GenerationRun + LangGraph skeleton + LLM seams | open |
| [#37](https://github.com/fachry-isl/learnesia/issues/37) | Outline Agent + Outline Evaluator | open |
| [#38](https://github.com/fachry-isl/learnesia/issues/38) | Resource Provider interface + Tavily + Resource Agent | open |
| [#39](https://github.com/fachry-isl/learnesia/issues/39) | Content Agent + Content Evaluator | open |
| [#40](https://github.com/fachry-isl/learnesia/issues/40) | Admin Generation Run UI: human checkpoints + per-block regenerate | open |

In short: **the content model is shipped; the generation pipeline is not.**
Sections 5.1–5.3 and 5.9 describe delivered behavior. Sections 5.4–5.8 describe
committed design that is still in flight.

Implementation state as of this revision, at a finer grain than issue status:

| Component | State |
|---|---|
| `Module`, `ContentBlock`, block registry, hierarchy API | delivered |
| `Reference`, `LessonCitation`, sources API, `LessonReference` removal | delivered |
| `Course.language`, `draft`/`published` statuses (backend) | delivered |
| Public renderers for all four block types + Sources list | delivered |
| Admin manual course/module/lesson/block editors | in progress |
| `GenerationRun` model and migration | delivered; endpoint not routed |
| LangGraph `StateGraph` | skeleton only — all five nodes are placeholders returning fixed data, no `interrupt()`, no checkpointer, no ORM writes, never invoked |
| Prompt loader | delivered; `backend/learnesia/prompts/` does not exist yet |
| Two LLM seams | not started — generation still calls one hardcoded model directly from views |
| `ResourceProvider`, Tavily, YouTube timestamp extraction | not started; dependencies not in `requirements.txt` |
| Human checkpoint UI (both checkpoints, per-block regenerate) | not started |

The legacy single-shot generation endpoints on the Course, Lesson, and Quiz
viewsets are still the only working generation path. They have no evaluator and
no human checkpoint, and are what the pipeline is intended to replace.

Two defects in the current working tree block the test suite and the admin
create-course page; they are recorded in the roadmap review rather than here,
since they are transient.

## 6. Target product model beyond v2

The v2 hierarchy is a good *authored learning experience*. It is not a
representation of knowledge. This section describes the layer that should sit
above it.

### 6.1 Canonical knowledge graph

The `Course → Module → Lesson → Content Block` hierarchy should eventually sit on
top of a reusable knowledge graph rather than being the only representation of
knowledge.

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

**Relationship to v2:** a Lesson's per-lesson learning objectives, already
produced by the Outline Agent (section 5.4), are the natural seed for Skill
objectives. Introducing Skills should start by extracting and de-duplicating
those objectives across existing Courses, not by authoring a graph from scratch.

### 6.2 Curriculum frameworks are lenses

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

### 6.3 Learning paths

A Learning Path is an ordered or partially ordered route through skills for a
goal. Examples:

- Indonesian SMP mathematics.
- Prepare for introductory physics.
- Learn Python from zero.
- Build financial literacy.
- Explore biology without a school-stage constraint.

Paths can share skills and content. Learners may follow a path, branch away,
return later, or build a goal-based personal path.

### 6.4 Courses in the target model

Courses remain valuable as authored narratives and bounded offerings. A Course
should eventually reference the Skills it teaches and assesses. It must not
become the exclusive owner of those Skills.

Concretely, this means adding a Course-to-Skill (and eventually
Lesson-to-Skill) mapping alongside the v2 hierarchy — not replacing the
hierarchy. Nothing in section 5 needs to be undone to reach section 6.

## 7. Personal knowledge tree

### 7.1 Shared graph plus learner state

The personal knowledge tree is a projection:

```text
Canonical knowledge graph
  + Learner Skill State
  + Current goal and preferences
  = Personal knowledge tree and recommended path
```

Do not duplicate the entire graph for every learner. Store a sparse overlay for
skills where evidence or explicit learner interest exists.

### 7.2 Learner Skill State

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

### 7.3 Branch progress

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

### 7.4 Zone of proximal development

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

### 7.5 Updating mastery

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

Note the current gap: v2 quiz blocks are auto-graded client-side and exercise
blocks have no submission at all (section 5.1). **Mastery has no evidence source
until attempts are recorded server-side.** That is the first dependency of
section 12's Phase 1.

### 7.6 Cold start

New learners need a respectful entry process:

1. Ask learning goal, available time, language, and optional context.
2. Let the learner self-report familiarity.
3. Run a short adaptive diagnostic, with an option to skip.
4. Initialize uncertain skill estimates rather than declaring mastery.
5. Refine rapidly using early learning evidence.

Age and school grade may improve content presentation and curriculum mapping but
must not become knowledge-access gates.

## 8. Interactive learning engine

### 8.1 Structured content, first-party behavior

AI must not emit arbitrary learner-facing HTML, JavaScript, or React code.
Interactive content should use versioned, declarative JSON payloads rendered by
trusted first-party components, consistent with
[`docs/design/interactive-content-blocks.md`](design/interactive-content-blocks.md)
and [ADR-0001](adr/0001-hybrid-single-table-content-blocks.md).

This is already the shape of the v2 Content Block registry (section 5.1) — new
interactive types are additional registry entries plus renderers, not a new
subsystem. The planned next types are `step_solver`, `graph`, `calculator`, and
`socratic`, in that order.

The current block types remain valid. Future assessed interactions may require
new block types or a broader assessment contract; they must not silently change
the current ungraded `exercise` block semantics defined in `CONTEXT.md`.

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

The video-scaffolding rule generalizes: a heavy interactive block should also
have adjacent Text blocks priming and debriefing it.

### 8.2 Procedural templates

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

### 8.3 Template verification

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

### 8.4 Runtime selection

At learning time, the platform should preferably select:

1. A reviewed template matching the target skill and challenge dimensions.
2. A deterministic seed for reproducibility and debugging.
3. A generated variant that passes runtime invariants.
4. Presentation and scaffolding appropriate to learner context.

Use runtime LLM calls only where they add clear value, such as re-explaining a
concept or generating contextual hints. Correctness and scoring should remain
deterministic wherever possible.

## 9. Content production and quality system

### 9.1 Target pipeline

The v2 Generation Pipeline (section 5.4) is the foundation. Its target evolution:

```text
Curriculum or learning-goal specification
  -> Skill and prerequisite proposal
  -> Source discovery and ingestion            [v2: Resource Agent]
  -> Lesson and interactive-template generation [v2: Content Agent]
  -> Schema and deterministic validation        [v2: block registry, partial]
  -> Independent rubric evaluation              [v2: Evaluation LLM seam]
  -> Adversarial variant and assessment tests
  -> Human checkpoint                           [v2: checkpoints 1 and 2]
  -> Immutable published version
  -> Learner evidence and defect reports
  -> Revision candidate
```

Bracketed stages exist in v2's design. The unbracketed ones — skill proposal,
adversarial testing, immutable versioning, and the learner-evidence feedback loop
— do not, and each is a distinct future workstream.

### 9.2 Quality gates

Rubrics should be explicit, versioned, and domain-aware. v2 stores them as flat
files (section 5.8), which satisfies "explicit and versioned" but not yet
"domain-aware". Candidate gates:

- Learning-objective alignment. *(v2: Content Evaluator)*
- Prerequisite correctness and progression. *(v2: Outline Evaluator)*
- Factual support and citation entailment. *(v2: partial — consistency with
  gathered References, not claim-level entailment)*
- Mathematical or logical correctness.
- Answer uniqueness and distractor quality.
- Difficulty calibration.
- Bahasa Indonesia naturalness and terminology. *(v2: prompt-level rule only)*
- Age/context appropriateness without age gating.
- Pedagogical scaffolding. *(v2: video-adjacency rule)*
- Accessibility.
- Bias and safety.
- Copyright, license, and plagiarism checks.

An LLM judge is one signal, not proof. Use a different evaluation model or prompt
from the generator where practical — v2 does this via the two-seam split — but
assume correlated failures remain possible. Deterministic domain checks and human
review remain necessary. Today the human checkpoints, not the evaluators, are
what actually protects quality.

### 9.3 Provenance and versioning

Every generated or revised publishable artifact should be traceable to:

- Generation Run. *(v2: exists)*
- Generator model and provider.
- Prompt and schema versions.
- Input curriculum/objectives.
- Retrieved sources and snapshots where legally permitted. *(v2: References,
  without snapshots)*
- Validation results.
- Evaluator model, rubric version, and scores. *(v2: `evaluator_notes`, unscored)*
- Human decisions and revision notes.
- Published immutable content version.

Published content should not mutate invisibly. A revision creates a candidate
version; the current version remains live until the candidate passes gates.

v2 does **not** implement immutable content versions — an approved Draft is
edited in place. This is the largest gap between the current pipeline and the
target quality system, and it becomes urgent as soon as published courses have
learners attached to them.

### 9.4 Human review strategy

Human review effort should be risk-based:

- New skill, new template, or high-impact factual content: mandatory review.
- Existing approved template producing valid deterministic variants: sampled QA.
- Low evaluator confidence or gate disagreement: mandatory review.
- Repeated learner reports or suspicious telemetry: automatic review queue.

The goal is not to remove humans. It is to spend human judgment on reusable,
high-leverage artifacts.

v2 currently applies **mandatory review to every run** at two checkpoints. That
is correct for the current stage and is also the binding constraint on content
throughput — see the Resources axis in the roadmap review.

### 9.5 Testing strategy

Tests verify external behavior through public interfaces, not implementation
details, so that refactoring does not break them.

- **Content Block registry:** each registered type accepts a golden payload and
  rejects a malformed one; the registry returns the correct serializer fragment;
  unregistered types are rejected.
- **API layer:** DRF `APIClient` integration tests covering hierarchy CRUD
  (Course → Modules → Lessons → Blocks of each type), quiz-block-to-Quiz-row
  linkage, Reference and LessonCitation CRUD in both roles, public endpoints
  returning only published courses with correct nesting, and status transitions.
- **Generation Pipeline:** with mocked agent nodes, verify execution order and
  that checkpoints pause the graph; verify evaluator retry bounds and degradation
  to checkpoint; verify `GenerationRun` status transitions. **Do not test actual
  LLM output** — mock all LLM calls.
- **Resource Provider:** contract tests against a mock implementation;
  `TavilyProvider` against mocked HTTP, never the live API; timestamp extraction
  across all three paths (chapters, transcript fallback, both failing).
- **LLM seam connectivity:** connectivity checks must exercise more than a
  `/v1/models` listing — cover a non-streaming completion, a streamed response,
  an authentication failure, and an unavailable model, and confirm the two seams
  can share one endpoint with different models without overwriting each other's
  configuration.

Frontend component testing is deferred while admin is the primary user and can
visually verify.

## 10. Target engineering architecture

### 10.1 Architectural style

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

Current reality: a Django/DRF monolith on ASGI with a Next.js frontend. No Go
exists yet. The module boundaries above are still useful as a target for how the
Django app should be organized internally in the meantime — the migration is
easier from a well-bounded monolith than from a tangled one.

### 10.2 Source of truth and events

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

v2's design satisfies part of this: the LangGraph Postgres checkpointer is meant
to make *graph state* durable, and `GenerationRun` gives explicit states and
bounded retries. It does not satisfy the rest — the executing task is an
in-process `asyncio` task, so a process restart mid-node loses the in-flight
step, and there is no queue, cancellation, or timeout story. Acceptable at
admin-triggered volume; a real queue is required before generation is exposed to
anyone but admins, or before runs matter enough that losing one is expensive.

Even the durable half is not yet real: the graph compiles without a checkpointer
and `langgraph-checkpoint-postgres` is not a declared dependency. Until that is
wired, a paused run cannot survive a restart, which defeats the point of a
checkpoint that "may last minutes or days."

### 10.3 API design

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

The nesting warning is now concrete: a Lesson is an ordered list of Content
Blocks, so a naively nested course-detail endpoint grows with total block count.
Catalog reads must not carry block payloads.

### 10.4 Security and privacy

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

Additional constraints introduced by v2:

- LLM and search API keys come from environment/secrets only. They must never be
  persisted into `GenerationRun` state, prompts, or logs.
- Content Block payloads are model-authored data. Renderers must never use
  `dangerouslySetInnerHTML` or `eval` on payload content.
- Third-party resource URLs are untrusted input; validate scheme and host before
  embedding.

Applicable Indonesian and expansion-market privacy requirements require formal
legal review before launch at scale.

### 10.5 Observability

Trace user-facing and generation flows through stable IDs:

- Request/session ID.
- Learner attempt ID.
- Recommendation event ID.
- Template/variant/seed IDs.
- Content version ID.
- Generation Run and job IDs.

Monitor correctness and learning quality, not only latency and errors. For the
generation pipeline specifically, track per-run token spend by seam, per-node
latency, evaluator pass rate on first attempt, retry-exhaustion rate, and human
edit distance at each checkpoint — the last of these is the cheapest available
proxy for generation quality.

## 11. Django-to-Go migration

### 11.1 Decision direction

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

The v2 pipeline is a concrete instance of that boundary: LangGraph,
`youtube-transcript-api`, and the LLM tooling are Python-ecosystem strengths.
The generation pipeline is the *last* thing that should move to Go, not the
first.

### 11.2 Migration sequence

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

### 11.3 What not to migrate first

- Stable admin CRUD with no immediate learner impact.
- Every AI integration before pipeline contracts stabilize.
- Infrastructure purely to achieve microservice separation.
- Existing behavior that should be deleted rather than reproduced.
- **The Generation Pipeline**, while prompts, rubrics, and node topology are
  still changing weekly.

### 11.4 Trigger conditions

The migration should not start on a date. It should start when at least one of
these is true:

- Attempt/scoring write volume makes Django's per-request overhead a measured
  problem.
- Mastery recomputation needs sustained concurrent workers.
- The domain model has been stable for long enough that parity tests are cheap
  to write.

Until then, effort spent on Go is effort not spent on the learner loop.

## 12. Delivery roadmap

The phases below are the intended learning-value sequence. They are annotated
with actual status, which does not match the intended order.

### Phase 0: Foundation and research — *not started*

- Select one narrow learning domain: recommended SMP mathematics, one grade band
  and one semester-sized scope.
- Interview learners, parents, and educators.
- Define learning metrics and baseline diagnostics.
- Formalize canonical Skill vocabulary and graph rules.
- Resolve brand/trademark/domain risk before significant marketing spend.
- Specify privacy and minor-safety requirements.

Exit evidence: validated learner problem, reviewed initial skill graph, and a
small target cohort willing to test repeatedly.

### Phase 1: One complete learning loop — *not started*

- Add learner accounts and server-side progress.
- Record attempts and deterministic scoring evidence.
- Implement Skill, prerequisite, objective, and Course-to-Skill mappings.
- Implement simple interpretable mastery state.
- Deliver one end-to-end unit with concise content and existing quiz blocks.
- Show personal branch progress and a reasoned next recommendation.

Exit evidence: learners can start, practice, stop, resume on another device, and
see mastery change from real attempts.

Blocking gap: progress is currently client-side (`localStorage`) and exercises
have no submission at all, so no learning evidence exists anywhere on the server.

### Phase 2: Procedural interactivity — *not started; designed*

- Define versioned interactive-template contract.
- Ship numeric input and one manipulation/matching interaction.
- Build deterministic seeds, answer derivation, and variant validation.
- Add misconception tags and targeted hints.
- Add template review and sampled variant QA.
- Place interactions throughout lessons, not only at lesson end.

Exit evidence: one reviewed template safely produces many diverse variants;
learning flow stays engaging without a per-attempt LLM call.

Design already exists in
[`docs/design/interactive-content-blocks.md`](design/interactive-content-blocks.md);
the v2 block registry is the delivery mechanism, so the marginal cost per new
interactive type is low.

### Phase 3: Reliable content factory — *in progress (this is #29)*

- Make Generation Runs asynchronous and durable. *(async: yes; durable: partial)*
- Add content and template versioning/provenance. *(not started)*
- Add explicit, versioned quality rubrics. *(flat-file rubrics: designed, #37/#39)*
- Combine deterministic validators, independent evaluators, and human queues.
  *(registry validation shipped; evaluators and checkpoints in flight)*
- Add immutable publishing and rollback. *(not started)*
- Track generation cost and reviewer time per approved skill. *(not started)*

Exit evidence: team can repeatedly transform a curriculum objective into a
source-backed, interactive, reviewed skill package with known cost and quality.

**Sequencing note.** Phase 3 started before Phases 0–2. The v2 content model
(#30–#34) was a genuine prerequisite for everything else — a single markdown blob
per Lesson could not support interactivity, attempts, or block-level
provenance — so that part of the reordering was correct. The remainder (#36–#40,
the generation pipeline) is a throughput investment made before there is evidence
that the content already published produces learning. The risk is scaling
production of content whose value is unmeasured.

**Gate.** Finish #35–#40 as scoped, then stop expanding the catalog until Phase 1
exists. Volume of generated courses is explicitly not a success metric
(section 13).

### Phase 4: Adaptive path — *not started*

- Add diagnostics and estimate uncertainty.
- Add prerequisite remediation, challenge adjustment, and spaced review.
- Add recommendation reason codes and learner choice.
- Calibrate exercise difficulty using real attempt data.
- Evaluate mastery model against delayed assessments, not engagement alone.

Exit evidence: adaptive path improves learning gain or retention against a fixed
path without increasing frustration or dropout.

### Phase 5: Expand domain and platform — *not started*

- Extend mathematics coverage.
- Add logic or coding after sandboxed evaluation exists.
- Add physics after math prerequisite mapping is reliable.
- Add biology with stronger factual/source-review workflows.
- Add additional curriculum and language lenses.
- Complete remaining Go cutovers when domain behavior is stable.

Do not launch mathematics, biology, physics, logic, and coding simultaneously.
Each requires distinct interaction, verification, and editorial capabilities.

## 13. Initial success metrics

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

### Pipeline quality (measurable today)

- Evaluator pass rate on first attempt, per agent.
- Retry-exhaustion rate (how often the pipeline degrades to a checkpoint).
- Human edit distance at checkpoint 1 and checkpoint 2.
- Share of Video blocks with successfully extracted timestamps.
- Share of Lessons whose Video blocks have adjacent scaffolding text.

### Economics and operations

- Generation cost per approved skill package.
- Human review minutes per approved template.
- Cost per active learner and per mastery event.
- Cache/template reuse rate versus runtime LLM calls.
- Generation pipeline completion and retry rates.
- Token spend split across the Generation and Evaluation seams.

Avoid optimizing only course count, generated word count, time-on-page, or raw
question volume. These can increase while learning quality declines.

## 14. Explicit non-goals

### Product non-goals

- Replacing schools, teachers, or national curricula.
- Generating unrestricted UI or executable code from LLM output.
- Fully autonomous publication without accountable review.
- A universal intelligence score or grade label for learners.
- Hard-locking knowledge by age or school stage.
- Social feeds, certificates, marketplaces, or broad creator monetization before
  the core learning loop works.
- Microservices before scaling or team boundaries require them.
- Simultaneous broad subject coverage.

### Deferred from Content Architecture v2

Carried from #29 — deliberately out of scope, with the reason:

- **UI internationalization** (application chrome) — until an international user
  base exists. Course *content* language is already handled (section 5.3).
- **Inline citation markers** (`[1]`, `[2]`) — the lesson-level Sources list is
  sufficient for now.
- **Block-level citation linking** — the `LessonCitation.content_block` FK exists
  but stays nullable and unused.
- **Exercise submission and grading** — exercises are prompt-only with revealable
  solutions. Revisit as part of Phase 1, since attempts are the evidence source
  mastery needs.
- **Code sandbox exercises** (Pyodide/WASM) — a separate project.
- **Auto-translation of course content** — machine-translated educational content
  is a quality risk. Each language is a separately generated Course.
- **Frontend component tests** — while admin is the primary user and can visually
  verify.

## 15. Decisions to formalize later

Create focused ADRs/designs before implementation for:

- Canonical Skill graph and versioning semantics.
- Curriculum mapping/version model.
- Attempt event and mastery projection model.
- Recommendation policy and reason codes.
- Procedural expression language and sandbox.
- Assessed interactive block taxonomy.
- Content/template immutable publishing model.
- Durable job/checkpoint infrastructure — specifically, what replaces the
  in-process `asyncio` execution model of section 5.4.
- Identity, child safety, consent, and data retention.
- Django/Go data ownership and endpoint cutover strategy.

## 16. Near-term recommendation

The original recommendation was to build one narrow, evidence-complete
mathematics experience from scratch. That is still the right destination, but it
is no longer the right starting move: the v2 content model is shipped and the
generation pipeline is half-scoped and in flight. Abandoning it mid-flight would
waste the sunk work; finishing it *and then continuing to scale content* would
compound the real risk.

Revised sequence:

1. **Finish #35–#40 as scoped.** Do not widen the pipeline's scope. Specifically,
   resist adding provenance, versioning, or cost tracking into these slices —
   they belong to the later half of Phase 3.
2. **Prove the pipeline once, narrowly.** Generate three connected lessons in one
   domain (recommended: SMP mathematics), all the way through both checkpoints,
   and record the numbers in section 13's pipeline-quality metrics. That run is
   the evidence that the content factory works.
3. **Stop catalog expansion there** and build the Phase 1 learner loop: accounts,
   server-side progress, recorded attempts, deterministic scoring, and one
   interpretable mastery state.
4. **Add Skills as a thin layer** over the existing hierarchy — extract objectives
   the Outline Agent already produces, de-duplicate them, and map Courses to
   Skills. Do not build the full graph first.
5. **Add one procedural interactive type** (`step_solver`) using the existing
   block registry, to prove Phase 2's mechanism cheaply.
6. **Measure learning gain** with a small Indonesian learner cohort before
   expanding subject coverage or starting the Go migration.

This tests Learnesia's actual advantage:

> Reliable transformation from curriculum and learner goals into verified,
> interactive practice that adapts to each learner and becomes cheaper through
> reusable procedural templates.

The v2 architecture delivers the first half of that sentence. Nothing currently
built or planned delivers the second half, and no amount of additional generated
content will.

## Related documents

- [`CONTEXT.md`](../CONTEXT.md) — canonical domain language.
- [#29 — PRD: Content Architecture v2](https://github.com/fachry-isl/learnesia/issues/29)
  — the source PRD merged into section 5, with child issues #30–#40.
- [`docs/adr/0001-hybrid-single-table-content-blocks.md`](adr/0001-hybrid-single-table-content-blocks.md)
  — Content Block persistence decision.
- [`docs/design/interactive-content-blocks.md`](design/interactive-content-blocks.md)
  — future interactive block design (Phase 2).
- [`docs/design/roadmap-review-2026-08-30.md`](design/roadmap-review-2026-08-30.md)
  — assessment of this plan across engineering effort, product impact,
  resources, complexity, and content quality.
