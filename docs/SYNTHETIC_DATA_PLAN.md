# Synthetic Data Plan

One generator script (`data/generator/generate_synthetic_docs.py`) produces every fixture, so
extraction, reconciliation, and frontend all test against the exact same data. Nobody hand-writes
their own test JSON mid-build.

## Categories (5)

1. **Clean match** — PO, GRN, Invoice, delivery proof, acceptance proof, GST info all agree.
   Expected: `verdict: verified`, `readiness_score: 100`.
2. **Quantity mismatch** — GRN receives fewer units than PO/Invoice bill for.
   Expected: `verdict: risk`, flag on `quantity`, `amount_at_risk` calculated from the shortfall.
3. **Price mismatch** — invoice rate differs from PO rate on one or more line items.
   Expected: `verdict: risk`, flag on `price`.
4. **Date mismatch** — GRN or delivery date falls outside an agreed delivery window.
   Expected: `verdict: risk` or `partial` depending on severity.
   The current deterministic demo rule treats the delivery window as the PO date through
   30 calendar days after it; this keeps the rule explicit because the frozen document shape
   does not contain a separate delivery-window field.
5. **Missing evidence** — all quantities/prices agree, but one required document (typically
   acceptance proof) is absent.
   Expected: `verdict: partial`, `readiness_score` in the 75-90% band, `missing_evidence` populated.

## Volume

~4-5 sample transactions per category = 20-25 total. Enough to demo confidently and to catch
edge cases (e.g. multiple line items, multiple simultaneous flags) without over-building test
data at the expense of the actual product during a 24-hour window.

## Naming convention

`data/synthetic/{category}/txn_{n}.json` — each file is a complete `Transaction` bundle
(see DATA_MODEL.md), so any teammate can load one straight into `/transactions` for testing
without assembling it by hand.

## Reserved for the live demo

Pick 1 clean, 1 quantity-mismatch, and 1 missing-evidence transaction ahead of time and use
*only* these three in front of judges — rehearsed, known-good, and matching the exact numbers
already in the PPT (100 vs 92 units, ₹4,000 at risk, 82% readiness). Consistency between the
PPT numbers and the live demo numbers is worth more than showing extra scenarios.
