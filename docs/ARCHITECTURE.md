# Architecture

## Pipeline

```
Upload → OCR / Extraction → Structured JSON → Reconciliation Engine → Scoring → Acceptance Pack
                                                      ↑
                                    rules first, LLM reasoning only for ambiguous cases
```

Every document type (PO, Invoice, GRN, delivery proof, acceptance proof, GST info), regardless
of its original format, is extracted into the same normalized shape before anything else
happens. The reconciliation engine never touches raw text or raw file content — only the
normalized structured fields. This is what keeps the reconciliation logic testable and fast,
and what lets the demo run instantly on synthetic data even before OCR is fully built.

### Why rules-first, LLM-second
Quantity/price/date mismatches are exact-match problems — a rule engine catches them instantly,
deterministically, and cheaply. The LLM's job is reserved for judgment calls a rule engine can't
make on its own: e.g. "does this delivery note description plausibly match this invoice line
item" when wording differs, or drafting the human-readable clarification message. Keeping the
LLM out of the exact-match path also makes every core mismatch a hackathon judge can verify by
eye against the input data — no "trust the AI" moments during the demo.

## Monorepo layout

```
proofpay/
├── backend/
│   ├── app/
│   │   ├── main.py                     # FastAPI app entrypoint
│   │   ├── api/
│   │   │   └── routes/
│   │   │       ├── documents.py        # upload + extraction endpoints
│   │   │       ├── transactions.py     # transaction CRUD
│   │   │       └── reconciliation.py   # run-check + acceptance-pack endpoints
│   │   ├── extraction/
│   │   │   ├── ocr.py                  # OCR wrapper (pytesseract or cloud OCR)
│   │   │   ├── llm_extract.py          # LLM-based structured field extraction
│   │   │   └── schemas.py              # Pydantic schemas for each doc type
│   │   ├── reconciliation/
│   │   │   ├── rules.py                # exact-match rule checks (qty, price, date)
│   │   │   ├── llm_reason.py           # ambiguous-case reasoning + draft messages
│   │   │   └── scoring.py              # payment readiness % calculation
│   │   ├── models/                     # SQLAlchemy ORM models
│   │   ├── db/                         # session, migrations
│   │   └── services/
│   │       ├── acceptance_pack.py      # assembles the final output object
│   │       └── draft_message.py        # clarification message generation
│   ├── tests/
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── Upload.jsx
│       │   ├── TransactionDetail.jsx
│       │   └── Dashboard.jsx
│       ├── components/
│       │   ├── DocCard.jsx
│       │   ├── ReadinessGauge.jsx
│       │   └── AcceptancePack.jsx
│       ├── api/                        # fetch wrappers matching API_CONTRACTS.md
│       └── App.jsx
├── data/
│   ├── synthetic/
│   │   ├── clean/
│   │   ├── qty_mismatch/
│   │   ├── price_mismatch/
│   │   ├── date_mismatch/
│   │   └── missing_evidence/
│   └── generator/
│       └── generate_synthetic_docs.py
└── docs/                               # this folder
```

## Scoring logic (payment readiness %)

Simple, explainable, judge-friendly — not a black-box ML score:

- Start at 100%.
- Each required evidence type missing (GRN, delivery proof, acceptance, GST info): −15% each.
- Quantity mismatch: proportional to the deviation, e.g. `(mismatched_qty / ordered_qty) × 100`
  weighted against a fixed penalty band, floor at a minimum score if evidence is otherwise clean.
- Price or date mismatch: fixed penalty per flagged field (e.g. −10% each).
- Floor at 0%, cap at 100%.

Keep the exact weighting adjustable in `scoring.py` as constants — this will need tuning once
real synthetic data is running through it, and judges may ask you to justify the weights, so
keep them simple enough to explain in one sentence each.

## What's real vs. what's a known limitation for this version

| Capability | Status |
|---|---|
| Rule-based reconciliation (qty/price/date across clean structured data) | Built, demoed live |
| LLM reasoning for ambiguous field matching | Built, demoed live |
| Acceptance Pack generation with source-linked flags | Built, demoed live |
| Draft clarification messages | Built, demoed live |
| OCR on clean typed/PDF documents | Best-effort, may work |
| OCR on handwritten/scanned/messy documents | **Known limitation — not attempted this version** |
| Real email/WhatsApp sending | **Stubbed — human approval gate shown, send is mocked** |
