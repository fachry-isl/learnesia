# Hybrid single-table storage for Content Blocks

Status: accepted

Lesson content is decomposed into an ordered list of typed Content Blocks (text, video, quiz, exercise). We store all block types in a single `ContentBlock` table with a `block_type` discriminator, a JSON `payload` field whose shape is validated per-type by an application-layer registry, and a nullable `quiz` FK used only when `block_type == 'quiz'` (preserving the existing `Quiz → QuizQuestion → QuestionOption` relational tree).

## Considered Options

- **Per-type tables** (multi-table inheritance or polymorphic): strong DB-level payload integrity, but every new block type requires a migration, a new serializer, and join changes. Fights the goal of making block types easy to add.
- **Pure JSON single table** (no quiz FK): simpler, but quizzes have a rich relational structure (questions with ordered options, each with `is_correct`) that benefits from relational integrity and existing code reuse. Flattening quizzes into JSON would re-implement what the DB already enforces.
- **django-polymorphic / generic relations**: more machinery than a closed, slowly-growing type set warrants.

## Consequences

- Adding a new JSON-shaped block type (e.g. `flashcard`) requires only a registry entry (payload schema + serializer fragment + renderer component) — no migration.
- Adding a new block type with its own relational tree (like quiz) requires a nullable FK column on `ContentBlock` — a migration, but a small one.
- Payload integrity for JSON-based types lives entirely in the application layer. A malformed payload is not caught by the database. Acceptable for an admin-authored system with a small editorial team.
