# Data Model

Everyone codes against these shapes. If a field needs to change, update this file first,
then tell the team — don't let it drift silently between backend and frontend.

## Document types

### PurchaseOrder
```json
{
  "po_id": "PO-2208",
  "date": "2026-08-01",
  "buyer": "string",
  "supplier": "string",
  "line_items": [
    {"item": "Steel rods", "qty": 100, "rate": 500, "amount": 50000}
  ],
  "total_amount": 50000
}
```

### GRN (Goods Receipt Note)
```json
{
  "grn_id": "GRN-4471",
  "po_ref": "PO-2208",
  "date": "2026-08-10",
  "line_items": [
    {"item": "Steel rods", "qty_received": 92}
  ],
  "receiving_party": "string"
}
```

### Invoice
```json
{
  "invoice_id": "INV-9911",
  "po_ref": "PO-2208",
  "date": "2026-08-11",
  "gstin": "string",
  "line_items": [
    {"item": "Steel rods", "qty": 100, "rate": 500, "amount": 50000}
  ],
  "total_amount": 50000
}
```

### DeliveryProof / AcceptanceProof
```json
{
  "proof_id": "DC-1187",
  "ref_id": "INV-9911",
  "type": "delivery | acceptance",
  "date": "2026-08-10",
  "signed_by": "string",
  "status": "present | missing"
}
```

### GSTInfo
```json
{
  "gstin": "string",
  "validity_status": "valid | invalid | unverified"
}
```

## Transaction (bundles the above)

```json
{
  "transaction_id": "TXN-001",
  "po": { "...PurchaseOrder" },
  "invoice": { "...Invoice" },
  "grn": { "...GRN" },
  "delivery_proof": { "...DeliveryProof, nullable" },
  "acceptance_proof": { "...AcceptanceProof, nullable" },
  "gst_info": { "...GSTInfo, nullable" },
  "status": "uploaded | reconciled"
}
```

## ReconciliationResult (the core output)

```json
{
  "transaction_id": "TXN-001",
  "verdict": "verified | risk | partial",
  "readiness_score": 72,
  "flags": [
    {
      "field": "quantity",
      "po_value": 100,
      "grn_value": 92,
      "invoice_value": 100,
      "discrepancy_type": "quantity_mismatch",
      "amount_at_risk": 4000,
      "source_docs": ["GRN-4471", "INV-9911"]
    }
  ],
  "missing_evidence": ["customer_acceptance"],
  "recommended_action": "string, human-readable",
  "draft_message": "string, nullable — only generated when a flag or missing evidence exists"
}
```

### Field notes
- `source_docs` on every flag is what makes flags source-linked in the UI — never drop this,
  it's the core USP ("every flag traces back to the exact document and field").
- `verdict` maps directly to the UI badge: `verified` = green, `risk` = red, `partial` = amber.
- `draft_message` is `null` for a clean/verified transaction — the UI should not show an empty
  draft box in that case.
