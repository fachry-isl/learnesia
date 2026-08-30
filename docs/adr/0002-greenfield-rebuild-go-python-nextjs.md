# Greenfield rebuild on Go, Python, and Next.js

Status: accepted (2026-08-30)

Learnesia is rebuilt from scratch as a Go domain backend, a Python pipeline
worker, and a TypeScript Next.js web application, replacing the Django/DRF
monolith. No data is migrated. The existing database, models, migrations, and
Django API are abandoned rather than strangled.

## Context

[`docs/product-vision-and-engineering-direction.md`](../product-vision-and-engineering-direction.md)
§11 previously specified a strangler migration: keep Django, build new domain
capabilities in Go, and cut endpoints over incrementally with parity tests and
shadow reads. §11.4 listed trigger conditions and stated that none was met.

That recommendation rested on a premise that no longer holds. It assumed
migration cost dominated by preserving live behavior and live data. In fact the
product has **no users and no data worth keeping**, and the team has explicitly
accepted rewrite cost in exchange for landing directly on the target
architecture.

A strangler migration is a technique for changing a system you cannot stop. This
system can be stopped. Paying for dual-write discipline, parity tests, shadow
reads, and cutover flags — the entire cost of the technique — buys nothing when
there is no traffic to protect and no data to preserve.

The counter-argument from the vision document still stands and is recorded here
rather than dismissed: *"A big-bang rewrite is not recommended while the product
model is changing."* The product model **is** still changing. The mitigation is
that the domain language is not: [`CONTEXT.md`](../../CONTEXT.md) and the block
payload schemas are carried across verbatim, so the rewrite changes the stack,
not the vocabulary. What is being discarded is an implementation, not a design.

## Decision

### Three deployable units

```text
apps/web        Next.js (TypeScript, App Router) — public site and admin
apps/api        Go — HTTP API, domain logic, sole owner of Postgres
apps/pipeline   Python — LangGraph generation worker, no domain-table access
```

### Go owns every domain write

`apps/api` is the only process that writes domain tables. This is the vision
document's one-writer rule (§10.2) applied from day one rather than negotiated
during a cutover. Go owns the schema and the migrations.

### Python is a worker behind a job boundary, not a service

`apps/pipeline` exists because LangGraph, `youtube-transcript-api`, and the LLM
tooling ecosystem are genuine Python strengths — the reason the vision document
(§11.1) always kept a Python worker boundary. It has no public HTTP surface and
no ORM access to domain tables.

- **Dispatch:** a Postgres-backed job table written by Go. The worker claims jobs
  with `SELECT … FOR UPDATE SKIP LOCKED` and is woken by `LISTEN`/`NOTIFY`. No
  Redis, no Celery, no broker.
- **Results:** the worker writes nothing to domain tables. It calls back into
  Go's internal API with a service token. Payload validation therefore happens
  once, in Go, at the boundary where it already has to happen for admin writes.
- **Graph state:** LangGraph checkpoints live in a dedicated `pipeline` Postgres
  schema owned by Python. Domain tables are never joined to it.
- **Checkpoints:** when the graph interrupts, the worker reports the pause to Go,
  which moves the `generation_run` into the matching `awaiting_*_approval` state
  and serves the review UI. Approval enqueues a resume job carrying the human's
  edited payload and the LangGraph thread id.

The seam is a job contract, not a shared database. Either side can be replaced
without touching the other, and the pipeline can be run, retried, or killed
without risk to domain data.

### Frontend: a new app that ports proven components

The existing frontend is already Next.js 16 on React 19 with Tailwind 4. It is
not, however, a Next.js *application*: it is a client-side React app with
`use client` throughout, axios data fetching, and no TypeScript.

`apps/web` is a new App Router application in TypeScript that uses server
components for catalog and lesson reads. The recently built and tested block
renderers, admin block editors, and sources list are **ported**, not rewritten —
they are weeks old, covered by tests, and encode block-type behavior that
survives the rewrite.

### Carried across unchanged

- [`CONTEXT.md`](../../CONTEXT.md) — the domain language, verbatim. "Experiment
  wildly" applies to the stack, not the vocabulary.
- The block payload schemas for `text`, `video`, `quiz`, and `exercise`.
- [ADR-0001](0001-hybrid-single-table-content-blocks.md)'s storage shape —
  a single table, a `block_type` discriminator, a `jsonb` payload validated in
  the application layer, and a nullable quiz FK. The rationale is unchanged by
  the language change; only the validation library differs.
- PRD #29's implementation decisions: the pipeline flow, the two LLM seams, the
  `ResourceProvider` interface, evaluator degradation to a human checkpoint, and
  prompts and rubrics as flat files.

### Discarded

- The Django/DRF backend, its models, its migrations, and its database contents.
- The v1 → v2 data migration (§5.9) — there is nothing to migrate.
- The strangler sequence and its trigger conditions (§11.2, §11.4).
- `Lesson.lesson_content` and the legacy-markdown renderer fallback. Blocks are
  the only representation from the first row written.
- The legacy single-shot generation endpoints on the Course, Lesson, and Quiz
  viewsets.
- Issues #35–#40 as currently scoped, and the two import defects filed in #48 —
  both live in code that no longer has a future.

### Corrected sequencing

The greenfield build order fixes the finding that motivated this review: the
learner loop ships **before** the content factory, not after it. Attempts,
deterministic scoring, and server-side progress are an early slice. Nothing in
the previous plan produced a single row of learner evidence, and no amount of
generated content substitutes for it.

## Considered Options

- **Strangler migration (the previous plan).** Correct for a system with users
  and data. Here it would spend most of its cost on dual-write discipline,
  parity tests, and cutover machinery protecting traffic that does not exist.
- **Keep Django, add a Python pipeline worker only.** Cheapest, and defensible —
  the pipeline is the actual bottleneck and Django is adequate for CRUD. Rejected
  because the team wants the typed domain contracts and the attempt-processing
  concurrency story that Go provides, and the cost of switching is never lower
  than it is today with zero users.
- **Go only, no Python.** Simpler operationally — one backend language, one
  deployment. Rejected: LangGraph, transcript extraction, and the LLM tooling
  ecosystem have no equivalent in Go, and reimplementing graph orchestration is
  exactly the undifferentiated work a rewrite should avoid.
- **Python only (FastAPI), no Go.** Also simpler, and keeps one language across
  API and pipeline. Rejected for the same reason the vision document chose Go:
  typed domain contracts and cheap concurrency for attempt and mastery
  processing, which is where the product's write volume will concentrate.
- **Rewrite the frontend from zero.** Rejected as waste: the block renderers and
  admin editors are new, tested, and encode decisions that survive. Porting them
  into a TypeScript App Router application captures the benefit without
  rebuilding known-good UI.

## Consequences

- **The trigger-condition framing in §11.4 is void.** The migration is not
  waiting on measured pressure; it is happening because the switching cost will
  never be lower.
- **Two backend languages** means two toolchains, two test runners, two
  deployment artifacts, and a contract between them that must be versioned. This
  is the main ongoing cost of the decision.
- **The job table is the integration point.** It must be treated as an API:
  versioned payloads, explicit states, idempotency keys, and bounded retries. A
  sloppy job contract reintroduces the coupling this design exists to avoid.
- **There is a period with no working product.** Until the Go content domain and
  the web app reach parity with what exists today, nothing is deployable. This is
  acceptable only because there are no users; it stops being acceptable the
  moment there are.
- **Review findings become cheap.** The per-run cost ceiling, the executor
  interface, deterministic rubric validation, and the resource-quality rubric
  were all follow-up work against the Django implementation. In a greenfield they
  are design inputs, not retrofits.
- **`CONTEXT.md` becomes load-bearing.** It is now the only artifact that
  survives the rewrite intact, and the sole guard against the product model
  drifting while the stack is rebuilt.
