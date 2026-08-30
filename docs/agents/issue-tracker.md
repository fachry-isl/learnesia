# Issue Tracker

## System of record

This repository uses **GitHub Issues** as the source of truth for planned work and bug tracking.

- Repository: `fachry-isl/learnesia`
- Primary interface: `gh` CLI
- Web UI: GitHub Issues page for this repository

## How agent skills should use it

Skills that create, triage, or update issues (for example: `to-issues`, `to-prd`, `triage`, `qa`) should use GitHub Issues via `gh` commands.

Examples:
- Create issue: `gh issue create ...`
- Update labels/state: `gh issue edit ...`
- List/filter issues: `gh issue list ...`

## Notes

- Prefer existing labels and conventions in this repo.
- Do not create parallel local issue files for normal issue tracking.
