# AGENTS.md

Instructions for any coding agent (Codex, etc.) working in this repository.

## Before writing any code

Read these in order, every session, before making changes:
1. `docs/ARCHITECTURE.md` — the pipeline and monorepo layout
2. `docs/DATA_MODEL.md` — exact JSON shapes for every document and result type
3. `docs/API_CONTRACTS.md` — exact endpoint paths, request/response shapes

Do not invent your own schema or endpoint shape if one already exists in these files, even if
you think a different shape would be cleaner. If a shape genuinely needs to change, update the
relevant doc in the same commit as the code change and explain why in the commit message —
never change a shape silently.

## Project structure

This is a two-part split: `backend/` and `frontend/`. See `docs/TEAM_ROLES.md` for what each
side owns. When working on one side, don't modify the other side's code unless the task
explicitly requires a contract change both sides need to agree on.

## Ground rules

- **Rules before LLM calls.** Exact-match checks (quantity, price, date) belong in
  `backend/app/reconciliation/rules.py` as deterministic code, not LLM calls. Reserve LLM
  reasoning (`llm_reason.py`) for genuinely ambiguous matching and draft message generation.
- **No auto-send.** Any outgoing communication (email, WhatsApp) must stop at a draft/approval
  step. Never wire a code path that sends a message without an explicit human approval action.
- **Every flag needs `source_docs`.** A reconciliation flag without a traceable source document
  and field is a bug, not an acceptable simplification — this is the product's core
  differentiator, not a nice-to-have.
- **No real OCR on messy/handwritten documents this version.** Extraction targets clean
  typed/PDF synthetic documents per `docs/SYNTHETIC_DATA_PLAN.md`. Don't spend time hardening
  OCR against handwriting or scans — that's an explicitly out-of-scope limitation for this build.
- **Skip auth/RBAC.** A single hardcoded demo user is enough. Don't build JWT/role-based access
  for this version — see the auth note in `docs/API_CONTRACTS.md`.

## Testing

Test against the synthetic fixtures in `data/synthetic/` (5 categories — see
`docs/SYNTHETIC_DATA_PLAN.md`). If a fixture doesn't exist yet for what you're testing, generate
it through `data/generator/generate_synthetic_docs.py` rather than hand-writing one-off JSON.

## When in doubt

Prefer the smaller, more reliable implementation over the more ambitious one — this is a
24-hour hackathon build (see `docs/BUILD_TIMELINE.md`), and a demo that works end-to-end on 3
scenarios beats one that half-works on 10.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
