# API Contracts (v1)

Base path: `/api/v1`

Backend and frontend both freeze against this on day 1. If an endpoint shape needs to
change mid-build, update this file in the same commit as the code change.

## Documents

### `POST /documents/upload`
Uploads and extracts a single document.
- **Request (current JSON stub):** query parameter `doc_type` (`po | invoice | grn | delivery_proof | acceptance_proof | gst_info`) plus the raw normalized document JSON as the request body. Real multipart file upload/OCR is deferred.
- **Response:** the extracted structured JSON for that doc type (see DATA_MODEL.md)

## Transactions

### `POST /transactions`
Bundles a set of already-uploaded document IDs into a transaction.
- **Request:** `{ "po_id": "...", "invoice_id": "...", "grn_id": "...", "delivery_proof_id": "...|null", "acceptance_proof_id": "...|null", "gst_info_id": "...|null" }`
- **Response:** `Transaction` object, `status: "uploaded"`

### `GET /transactions/{id}`
Returns the full `Transaction` object.

### `GET /transactions`
Returns a list of transactions (for the dashboard table) — id, status, verdict if reconciled, readiness score if available.

## Reconciliation

### `POST /transactions/{id}/reconcile`
Runs the reconciliation engine on the transaction's documents.
- **Response:** `ReconciliationResult` object (see DATA_MODEL.md)

### `GET /transactions/{id}/acceptance-pack`
Returns the formatted Acceptance Pack — summary, flags, missing evidence, recommended action,
draft message — ready for the UI to render as the final output panel. Requires `/reconcile`
to have already run; returns 409 if not yet reconciled.

### `POST /transactions/{id}/draft-message`
Regenerates the clarification draft message on demand (e.g. if the user edits tone/recipient).
- **Request:** `{ "recipient": "string, optional" }`
- **Response:** `{ "draft_message": "string" }`

## Error shape (all endpoints)

```json
{ "error": "string, human-readable", "code": "string, machine-readable" }
```

## Auth note

For the hackathon build, skip real auth — a single hardcoded demo user is fine. Do not spend
build hours on JWT/RBAC here; it added no judging value in the CRPF project and this product's
demo doesn't need multi-role access to make its point.
