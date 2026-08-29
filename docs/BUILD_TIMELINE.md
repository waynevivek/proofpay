# 24-Hour Build Timeline

Blocks assume a 24-hour offline hackathon. Adjust start time to actual kickoff. Structured
around the Backend / Frontend split in TEAM_ROLES.md.

## Hour 0-2 — Lock the foundation
- Whole team: finalize DATA_MODEL.md and API_CONTRACTS.md together — no code until agreed.
- Scaffold the monorepo per ARCHITECTURE.md.
- Backend starts the synthetic data generator script.

## Hour 2-6 — Skeletons
- Backend: FastAPI app boots, DB models exist, `/transactions` CRUD works against an empty DB.
  Extraction pipeline runs on one clean synthetic PO and returns the right JSON shape.
- Frontend: Upload page and Dashboard page exist and can hit a mock API matching API_CONTRACTS.md.
- Backend: synthetic "clean match" category fully generated.

## Hour 6-10 — First working reconciliation
- Backend: rules.py catches quantity, price, and date mismatches on structured JSON input
  (test directly against DATA_MODEL.md fixtures before wiring to real extraction).
- Backend: extraction output wired into the DB via `/documents/upload`.
- Backend: remaining 4 synthetic categories generated.

## Hour 10-14 — End-to-end for one scenario
- Full pipeline works for the "quantity mismatch" scenario: upload → reconcile → readiness
  score → flags with source_docs populated.
- Backend: LLM reasoning layer for ambiguous field matching + draft message generation.
- Frontend: TransactionDetail page renders real ReconciliationResult data.

## Hour 14-18 — All scenarios, dashboard polish
- All 5 synthetic categories work end-to-end through the real pipeline.
- Frontend: Acceptance Pack UI complete — verdict badge, readiness gauge, flags list, draft
  message box.
- Frontend: dashboard lists all transactions with status/verdict at a glance.

## Hour 18-21 — Test, fix, harden
- Run all 20-25 synthetic fixtures through the full pipeline; fix scoring/extraction bugs.
- Confirm the 3 demo-reserved transactions (see SYNTHETIC_DATA_PLAN.md) match the PPT's numbers
  exactly.
- Cut anything unstable — a smaller reliable demo beats a bigger flaky one.

## Hour 21-24 — Rehearsal and buffer
- Full run-through of the live demo, timed.
- Prepare answers for the two likely judge questions: handwritten/scanned documents, and
  differentiation from existing AP/reconciliation tools — both already answered in
  ARCHITECTURE.md's limitations table and the PPT's positioning slide.
- Buffer time for anything that slipped.
