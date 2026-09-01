# ProofPay — Pre-Planning Docs

**Build with भारत 2.0** · Team Zenith Innovator · ABES Engineering College, Ghaziabad
Problem statement: The Autonomous Pre-Dispute Invoice-Acceptance Agent for Indian MSMEs

## What this is

ProofPay is an evidence-first payment verification layer for MSMEs. Instead of just checking
whether an invoice is well-formed, it checks whether the *transaction behind it* is fully
supported — by cross-referencing the Purchase Order, Goods Receipt Note, delivery proof, and
acceptance documents against the invoice — and flags mismatches or missing evidence before
the invoice is ever submitted for payment.

> Accounting software records the transaction. Payment systems move the money.
> ProofPay checks whether the evidence is strong enough for that money to move.

## How to use these docs

Read in this order before writing any code:

1. **ARCHITECTURE.md** — the pipeline, the monorepo layout, how the pieces connect
2. **DATA_MODEL.md** — the exact shape of every document and result object; everyone codes against this
3. **API_CONTRACTS.md** — the REST endpoints; backend and frontend both freeze against this on day 1
4. **TEAM_ROLES.md** — the backend/frontend split
5. **SYNTHETIC_DATA_PLAN.md** — the test fixtures everyone builds and demos against
6. **BUILD_TIMELINE.md** — the 24-hour hour-by-hour plan

## Non-negotiables for the hackathon build

- **Freeze the data model and API contract in hour 0–2.** Every downstream delay in past
  hackathons has come from schemas changing mid-build. If a field needs to change, it's a
  5-minute conversation before anyone codes around it, not a silent change.
- **Human-in-the-loop stays real, not just a pitch line.** No automated email/WhatsApp send
  without an explicit approve action in the UI — this is both a differentiator and a trust
  requirement judges will probe.
- **Demo against synthetic data only.** Do not attempt real OCR on scanned/handwritten
  documents as a live risk during the pitch — that's flagged as a known limitation, not a
  built feature, for this version.
- **Every flag must be source-linked.** If the reconciliation engine says "8 units unsupported,"
  the UI must show which document and which field that came from. This is the core USP —
  don't let it slip during crunch.

## Run locally

Start the API and frontend in separate terminals:

```bash
cd backend
PYTHONPATH=. python -m uvicorn app.main:app --reload --port 8000
```

```bash
npm install
npm run dev
```

The frontend uses `http://localhost:8000/api/v1` by default. Set
`NEXT_PUBLIC_API_BASE_URL` when the API runs elsewhere. From **New Acceptance Check**, choose
one of the synthetic scenarios or import a normalized transaction JSON fixture; the UI then
uploads the documents, creates the transaction, reconciles it, and displays the API result.

Useful checks:

```bash
npm run typecheck
npm run test:backend
npm run build
```
