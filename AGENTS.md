<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes ? APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Repo-Local Skills

This repo vendors Matt Pocock's agent skills under `.codex/skills/`.

For build work, prefer these skills when they match the task:

- `tdd` for feature work and bug fixes that benefit from red-green-refactor.
- `qa` before handoff or when checking a completed change.
- `triage-issue` when debugging an unclear bug.
- `design-an-interface` when exploring UI, module, or API design options.
- `improve-codebase-architecture` for architecture and testability improvement passes.
- `domain-model` when clarifying recruitment, candidate, company, or allocation concepts.

See `.codex/skills/README.md` for the full vendored skill list and upstream attribution.
