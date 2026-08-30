# Roadmap review — Content Architecture v2 and beyond

**Date:** 2026-08-30
**Reviews:** [`docs/product-vision-and-engineering-direction.md`](../product-vision-and-engineering-direction.md)
after merging PRD [#29](https://github.com/fachry-isl/learnesia/issues/29)
**Axes:** Engineering Effort · Product Impact · Resources · Complexity · Content Quality

Definitions used throughout:

- **Engineering Effort** — build cost in developer time, including tests and the
  rework the slice is likely to force elsewhere.
- **Product Impact** — how much this moves the stated promise, *learn by
  readiness, not grade level*. Enabler value counts, but is named as such.
- **Resources** — recurring cost after the build: token spend, third-party API
  quota, infrastructure, and human review minutes.
- **Complexity** — how much irreducible difficulty and failure surface it adds to
  the system, and how hard it is to reason about when it breaks.
- **Content Quality** — effect on what a learner actually reads, watches, and
  practices.

## 1. Summary

| Workstream | Eng. Effort | Product Impact | Resources | Complexity | Content Quality | Verdict |
|---|---|---|---|---|---|---|
| Content model v2 — #30–#34 *(shipped)* | High (spent) | High (enabler) | Low | Medium | High | Correct call; keep |
| Admin authoring UI — #35 | Medium | Medium-High | Low | Low-Medium | Medium | **Do now** |
| Pipeline foundation — #36 | Medium-High | Low direct, High enabler | Low | **High** | Neutral | Do now; fix durability |
| Outline Agent + Evaluator — #37 | Medium | Medium | Low | Medium | **High** | Best quality-per-token |
| Resource layer — #38 | **High** | **High** | **High** | **High** | High but variable | **Riskiest slice** |
| Content Agent + Evaluator — #39 | High | High | **Highest** | Medium-High | **Highest** | The money slice |
| Checkpoint UI — #40 | High | High | Low tech / **High human** | Medium | High | Don't skimp |
| Learner loop — Phase 1 | High | **Highest** | Medium | Medium-High | Indirect, essential | **The gate** |
| Knowledge graph — Phase 1/6.1 | **Very High** | High (long-term) | High (curation) | High | High | Start thin |
| Procedural interactivity — Phase 2 | Medium per type | High | **Low marginal** | High (sandbox) | High | Cheap to prove |
| Immutable versioning — Phase 3 tail | Medium-High | Low now, High later | Low | Medium | High | Defer, but before cohort |
| Django → Go — §11 | **Very High** | ~None near-term | High opportunity cost | High | None | **Defer** |

Read the table by column, not by row. The pattern that matters:

- **Product Impact** peaks at the learner loop, which has not started.
- **Resources** peaks at the resource and content agents, which are the two
  slices most likely to be built next.
- **Complexity** peaks at infrastructure that produces no learner-visible value.
- **Content Quality** is dominated by two things: the evaluator rubrics and the
  human checkpoints — not by how much content gets generated.

## 2. Engineering Effort

**Where the effort has gone.** The five closed slices (#30–#34) bought the
hardest-to-retrofit thing in the system: a typed, ordered, block-based content
model with a reference system and a public renderer. That was the right thing to
spend first. A single markdown blob per Lesson could not have supported
interactivity, per-block provenance, attempts, or block-level regeneration; every
later phase would have had to pay for the migration anyway, with more data in
flight.

**Where the effort is going.** #36–#40 is roughly six slices of pipeline work of
which only #40 is directly visible to any user. #36 in particular is pure
infrastructure — a graph skeleton, a checkpointer, two LLM seams, an execution
model. Its effort is justified only because #37–#40 all sit on it.

**Effort risks worth naming:**

1. **#38 is underestimated in the PRD.** It is written as one slice but contains
   four independently failing subsystems: a provider abstraction, a Tavily
   client, YouTube Data API chapter parsing, and transcript-plus-LLM segment
   identification. Three of the four depend on third-party behavior that is not
   under the team's control and not stable over time. Expect this slice to cost
   more than #37 and #39 combined.
2. **#40 is a large frontend build described in one paragraph.** Two distinct
   review screens, inline tree editing, block editors reused from #35, inline
   evaluator annotations, per-block regeneration, and status polling. It has a
   hard dependency on #35 shipping first — the block editors are shared.
3. **The current working tree does not import** (details in section 7), so
   effort estimates are currently unverifiable by running anything.

**Effort savings available.** #35's block editors, #40's checkpoint-2 editors,
and any future interactive block editor are the same component family. Building
#35's editors as standalone, controlled components — payload in, payload out, no
knowledge of whether they are editing a saved Course or an in-flight
`GenerationRun` — makes #40 substantially cheaper. This is the single highest
-leverage structural decision left in the pipeline work.

## 3. Product Impact

**The uncomfortable finding.** Everything currently in flight improves how
Learnesia *produces* content. Nothing currently in flight improves what a learner
*gets*. The product promise — learn by readiness, not grade level — requires
knowing what a learner knows, and the system records no learner evidence
whatsoever: progress is client-side, quiz results are not persisted server-side,
and exercises have no submission by design.

Ranked by impact on the promise:

1. **Learner loop (Phase 1)** — the only workstream that makes the promise
   partially true. Everything else is upstream of it.
2. **Resource layer (#38)** — the clearest differentiator that exists today.
   "Native-language scaffolding around the world's best free resources" is a real
   position; nothing else in the plan is as hard for a generic AI course
   generator to copy.
3. **Checkpoint UI (#40)** — high impact for a non-obvious reason: without it the
   pipeline is unusable, so #36–#39 have exactly zero product impact until it
   ships. It is not a nice-to-have front end on top of the pipeline; it is half
   of the pipeline.
4. **Content Agent (#39)** — determines whether generated lessons are worth
   reading at all.
5. **Admin authoring (#35)** — modest ceiling but immediate: it is the only way
   to get good content into the system while the pipeline is unfinished, and it
   de-risks the whole pipeline bet by making the platform useful without it.
6. **Knowledge graph, procedural templates, Go** — real long-term impact,
   negligible near-term.

**Impact per unit of effort** favors #35 and #40 heavily, and disfavors #36.
That is not an argument against #36 — infrastructure has to exist — but it is an
argument for keeping #36 minimal and resisting the temptation to build a general
orchestration framework.

## 4. Resources

This is the axis the PRD says the least about, and the one most likely to cause
an unpleasant surprise.

**Token spend.** The two-seam split (~90% generation, ~10% evaluation) is a good
design, but the volumes are unbounded. A single course run is: one outline call
(+ up to 2 retries), one search-analysis call per Lesson, potentially one
transcript-analysis call per video, one content call per Lesson (+ up to 2
retries), and one evaluation call per lesson-content batch. For a 5-module course
with 4 lessons each, worst case with full retries, that is well over a hundred
model calls, several of them carrying full transcripts. **There is no per-run
budget cap in the design.** Add one: a token or currency ceiling on
`GenerationRun`, checked between nodes, that degrades to a human checkpoint the
same way retry exhaustion does.

**Third-party quota.** YouTube Data API's free tier is 10,000 quota units/day,
and `videos.list` is 1 unit — generous. The real constraint is
`youtube-transcript-api`, which scrapes rather than using an API: it is rate
limited by IP, frequently blocked from datacenter IPs, and unavailable for many
videos. Tavily is metered and paid. Plan for the transcript path to fail
routinely, not exceptionally — the design already degrades correctly, but the
*rate* of degradation will be higher than the PRD implies, which means more
videos reaching admins without timestamps.

**Human review minutes — the real bottleneck.** Every run requires an admin at
two checkpoints. Section 9.4 of the vision document calls for risk-based review;
v2 applies mandatory full review to everything. That is correct for now and
should not change until there is data, but it means **content throughput is
bounded by admin hours, not by pipeline speed.** Any argument that the pipeline
increases content volume is only true up to that ceiling. Measure human edit
distance at both checkpoints from the first run; it is the input to every later
decision about relaxing review.

**Infrastructure.** Modest and appropriate: Postgres, ASGI, no queue, no Redis,
no Celery. The one missing dependency (`langgraph-checkpoint-postgres`) is the
difference between durable and non-durable pauses.

**Team.** The plan is written as if several workstreams can proceed in parallel.
The dependency chain #35 → #40 and #36 → #37/#38/#39 → #40 is mostly serial. A
small team should expect the pipeline half of #29 to dominate the schedule.

## 5. Complexity

**Complexity that is earned:**

- The Content Block registry. Single table, discriminator, JSON payload, one
  nullable FK for the relational outlier. Adding a type is a registry entry plus
  a renderer. This is close to the minimum complexity that supports the goal.
- The `Reference` / `LessonCitation` split. Normalizing sources so one Reference
  serves many Lessons, with a nullable `content_block` FK reserved for later, is
  a small cost now that avoids a migration later.
- Evaluators as advisory with bounded retries and degradation to a human. This
  removes an entire class of failure — the pipeline cannot dead-end — for very
  little machinery.

**Complexity that is not yet earned:**

- **LangGraph for a linear graph.** The pipeline is a straight line with two
  pause points and two bounded retry loops. LangGraph brings a state graph, a
  checkpointer protocol, `interrupt()` semantics, and a resumption model. It is
  already a dependency and the state-persistence machinery is genuinely useful
  for durable pauses, so this is not a recommendation to remove it — but the
  team should be able to state what LangGraph provides that a state machine over
  `GenerationRun.status` plus explicit resume endpoints would not. If the answer
  is only "durable checkpoints," that is a narrow benefit for a broad dependency.
- **Async background tasks on the ASGI loop.** This is the sharpest complexity in
  the design: it looks simple and behaves subtly. A restart or deploy mid-node
  silently abandons an in-flight run; there is no cancellation, no timeout, no
  retry-on-crash, and no visibility into a task that has died. The mitigation is
  cheap — make the executor an interface with one implementation now — so that
  replacing it with a queue later is a swap rather than a rewrite.
- **Three-path timestamp extraction.** Chapters → transcript+LLM → empty is three
  code paths, each with distinct failure modes, for a field that is a
  nice-to-have. Consider shipping paths one and three first, and adding the
  transcript path only if admins report that missing timestamps are actually
  costing them review time.

**Complexity that is missing and will be needed:** content versioning. Editing
approved Drafts in place is simple now and becomes a correctness problem the
moment a published course has learners whose progress points at blocks that
change underneath them.

## 6. Content Quality

**What v2 genuinely improves:**

- **Structure forces pedagogy.** A Lesson that must be composed of typed blocks
  is harder to fill with undifferentiated prose than a markdown textarea. The
  "video is never standalone" rule is the clearest example — it encodes a real
  teaching practice as a schema constraint an evaluator can check.
- **Sources are first-class.** Citations make claims checkable. This is the
  single biggest defense against the failure mode that kills AI-generated
  educational content: confident, unsourced, subtly wrong explanations.
- **Curation over authorship.** Building lessons around vetted existing videos
  and articles, with generated native-language scaffolding, produces better
  material than generating everything from model priors — and is honest about
  where the value is.
- **Two independent human checkpoints.** Today these, not the evaluators, are
  what actually protects quality.

**Where the quality story is weaker than it looks:**

1. **The evaluators are LLM judges scoring free-text rubrics.** They will
   correlate with the generator more than the two-seam split implies, and they
   are strongest at exactly the things that are easy to check mechanically
   (does every video block have adjacent text? is a timestamp present on a long
   video?) and weakest at the thing that matters most (is this explanation
   *correct*). **Move every mechanically checkable rubric item into deterministic
   validation** and let the LLM evaluator spend its judgment on pedagogy and
   factual consistency.
2. **"Factual consistency with gathered References" is not entailment.** The
   Content Evaluator sees the reference list, not the reference *contents*.
   Without fetching and passing source text, this checks plausibility, not
   support. This is the gap that the nullable `LessonCitation.content_block` FK
   eventually closes.
3. **Bahasa Indonesia quality rests on one prompt sentence.** "Preserve technical
   terms as Indonesian practitioners use them" is the right rule, but a
   prompt-level rule is not a quality gate. Language naturalness is listed as a
   gate in the vision document and implemented nowhere. For an Indonesia-first
   product this is the most under-invested quality dimension in the plan — and
   the hardest for the evaluator LLM to judge if that model is stronger in
   English.
4. **Resource quality is search quality.** If Tavily returns a mediocre video,
   every downstream step faithfully scaffolds a mediocre video. Nothing in the
   pipeline judges whether a *found resource is good* — only whether the prose
   around it is well-formed. A resource-quality rubric (is the source
   authoritative? is it current? is the video actually about this objective?) is
   missing and is arguably more important than the content rubric.
5. **No feedback from learners to content.** `LessonFeedback` exists; nothing
   routes it into a review queue. Until published content generates defect
   reports that reach an editor, quality is measured only at generation time,
   which is exactly when the least is known.

**Highest-value quality additions, in order:**

1. Deterministic validators for every mechanically checkable rubric item.
2. A resource-quality rubric in the Resource Agent, before content is written.
3. An admin override to supply a resource URL by hand when search disappoints.
4. Fetching reference text so the Content Evaluator can check actual entailment.
5. A learner-report queue wired to `LessonFeedback`.

## 7. Immediate blockers

Two defects in the current working tree, unrelated to the merits of the plan:

1. **The backend does not import.** `views.py` references `GenerationRun` and
   `GenerationRunSerializer` in `GenerationRunViewSet` without importing them,
   raising `NameError: name 'GenerationRun' is not defined` at URLconf import.
   This fails the *entire* test suite, not only the generation-run tests. The
   viewset is also not registered in `urls.py`, while `test_generation_run_api.py`
   requests `/api/generation-runs/`.
2. **The admin create-course page imports functions that do not exist.**
   `create-course/page.jsx` imports `createModule` and `createContentBlock` from
   `@/services/api`; neither is defined anywhere in `frontend/src`, and
   `hierarchyApi.test.js` imports them from a module that does not exist.

Both are small. Both must be fixed before any of the estimates above can be
validated by running the suite.

## 8. Recommendations

1. **Fix the two import defects and get the suite green.** Nothing else can be
   trusted until then.
2. **Ship #35 before #40**, and build its block editors as standalone controlled
   components so #40 reuses them rather than reimplementing them.
3. **Add a per-run cost ceiling to `GenerationRun`**, enforced between nodes,
   degrading to a human checkpoint on exhaustion — the same shape as the existing
   retry-exhaustion behavior.
4. **Wire the Postgres checkpointer** (and add the missing dependency) as part of
   #36, or accept and document that pauses do not survive a restart.
5. **Put the executor behind an interface** so the `asyncio` model can be swapped
   for a queue without touching pipeline code.
6. **Move mechanical rubric checks out of the LLM evaluators** into deterministic
   validation.
7. **Add a resource-quality rubric and a manual-URL override** to #38.
8. **Instrument from the first run:** per-seam token spend, first-attempt
   evaluator pass rate, retry-exhaustion rate, and human edit distance at both
   checkpoints.
9. **Hold the line at the Phase 3 gate.** Finish #35–#40, prove the pipeline on
   one narrow domain, then build the learner loop before generating more catalog.
10. **Do not start the Go migration.** Its trigger conditions are documented in
    §11.4 of the vision document, and none of them is met.
