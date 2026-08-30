# Domain Docs Configuration

## Layout

This repository uses a **single-context** domain docs layout.

- Root domain context: `CONTEXT.md`
- Architecture decisions: `docs/adr/`

## Consumer rules for agent skills

Skills that rely on domain language or architectural history (for example: `improve-codebase-architecture`, `diagnose`, `tdd`) should:

1. Read `CONTEXT.md` first (if present) for domain terminology and shared language.
2. Read relevant ADRs in `docs/adr/` before proposing structural changes.
3. Prefer terminology from `CONTEXT.md` when naming modules, files, and issues.

## Maintenance notes

- Keep `CONTEXT.md` concise and current with project language.
- Add new ADRs to `docs/adr/` for meaningful architectural decisions.
