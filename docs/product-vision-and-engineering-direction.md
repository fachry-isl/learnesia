# Learnesia Product Vision and Engineering Direction

**Status:** Directional strategy, plus the current architecture of record
**Audience:** Product, engineering, content, and future contributors
**Last updated:** 2026-08-30
**Absorbs:** [#29 — PRD: Content Architecture v2](https://github.com/fachry-isl/learnesia/issues/29)
**Implementation strategy:** greenfield rebuild on Go, Python, and TypeScript
Next.js — see section 11 and [ADR-0002](adr/0002-greenfield-rebuild-go-python-nextjs.md)

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

Two things changed at once: PRD #29 was merged into this document, and the
implementation strategy was reversed from a strangler migration to a greenfield
rebuild.

### 2.1 Greenfield rebuild replaces the Django-to-Go migration

Learnesia is rebuilt from scratch on Go, Python, and TypeScript Next.js. No data
is migrated; the Django backend and its database are abandoned rather than
strangled. Section 11 is rewritten and [ADR-0002](adr/0002-greenfield-rebuild-go-python-nextjs.md)
records the decision, the three deployable units, and the Go/Python seam.

The previous plan's trigger conditions are void. They assumed a cost model
dominated by protecting live traffic and live data; the product has neither, and
the switching cost will never be lower.

The consequence for sequencing is the important part: section 12 is now a build
order in which **the learner loop ships before the content factory**. That was
the central finding of the review this revision responds to.

### 2.2 PRD #29 merged in

1. **Content Architecture v2 is recorded as the architecture of record**
   (section 5), not as a parallel proposal. The `Course → Module → Lesson →
   Content Block` hierarchy, the Content Block registry, the Reference/Citation
   system, the Generation Pipeline, the two LLM seams, and the Resource Provider
   interface are all folded in from #29. The *design* survives the rebuild even
   though the Django implementation of it does not.
2. **The old vision text assumed a flat authored-course model.** Section 6 now
   positions the canonical knowledge graph as a layer *above* the block-based
   hierarchy rather than a replacement for an unspecified one, and states
   explicitly that Courses reference Skills rather than owning them.
3. **#29's out-of-scope list is merged into the non-goals** (section 14), so
   there is one place that says what Learnesia is deliberately not building.
4. **#29's testing decisions are merged into the quality system** (section 9.5).
5. **The near-term recommendation is rewritten** (section 16) around the rebuild.
6. Related documents now include #29, its child issues, and ADR-0002.

No product principle was weakened or removed. The vision, the domain language in
`CONTEXT.md`, and the target architecture are unchanged — only the route to them
is different, and shorter.

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
implementation work targets. Terms are defined canonically in
[`CONTEXT.md`](../CONTEXT.md); this section states the engineering decisions, not
the vocabulary.

**These decisions survive the greenfield rebuild.** Section 11 discards the
Django implementation, not this design. The hierarchy, the block registry and its
payload schemas, the reference model, the pipeline topology, the two LLM seams,
the evaluator-degradation rule, and prompts-as-flat-files all carry across to Go
and Python unchanged. Where this section describes a Django or Python mechanism
that does change — the `asyncio` execution model in 5.4 — the replacement is in
section 11.3.

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

The async-on-ASGI execution model was the one part of this design that did not
survive: it is not durable against process restart in the way section 10.2
requires. The rebuild replaces it with a Postgres-backed job table and a separate
worker process — see section 11.3. The rest of the pipeline design is unaffected,
because the graph, the checkpoints, and the Run states never depended on *how*
the executor was hosted.

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

### 5.9 Migration from v1 (historical — not executed)

The greenfield rebuild migrates no data (section 11), so none of the steps below
will run. They are kept only as a record of what the v1 model contained and how
it mapped onto v2, which is useful when seeding fresh content.


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

### 5.11 Prior delivery status of #29 (historical)

This subsection records what the Django implementation reached before the
greenfield decision. It is kept because it is the evidence base for that
decision, and because it says which parts of the design were actually exercised
and which were only ever specified. The issues below are superseded by the build
order in section 12.1.

PRD #29 was decomposed into tracer-bullet slices:

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

In short: **the content model was built and works; the generation pipeline was
never more than a skeleton.** That asymmetry is why the rebuild ports the block
renderers and editors but rewrites the pipeline from its design rather than its
code — there is almost no pipeline code to lose.

Implementation state at the point of the decision, finer-grained than issue
status:

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
viewsets were the only working generation path — no evaluator, no human
checkpoint. They are not carried forward.

Two defects in that tree blocked the Django test suite and the admin
create-course page. They are recorded in the roadmap review and in issue #48;
both are moot in the rebuild.

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

Note the gap this closes: in the Django implementation, quiz blocks were graded
client-side and exercise blocks had no submission at all, so **mastery had no
evidence source anywhere on the server**. Recording attempts server-side is the
first dependency of everything in this section, which is why it lands in slice 4
of the rebuild rather than after the content factory.

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

These boundaries are the target layout for `apps/api` in the greenfield rebuild
(section 11), not an aspiration to reach later. `generation/` in Go owns Run
state and job dispatch; the graph execution itself lives in `apps/pipeline`.

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

The rebuild satisfies this by construction rather than by retrofit. The job table
of section 11.3 supplies the explicit states, idempotency keys, bounded retries,
cancellation, and timeouts that a durable job needs; the LangGraph Postgres
checkpointer makes graph state survive a worker restart; and `GenerationRun` in
Go remains the inspectable record of what a run did.

This is a direct correction of the Django design, where the executor was an
in-process `asyncio` task with no queue, no cancellation, and no timeout, and the
checkpointer was never actually wired — so a pause could not survive a restart,
defeating the point of a human checkpoint that "may last minutes or days."

The requirement that makes this non-negotiable: **slice 5 is not done until a run
pauses, the worker is restarted, and the run resumes.**

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

## 11. Greenfield rebuild

Recorded in [ADR-0002](adr/0002-greenfield-rebuild-go-python-nextjs.md). This
section supersedes the previous strangler-migration plan and its trigger
conditions.

### 11.1 Decision

Learnesia is rebuilt from scratch on Go, Python, and TypeScript Next.js. No data
is migrated. The Django/DRF backend, its models, its migrations, and its database
contents are abandoned rather than strangled.

The earlier plan — keep Django, build new capabilities in Go, cut over endpoint
by endpoint with parity tests and shadow reads — was correct for a system with
users and data to protect. This system has neither. A strangler migration is a
technique for changing something you cannot stop; nearly its entire cost buys
safety that is not needed here, and the switching cost will never be lower than
it is at zero users.

The vision document's own caution still applies and is not waved away: a
big-bang rewrite while the product model is changing is a real risk. The
mitigation is that the *domain language is not changing*. `CONTEXT.md`, the block
payload schemas, ADR-0001's storage shape, and PRD #29's pipeline decisions all
carry across intact. What is discarded is an implementation, not a design.

### 11.2 Three deployable units

```text
apps/web        Next.js (TypeScript, App Router) — public site and admin
apps/api        Go — HTTP API, domain logic, sole owner of Postgres
apps/pipeline   Python — LangGraph generation worker, no domain-table access
```

**Go owns every domain write.** The one-writer rule of section 10.2 applies from
the first migration rather than being negotiated during a cutover. Go owns the
schema.

**Python is a worker behind a job boundary, not a service.** It exists for the
reason section 11.1 always kept a Python boundary: LangGraph, transcript
extraction, and LLM tooling are Python-ecosystem strengths with no Go equivalent
worth building. It has no public HTTP surface and no ORM access to domain tables.

**The frontend is a new TypeScript App Router application that ports proven
components.** The existing frontend is already Next.js on React 19 with Tailwind,
but it is a client-side React app inside Next.js — `use client` throughout, axios
fetching, no TypeScript. The new app uses server components for catalog and
lesson reads. The block renderers, admin block editors, and sources list are
ported rather than rewritten: they are new, tested, and encode block-type
behavior that survives the rewrite.

### 11.3 The Go/Python seam

The integration point is a **job contract, not a shared database**:

- **Dispatch** — a Postgres-backed job table written by Go. The worker claims
  jobs with `SELECT … FOR UPDATE SKIP LOCKED`, woken by `LISTEN`/`NOTIFY`. No
  broker, no Redis, no Celery.
- **Results** — the worker writes no domain tables. It calls back into Go's
  internal API with a service token, so payload validation happens once, in Go,
  at the boundary where admin writes are already validated.
- **Graph state** — LangGraph checkpoints live in a dedicated `pipeline` Postgres
  schema owned by Python. Domain tables are never joined to it.
- **Human checkpoints** — on interrupt, the worker reports the pause to Go, which
  moves the Generation Run into the matching `awaiting_*_approval` state and
  serves the review UI. Approval enqueues a resume job carrying the human's
  edited payload and the graph thread id.

This job table must be treated as an API: versioned payloads, explicit states,
idempotency keys, bounded retries. A sloppy job contract reintroduces exactly the
coupling the split exists to avoid.

### 11.4 Ongoing cost of the decision

Recorded plainly, because it is real:

- Two backend toolchains, two test runners, two deployment artifacts, and a
  versioned contract between them.
- A period with **no working product**, until the Go content domain and the web
  app reach parity with what exists today. Acceptable only because there are no
  users; it stops being acceptable the moment there are.
- `CONTEXT.md` becomes load-bearing — the only artifact surviving the rewrite
  intact, and the sole guard against the product model drifting while the stack
  is rebuilt.

Against that: the review follow-ups that were retrofits against Django — per-run
cost ceiling, executor interface, deterministic rubric validation,
resource-quality rubric, content versioning — are now design inputs, and cost
almost nothing to include from the start.

## 12. Delivery roadmap

The greenfield rebuild (section 11) removes the sequencing conflict that the
previous plan had accumulated. The build order below puts the **learner loop
before the content factory** — the correction that motivated this revision.
Nothing in the previous plan produced a single row of learner evidence, and no
volume of generated content substitutes for it.

### 12.1 Build order

Each slice is a tracer bullet: it goes through all three deployable units and
leaves something demonstrable behind.

**Slice 0 — Foundation.** Monorepo layout, Postgres, Go migrations, the job
table, CI for all three units, local compose.
*Exit:* one request traverses web → api → database, and the pipeline worker
claims and completes a no-op job.

**Slice 1 — Content domain in Go.** Course, Module, Lesson, ContentBlock,
Reference, LessonCitation. Block payload validation per type. Admin write API and
compact public catalog reads kept separate from lesson detail reads.
*Exit:* a course authored through the API serves correct JSON; malformed block
payloads are rejected at the boundary.

**Slice 2 — Web application.** TypeScript App Router, server components for
catalog and lesson reads, the four block renderers and the sources list ported
from the current frontend.
*Exit:* a seeded course is readable end to end by an anonymous visitor.

**Slice 3 — Admin authoring.** Manual Course/Module/Lesson/Block editing,
reference management, publish and unpublish. Block editors built as **standalone
controlled components** — payload in, payload out, no knowledge of whether they
edit a stored Course or an in-flight Generation Run.
*Exit:* a course is created and published entirely through the admin UI, with no
seed script. The editors are reused unchanged by slice 8.

**Slice 4 — Identity and the learner loop.** Accounts, sessions, enrollment,
recorded attempts, server-side deterministic quiz scoring, resumable progress.
*Exit:* a learner starts, practices, stops, and resumes on another device;
attempts are queryable evidence rather than browser state.

**Slice 5 — Pipeline foundation.** Generation Run in Go, job dispatch and claim
protocol, the Python worker, a LangGraph skeleton with the Postgres checkpointer,
the two LLM seams, the prompt loader, and a per-run cost ceiling enforced between
nodes.
*Exit:* a run with placeholder nodes advances through every status, pauses
durably **across a worker restart**, and resumes.

**Slice 6 — Outline Agent and Outline Evaluator, with checkpoint 1.**
*Exit:* a topic produces a reviewed outline; human edits at the checkpoint
persist and the run resumes from them.

**Slice 7 — Resource Provider and Resource Agent.** Tavily behind the interface,
best-effort video timestamps, a **resource-quality rubric**, and a manual URL
override for when search disappoints.
*Exit:* per-lesson resources are gathered, categorized, and overridable.

**Slice 8 — Content Agent and Content Evaluator, with checkpoint 2.** Per-block
regenerate, inline evaluator annotations, deterministic validation for every
mechanically checkable rubric item.
*Exit:* a full course is generated, reviewed, and published, with pipeline
metrics (section 13) recorded for the run.

**Slice 9 — Skills and mastery, thin.** Extract and de-duplicate the learning
objectives the Outline Agent already produces, map Courses to Skills, and derive
a simple interpretable mastery state from recorded attempts. Show branch
progress.
*Exit:* mastery changes from real attempts, and a reviewer can explain why.

**Slice 10 — Procedural interactivity.** `step_solver` first, per
[`docs/design/interactive-content-blocks.md`](design/interactive-content-blocks.md).
Restricted expression evaluation through a parsed AST, deterministic seeds,
variant validation.
*Exit:* one reviewed template safely produces many valid variants with no
per-attempt LLM call.

Hard dependencies: slice 3 before slice 8 (shared editors); slice 4 before slice
9 (mastery needs attempts); slice 5 before slices 6–8.

### 12.2 Research track

Not a code slice, and it should run alongside slices 0–4 rather than blocking
them:

- Select one narrow learning domain — recommended SMP mathematics, one grade band
  and one semester-sized scope.
- Interview learners, parents, and educators.
- Define learning metrics and baseline diagnostics.
- Formalize canonical Skill vocabulary and graph rules.
- Resolve brand, trademark, and domain risk before significant marketing spend.
- Specify privacy and minor-safety requirements.

Exit evidence: a validated learner problem, a reviewed initial skill graph, and a
small target cohort willing to test repeatedly.

### 12.3 Gate before expansion

After slice 8, prove the pipeline once on the narrow domain and record the
numbers. Then **stop expanding the catalog** until slices 4 and 9 have produced
measured learning evidence. Volume of generated courses is explicitly not a
success metric (section 13).

### 12.4 Adaptive path

- Add diagnostics and estimate uncertainty.
- Add prerequisite remediation, challenge adjustment, and spaced review.
- Add recommendation reason codes and learner choice.
- Calibrate exercise difficulty using real attempt data.
- Evaluate mastery model against delayed assessments, not engagement alone.

Exit evidence: adaptive path improves learning gain or retention against a fixed
path without increasing frustration or dropout.

### 12.5 Expand domain and platform

- Extend mathematics coverage.
- Add logic or coding after sandboxed evaluation exists.
- Add physics after math prerequisite mapping is reliable.
- Add biology with stronger factual/source-review workflows.
- Add additional curriculum and language lenses.
- Add remaining capabilities of section 10.1 that earlier slices deferred.

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
  solutions. Revisit in slice 4, since attempts are the evidence source
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
- The job contract between `apps/api` and `apps/pipeline`: payload versioning,
  states, idempotency keys, retry and cancellation semantics.

## 16. Near-term recommendation

Build slices 0 through 4 (section 12.1) before writing a line of pipeline code.

That sequence is deliberately unglamorous — foundation, content domain, web app,
admin authoring, learner loop — and it ends with the one thing the previous plan
never produced: **a learner whose attempts are recorded on the server.** Every
adaptive capability in sections 6 and 7 is downstream of that single fact, and
none of it can be faked with more content.

Then, and only then, build the pipeline (slices 5–8), prove it once on three
connected lessons in one narrow domain — recommended: SMP mathematics — all the
way through both human checkpoints, and record the numbers from section 13's
pipeline-quality metrics. That run, not the catalog size, is the evidence that
the content factory works.

Three things to resist along the way:

1. **Widening the pipeline slices.** Provenance, immutable versioning, and
   reviewer-time tracking are real needs and belong after slice 8, not inside it.
2. **Building the knowledge graph up front.** Slice 9 extracts Skills from
   objectives the Outline Agent already produces. A hand-authored graph before
   there is content to attach it to is speculative modeling.
3. **Rebuilding what already works.** The block renderers and admin editors are
   ported, not rewritten. The rewrite is of the stack, not of every decision.

This tests Learnesia's actual advantage:

> Reliable transformation from curriculum and learner goals into verified,
> interactive practice that adapts to each learner and becomes cheaper through
> reusable procedural templates.

The v2 architecture delivers the first half of that sentence. Slices 4 and 9 are
the first work in the project's history that delivers any of the second half.

## Related documents

- [`CONTEXT.md`](../CONTEXT.md) — canonical domain language.
- [#29 — PRD: Content Architecture v2](https://github.com/fachry-isl/learnesia/issues/29)
  — the source PRD merged into section 5, with child issues #30–#40.
- [`docs/adr/0001-hybrid-single-table-content-blocks.md`](adr/0001-hybrid-single-table-content-blocks.md)
  — Content Block persistence decision, carried into the rebuild.
- [`docs/adr/0002-greenfield-rebuild-go-python-nextjs.md`](adr/0002-greenfield-rebuild-go-python-nextjs.md)
  — the decision to rebuild rather than migrate, and the Go/Python seam.
- [`docs/design/interactive-content-blocks.md`](design/interactive-content-blocks.md)
  — future interactive block design (slice 10).
- [`docs/design/roadmap-review-2026-08-30.md`](design/roadmap-review-2026-08-30.md)
  — assessment of this plan across engineering effort, product impact,
  resources, complexity, and content quality.
