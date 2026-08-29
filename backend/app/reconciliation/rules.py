"""Deterministic reconciliation rules for normalized transaction documents."""

from __future__ import annotations

from datetime import timedelta
from typing import Any

from app.reconciliation.scoring import calculate_readiness_score


DELIVERY_WINDOW_DAYS = 30


def _find_line_item(line_items: list[dict[str, Any]], item_name: str) -> dict[str, Any] | None:
    """Find a line item by its normalized exact item name."""

    return next((line for line in line_items if line.get("item") == item_name), None)


def _missing_evidence(transaction: Any) -> list[str]:
    missing: list[str] = []
    if transaction.delivery_proof is None or transaction.delivery_proof.status == "missing":
        missing.append("delivery_proof")
    if (
        transaction.acceptance_proof is None
        or transaction.acceptance_proof.status == "missing"
    ):
        missing.append("customer_acceptance")
    if transaction.gst_info is None:
        missing.append("gst_info")
    return missing


def _quantity_and_price_flags(transaction: Any) -> list[dict[str, Any]]:
    flags: list[dict[str, Any]] = []
    po_lines = transaction.po.line_items
    invoice_lines = transaction.invoice.line_items
    grn_lines = transaction.grn.line_items

    for po_line in po_lines:
        item_name = po_line["item"]
        invoice_line = _find_line_item(invoice_lines, item_name)
        grn_line = _find_line_item(grn_lines, item_name)
        po_qty = po_line["qty"]
        invoice_qty = invoice_line["qty"] if invoice_line else 0
        grn_qty = grn_line["qty_received"] if grn_line else 0

        if po_qty != invoice_qty or invoice_qty != grn_qty:
            rate = invoice_line["rate"] if invoice_line else po_line["rate"]
            supported_qty = min(invoice_qty, grn_qty)
            shortfall = max(invoice_qty - supported_qty, 0)
            if shortfall == 0:
                shortfall = abs(po_qty - invoice_qty)
            flags.append(
                {
                    "field": "quantity",
                    "po_value": po_qty,
                    "grn_value": grn_qty,
                    "invoice_value": invoice_qty,
                    "discrepancy_type": "quantity_mismatch",
                    "amount_at_risk": round(shortfall * rate, 2),
                    "source_docs": [transaction.grn.grn_id, transaction.invoice.invoice_id],
                }
            )

        if invoice_line is not None and po_line["rate"] != invoice_line["rate"]:
            flags.append(
                {
                    "field": "price",
                    "po_value": po_line["rate"],
                    "grn_value": None,
                    "invoice_value": invoice_line["rate"],
                    "discrepancy_type": "price_mismatch",
                    "amount_at_risk": round(
                        abs(po_line["rate"] - invoice_line["rate"]) * invoice_qty,
                        2,
                    ),
                    "source_docs": [transaction.po.po_id, transaction.invoice.invoice_id],
                }
            )

    return flags


def _date_flags(transaction: Any) -> list[dict[str, Any]]:
    """Flag delivery dates outside PO date + 30 days or before the PO date."""

    flags: list[dict[str, Any]] = []
    window_start = transaction.po.date
    window_end = transaction.po.date + timedelta(days=DELIVERY_WINDOW_DAYS)

    if not window_start <= transaction.grn.date <= window_end:
        flags.append(
            {
                "field": "date",
                "po_value": window_start.isoformat(),
                "grn_value": transaction.grn.date.isoformat(),
                "invoice_value": transaction.invoice.date.isoformat(),
                "discrepancy_type": "date_mismatch",
                "amount_at_risk": 0,
                "source_docs": [transaction.po.po_id, transaction.grn.grn_id],
            }
        )

    if transaction.delivery_proof is not None and not window_start <= transaction.delivery_proof.date <= window_end:
        flags.append(
            {
                "field": "date",
                "po_value": window_start.isoformat(),
                "grn_value": transaction.grn.date.isoformat(),
                "invoice_value": transaction.delivery_proof.date.isoformat(),
                "discrepancy_type": "date_mismatch",
                "amount_at_risk": 0,
                "source_docs": [transaction.po.po_id, transaction.delivery_proof.proof_id],
            }
        )

    return flags


def reconcile_documents(transaction: Any) -> dict[str, Any]:
    """Return a complete ReconciliationResult for a persisted transaction."""

    flags = _quantity_and_price_flags(transaction) + _date_flags(transaction)
    missing_evidence = _missing_evidence(transaction)
    readiness_score = calculate_readiness_score(flags, missing_evidence)

    if flags:
        verdict = "risk"
        recommended_action = "Hold payment and resolve the flagged discrepancies before approval."
    elif missing_evidence:
        verdict = "partial"
        recommended_action = "Obtain the missing evidence before approving payment."
    else:
        verdict = "verified"
        recommended_action = "All required evidence matches; transaction is ready for payment approval."

    draft_message = None
    if flags or missing_evidence:
        issues = [flag["discrepancy_type"] for flag in flags] + missing_evidence
        draft_message = (
            "Please review transaction "
            f"{transaction.transaction_id} before payment. Outstanding items: "
            + ", ".join(issues)
            + "."
        )

    return {
        "transaction_id": transaction.transaction_id,
        "verdict": verdict,
        "readiness_score": readiness_score,
        "flags": flags,
        "missing_evidence": missing_evidence,
        "recommended_action": recommended_action,
        "draft_message": draft_message,
    }
