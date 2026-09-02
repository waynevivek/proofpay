# Team Split — Backend / Frontend

Two-part split across the team.

## Backend
Owns everything up to and including the reconciliation result — nothing the user sees directly.

- FastAPI app, DB models, transaction CRUD (per API_CONTRACTS.md)
- Document extraction pipeline (OCR + LLM extraction into DATA_MODEL.md shapes)
- Reconciliation engine — rules.py (exact-match checks) + llm_reason.py (ambiguous cases) + scoring.py
- Acceptance Pack assembly and draft message generation
- Synthetic data generator script and all fixture data

**Deliverable:** every endpoint in API_CONTRACTS.md working end-to-end against real data,
producing a correct `ReconciliationResult` for all 5 synthetic scenario categories.

## Frontend
Owns everything the user sees and interacts with.

- Upload flow (select/attach documents, create a transaction)
- Transaction dashboard (list view, status/verdict at a glance)
- Transaction detail page — document cards, "Run reconciliation" action
- Acceptance Pack UI — verdict badge, readiness gauge, source-linked flags, draft message box
- Human-approval gate on any outgoing message (never auto-send)

**Deliverable:** a working UI that calls only the endpoints defined in API_CONTRACTS.md, with
no hardcoded/mocked data by the final demo.

## Where the two sides must agree

- The exact JSON shapes in DATA_MODEL.md and endpoint shapes in API_CONTRACTS.md — freeze these
  before either side starts building, and treat any change to them as a conversation, not a
  silent edit.
- Every flag the backend returns must carry `source_docs` — the frontend's whole job on the
  results screen is making that traceability visible, so this field can't get dropped or
  simplified away under time pressure.
