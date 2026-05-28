# Agent Guidelines

## Session Summary

At the end of each working session (when user says goodbye or indicates session is ending), automatically write a summary of changes to `changes/YYYY-MM-DD-HHMM-short-description.md`.

### Format
- **Filename**: `changes/YYYY-MM-DD-HHMM-short-description.md` (24h time, no colon — e.g. `2026-05-28-1222-seo-crawlability-metadata.md`)
- **Content**: Brief title, date, and bullet points of changes with root causes and solutions

### When to Write Summary
- User says "done", "bye", "finish", "exit", "selesai"
- Before closing out a session
- When `/summary` command is invoked

### When NOT to Write
- If no changes were made during the session
- If user explicitly says "don't save summary"

## Clarification Tool
When needing to clarify something with the user, **always use the `question` tool**, NOT `ask_question`. This is required for OpenRouter compatibility.