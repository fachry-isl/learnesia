# Learnesia

Learnesia is an AI-powered platform that curates freely-available internet resources into structured, curriculum-ready courses. The AI is a curator and orchestrator — it finds the best existing resources, structures them into a coherent learning path, and generates supporting content around them in the learner's native language. Indonesia-first, default Bahasa Indonesia.

## Language

### Course structure

**Course**:
A complete, self-contained learning offering on a single subject. Always composed of one or more **Modules**.

**Module**:
An ordered grouping of **Lessons** within a **Course** that covers a coherent sub-topic. Every Course has at least one Module, including short courses — "short" just means few Modules, not a different kind of Course.
_Avoid_: Section, Unit, Chapter.

**Lesson**:
The leaf learning unit inside a **Module** — the thing a learner works through. A Lesson is an ordered sequence of **Content Blocks**; it is no longer a single markdown body.
_Avoid_: using "Module" to mean a Lesson.

**Content Block**:
A single typed, ordered piece of a **Lesson**. Its type determines how it is authored, generated, evaluated, and rendered. The canonical block types are **Text**, **Video**, **Quiz**, and **Exercise**. There is no "Article" block — external articles are **References**.
_Avoid_: Section, Element, Widget.

**Text block**:
Authored or generated prose (markdown). The default learning content.

**Video block**:
An embedded video (e.g. YouTube) the learner watches inline as primary content. Supports optional `start` and `end` timestamps (seconds) to scope to the relevant segment. Must always have at least one adjacent **Text block** for scaffolding — priming ("watch for X") before, or debriefing ("building on what you saw…") after, or both. A Video block is never standalone. Distinct from a **Reference** of type video, which is supporting material, not primary flow.

**Quiz block**:
A graded check of multiple-choice questions, each with one correct option. A Lesson may contain more than one Quiz block (the old one-quiz-per-Lesson constraint no longer holds).

**Exercise block**:
A prompt-only practice task with an optional revealable sample solution and optional hints. The learner works through it on their own and self-checks — there is no submission, no grading, no backend round-trip. Distinct from a **Quiz block**, which is auto-graded multiple choice.
_Avoid_: using "Quiz" and "Exercise" interchangeably.

### References

**Reference**:
A record of an external source — its URL, title, and source type (link / document / video). Standalone entity; one Reference can be cited by many Lessons. Replaces the legacy `LessonReference` model.
_Avoid_: Resource, Attachment, Link (as a noun for the record).

**Lesson Citation**:
A join between a **Lesson** and a **Reference**, carrying a `role` (citation or supplementary) and an optional **Content Block** FK for future block-level linking. Replaces the old direct FK from `LessonReference` to `Lesson`.

**Citation** (role):
A Lesson Citation whose role is `citation` — it backs lesson content ("this content was generated from / is supported by this source"). Surfaced as a per-Lesson "Sources" list. No inline `[n]` markers.

**Supplementary reference** (role):
A Lesson Citation whose role is `supplementary` — optional "further reading / learn more." Not a source of any specific claim.
_Avoid_: conflating supplementary references with citations — only citations make a provenance claim.

### Generation pipeline

**Generation Pipeline**:
The multi-agent flow that produces a Course draft: Outline Agent → Outline Evaluator → Human checkpoint → Resource Agent → Content Agent → Content Evaluator → Human checkpoint → Draft. Generation and evaluation can use different LLMs (see **Generation LLM** and **Evaluation LLM**).

**Outline Agent**:
Produces the `Course → Module → Lesson` skeleton, including each Lesson's objectives and its planned **Content Blocks**.

**Resource Agent**:
Gathers external learning resources for a Lesson via **explicit search** (through a **Resource Provider**) and turns them into **Video blocks** and **References/Citations** (articles). Runs **before** the Content Agent so prose is written around chosen resources. Its behaviour is identical regardless of which LLM backs the pipeline. For Video blocks, performs a two-step timestamp extraction after discovery: (1) fetch video metadata via YouTube Data API and parse chapter markers from the description; (2) if no chapters, fetch the transcript via `youtube-transcript-api` and use the LLM to identify the relevant segment. Timestamps are best-effort — if both fail, they are left empty and the **Content Evaluator** flags the video for human review.

**Resource Provider**:
A swappable, env-configured implementation of the search interface the **Resource Agent** uses. Default is Tavily; SearXNG (self-hosted) and Gemini grounding are alternates. Grounding is an opt-in optimization, not the canonical path — the canonical Resource Agent always does explicit search so the pipeline behaves the same under any LLM.

**Content Agent**:
Generates the authored **Content Blocks** (text, exercise, quiz) for a Lesson, working around the resources already gathered.

**Evaluator**:
An LLM step (using the **Evaluation LLM**) that scores an Outline or generated Content against a small, tunable rubric and sends revision notes back for regeneration (bounded retries, default 2). Advisory only: when retries are exhausted it **degrades to the next Human checkpoint** with the best attempt and unresolved notes attached — it never hard-fails the run. There are two: the Outline Evaluator (coverage, ordering, difficulty progression) and the Content Evaluator (objective alignment, factual consistency with References, reading level, and video integration — every Video block must have adjacent scaffolding text, and videos >10 minutes without timestamps are flagged for human review).

### Model configuration

**Generation LLM**:
The LLM used by the **Outline Agent**, **Resource Agent** (transcript analysis), and **Content Agent**. High volume (~90% of token spend). Optimized for cost/speed. Env-configured via OpenAI-compatible `base_url` + `model` + `api_key`. Default: cheaper model via 9router (e.g. Gemini Flash, GPT-4o-mini).

**Evaluation LLM**:
The LLM used by the **Outline Evaluator** and **Content Evaluator**. Low volume (~10% of token spend) but disproportionately affects quality — a different model avoids "self-review" bias. Optimized for reasoning/judgment. Env-configured separately from the Generation LLM. Default: stronger model via 9router (e.g. Claude Sonnet, GPT-4o). Both seams can point at the same model when the split isn't needed.

**Human checkpoint**:
A point where the pipeline pauses for an admin to review, edit, and approve before continuing. There are two: after the outline is evaluated, and before the final draft is persisted. A pause is durable — it may last minutes or days.

**Generation Run**:
A single execution of the **Generation Pipeline** for one Course. A durable record tracking its status (e.g. awaiting outline approval, generating content, failed, completed) and linking to the resulting Course. Distinct from the orchestrator's internal checkpoint state, which stores how to resume the graph.

### Language

**Course language**:
A field on **Course** (default: Bahasa Indonesia) that governs the language of all **pipeline-generated content** — text blocks, quiz questions, exercise prompts. Does **not** constrain the **Resource Agent**, which searches language-agnostically for the best resource regardless of language. Course-level only; not set per Module or Lesson. A separate-language version of a course is a separate Course.
_Avoid_: setting language at the Module or Lesson level.

### Course lifecycle

**Draft**:
A Course that exists but is not visible to learners. All courses start as Draft — including those still being generated by the pipeline. Fine-grained pipeline progress lives on the **Generation Run**, not on the Course itself.

**Published**:
A Course visible to learners on the public catalog. Only an admin can publish a Draft.

## Flagged ambiguities

- **"Module" in legacy code/UI**: Older prompts (Pydantic `LessonStructure` description) and the public course page label Lessons as "Modules". Canonically, **Module is the grouping above Lesson**. Legacy usages should be migrated.
- **"Template" status (legacy)**: The old `template` status is removed. Existing `template` rows migrate to `draft`. The word "template" implied reusability, which was never the actual behavior.

## Example dialogue

> **Dev**: When the pipeline generates a long course, what's the top thing it produces?
> **Domain expert**: A Course, broken into Modules. Each Module is just an ordered set of Lessons on a coherent sub-topic — even a tiny course has at least one Module.
> **Dev**: And a Lesson is the markdown page?
> **Domain expert**: Not anymore. A Lesson is an ordered list of Content Blocks. Some blocks are prose, some are videos, some are quizzes. The quiz isn't a separate thing hanging off the Lesson — it's just one block in the sequence.
> **Dev**: Where do the YouTube videos come from?
> **Domain expert**: The Resource Agent searches for them via Tavily before the Content Agent writes anything. That way the prose is written *around* the chosen video, not duplicating it. The video becomes a Video block in the lesson; the article sources become Citations in the Sources list.
> **Dev**: What if the Evaluator keeps rejecting the outline?
> **Domain expert**: It retries twice. If it still fails, it passes the best attempt through to the admin with the evaluator's complaints attached. The pipeline never dead-ends — the human checkpoint is the backstop.
> **Dev**: Can I still create a course by hand?
> **Domain expert**: Yes. The pipeline is for "generate from an idea." Manual creation is for "I already have content." Same schema either way — Course, Modules, Lessons, Blocks.
