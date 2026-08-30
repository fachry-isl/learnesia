# Interactive content blocks (future)

**Status:** Design reference from grilling session (2026-06-04)  
**Scope:** Next version — **not** [#34](https://github.com/fachry-isl/learnesia/issues/34) / [PR #47](https://github.com/fachry-isl/learnesia/pull/47)  
**Inspiration:** Brainly-style guided learning; interactions **authored/generated as structured data**, rendered by first-party React components.

## Decisions locked in session

| # | Question | Choice | Notes |
|---|----------|--------|-------|
| 1 | Generation contract: JSON vs HTML vs markdown-embedded widgets | **JSON → React renderers** | AI never emits learner-facing HTML. Prose stays in `text` blocks (markdown). |
| 2 | One `interactive` type vs many `block_type` values | **Separate types (A)** | e.g. `graph`, `calculator`, `step_solver`, `socratic`. Plan for many teaching patterns. |
| 3 | Learner input | **B — structured input, client-only** | Sliders, picks, sandboxed expressions, step reveal. No server grade in v1 (like `exercise`). |
| 4 | Gate lesson complete / next lesson? | **A — no gating** | Only `hasRead` + `quiz` matter (current `localStorage` model). Interactives are optional practice. |
| 5 | How AI JSON reaches published lessons | **Recommended: A** | Validate → attach to draft → existing course checkpoints. Not per-block review UI in v1. Not generate-at-read-time. |

## Recommendation summary (full grill)

### Core architecture (aligns with ADR-0001)

- Store each interactive as a normal `ContentBlock`: `block_type` + JSON `payload` (+ `schema_version` inside payload).
- Add Pydantic models in `backend/learnesia/content_blocks/registry.py` per type.
- Add Django `BLOCK_TYPE_CHOICES` entry + migration per new type (small).
- Add public renderer under `frontend/src/components/public/blocks/` + `case` in `ContentBlockSequence.jsx`.
- **Do not** store raw HTML, inline script, or `dangerouslySetInnerHTML` for lesson interactives.

**Why JSON is enough:** JSON holds *data and intent*; React holds *layout and behavior*. Markdown strings inside JSON fields (e.g. step explanations) are fine. Rich Brainly feel comes from **multi-block lessons** (text → graph → step_solver → quiz), not from model-owned DOM.

### Block type catalog (planned)

| `block_type` | Purpose | Payload sketch (v1) |
|--------------|---------|---------------------|
| `graph` | XY / function plot | `schema_version`, `x_range`, `y_range`, `series[]` (`expression` or `points`), optional `sliders[]` |
| `calculator` | Expression / numeric exploration | `schema_version`, `mode`, `initial`, optional `target` for self-check |
| `step_solver` | Brainly-like worked solution | `schema_version`, `prompt?`, `steps[]` (`title`, `body_md`, optional `check`) |
| `socratic` | Guided questioning | `schema_version`, `turns[]` (prompt, `choices[]`, `next` branch ids), max depth capped in schema |

**Future candidates** (same pattern): `flashcard`, `ordering`, `fill_blank`, `guided_practice`, `manipulative`.

**Explicitly different product (not “use HTML instead”):**

| Need | Approach |
|------|----------|
| Live AI tutor chat in lesson | Streaming API + session — not a static block |
| Free-text proof grading | Server/LLM endpoint — not block payload |
| Third-party embed (Desmos activity) | JSON `{ provider, embed_id \| state }` + iframe in **your** component |
| Arbitrary layout | Renderer layout props, not LLM HTML |

### Learner experience (B + A)

- **Input:** Numbers, MCQ, drag-order, sandboxed math expressions, “next step” — all client-side.
- **Feedback:** Show expected answer / reveal solution / highlight graph — no submit to API in v1.
- **Progress:** Do **not** require interactives for `quizPassed` or next-lesson unlock.
- **Optional UX (later):** Persist in same `localStorage` key as lesson progress (`interactiveCompleted: { blockId: true }`) for resume — **soft engagement only**, not gating.

### AI generation pipeline (recommended A)

1. Content Agent outputs **structured JSON per `block_type`** (tool call or JSON mode + schema in prompt).
2. Server validates via `validate_block_payload()`; reject/retry on failure.
3. Blocks saved on **draft** course at lesson `order`.
4. Human checkpoint at **course** level (existing pipeline) — spot-check rendered lesson in browser.
5. Publish serves static blocks (fast, cacheable, testable).

**Not recommended for v1:** Generate-at-read-time (C) — cost, latency, non-deterministic lessons, breaks caching.

**Per-block admin preview (B):** Defer until pain is proven; until then: seed commands + public lesson URL on draft.

### Scaffolding (mirror video rule from CONTEXT.md)

- Every `graph` / `calculator` / heavy interactive should have adjacent **`text`** blocks: prime before (“adjust *a* and notice…”), debrief after.
- Pipeline prompt: “never place `graph` alone between module boundaries.”

### Safety and validation

- **Never `eval()`** model-supplied strings. Use `mathjs` / `expr-eval` with whitelist, or pre-parsed AST.
- **Cap** `socratic` branches and `step_solver` step count in Pydantic `max_length`.
- **`schema_version`** on every payload; bump when breaking.
- Registry strict mode: unknown fields `forbid` (match `QuizBlockPayload` style).

### Implementation order (recommended)

1. **`step_solver`** — closest to Brainly MVP; reuses reveal/toggle patterns from `ExerciseBlock`; validates JSON + multi-block lessons.
2. **`graph`** — one library (e.g. Plotly or lightweight canvas); read-only series first, then sliders (B).
3. **`calculator`** — smaller UI; highest risk is expression parsing — ship after graph expression pipeline exists.
4. **`socratic`** — branch validation + UX; cap depth early.

Each ships with: registry + migration + renderer + `ContentBlockSequence` case + unit tests + `seed_*_demo_course` management command.

### Testing checklist (per block type)

- [ ] Registry accepts golden payload; rejects invalid / unknown type
- [ ] API CRUD creates block on lesson
- [ ] Public page renders in order with `data-block-type`
- [ ] Legacy lessons without new types unchanged
- [ ] Seed command produces published demo for manual QA

### Out of scope for first interactive milestone

- Server-side grading (Q3-C) and progress gating (Q4-B/C)
- HTML / rich embed from LLM
- Admin WYSIWYG block editor (Django admin JSON is OK for QA)
- Generation pipeline changes until one block type works end-to-end manually
- Analytics / xAPI / per-learner block state on server

### Relationship to #34 / PR #47

- #34 delivered: `Course → Module → Lesson → ContentBlock` public UI for `text`, `video`, `quiz`, `exercise`, sources.
- This feature **extends** that sequence only — no hierarchy change.
- Track as **new issue** (e.g. “Interactive blocks: step_solver + graph + …”) with tracer bullets per `block_type`.

## Open questions (resolve before implementation issue)

| # | Question | Recommendation |
|---|----------|----------------|
| 6 | Persist in-progress step/Socratic state in `localStorage`? | **Yes, optional** — same blob as `lesson_progress_*`, does not gate navigation |
| 7 | Math in payloads: LaTeX strings? | **Yes** — render with KaTeX in block components; keep markdown in `body_md` fields |
| 8 | Graph library | **Plotly** or **uPlot** for v1 read-only; add sliders later. Desmos embed only if license/embed policy clear |
| 9 | Single “interactive” migration vs many | **Many migrations OK** — one choice per type; clearer than one mega-enum |
| 10 | Confirm Q5 at implementation kickoff | Default **A** unless admin editing pain appears |

## Example payloads (illustrative)

### `step_solver`

```json
{
  "schema_version": 1,
  "title": "Solve for x",
  "steps": [
    { "title": "Isolate the term", "body_md": "Subtract 3 from both sides…" },
    { "title": "Divide", "body_md": "Divide both sides by 2…" }
  ]
}
```

### `graph` (read-only v1)

```json
{
  "schema_version": 1,
  "x_range": [-5, 5],
  "y_range": [-5, 5],
  "series": [
    { "label": "y = x²", "expression": "x^2" }
  ]
}
```

### `socratic` (branch cap e.g. 8 turns)

```json
{
  "schema_version": 1,
  "start": "t1",
  "turns": [
    {
      "id": "t1",
      "prompt": "What do you think happens if we double the rate?",
      "choices": [
        { "label": "It doubles", "next": "t2" },
        { "label": "It quadruples", "next": "t3" }
      ]
    }
  ]
}
```

## Dialogue recap (grill-me)

- **JSON vs HTML?** → JSON + renderers (A).
- **One type or many?** → Many `block_type` values (A) — roadmap includes graph, calculator, step_solver, socratic, more.
- **Is JSON enough?** → Yes for listed patterns; chat-at-read-time and server grading are separate features.
- **Learner input?** → Structured, client-only (B).
- **Lesson gating?** → No (A).
- **AI → published?** → Static validated JSON at draft time (A recommended); user did not object.

## References

- [ADR-0001: Hybrid single-table content blocks](../adr/0001-hybrid-single-table-content-blocks.md)
- [CONTEXT.md](../../CONTEXT.md) — block vocabulary, exercise vs quiz, video scaffolding
- Issue [#34](https://github.com/fachry-isl/learnesia/issues/34), PR [#47](https://github.com/fachry-isl/learnesia/pull/47) — foundation only
