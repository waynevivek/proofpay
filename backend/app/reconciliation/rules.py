"""Deterministic reconciliation rules for normalized transaction documents."""

from __future__ import annotations

from datetime import timedelta
from decimal import Decimal
from typing import Any

from app.reconciliation.scoring import calculate_readiness_score


DELIVERY_WINDOW_DAYS = 30


def _find_line_item(line_items: list[dict[str, Any]], item_name: str) -> dict[str, Any] | None:
    """Find a line item by its normalized exact item name."""

    return next((line for line in line_items if line.get("item") == item_name), None)


def _money(value: Any) -> Decimal:
    """Convert a document amount to decimal without introducing float rounding."""

    return Decimal(str(value))


def _flag(
    *,
    field: str,
    discrepancy_type: str,
    source_docs: list[str],
    po_value: int | float | str | None = None,
    grn_value: int | float | str | None = None,
    invoice_value: int | float | str | None = None,
    amount_at_risk: Decimal | int | float = 0,
) -> dict[str, Any]:
    """Build one source-linked flag in the frozen result shape."""

    return {
        "field": field,
        "po_value": po_value,
        "grn_value": grn_value,
        "invoice_value": invoice_value,
        "discrepancy_type": discrepancy_type,
        "amount_at_risk": round(float(amount_at_risk), 2),
        "source_docs": source_docs,
    }


def _reference_flags(transaction: Any) -> list[dict[str, Any]]:
    """Flag documents that do not refer to the transaction's selected documents."""

    flags: list[dict[str, Any]] = []
    po_id = transaction.po.po_id
    invoice_id = transaction.invoice.invoice_id

    if transaction.invoice.po_ref != po_id or transaction.grn.po_ref != po_id:
        flags.append(
            _flag(
                field="reference",
                po_value=po_id,
                grn_value=transaction.grn.po_ref,
                invoice_value=transaction.invoice.po_ref,
                discrepancy_type="purchase_order_reference_mismatch",
                source_docs=[po_id, transaction.grn.grn_id, invoice_id],
            )
        )

    for proof_name in ("delivery_proof", "acceptance_proof"):
        proof = getattr(transaction, proof_name)
        if proof is not None and proof.ref_id != invoice_id:
            flags.append(
                _flag(
                    field="reference",
                    po_value=invoice_id,
                    invoice_value=proof.ref_id,
                    discrepancy_type=f"{proof_name}_reference_mismatch",
                    source_docs=[invoice_id, proof.proof_id],
                )
            )

    if transaction.gst_info is not None and transaction.invoice.gstin != transaction.gst_info.gstin:
        flags.append(
            _flag(
                field="gstin",
                invoice_value=transaction.invoice.gstin,
                grn_value=transaction.gst_info.gstin,
                discrepancy_type="gstin_mismatch",
                source_docs=[invoice_id, transaction.gst_info.gstin],
            )
        )

    return flags


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


def _gst_flags(transaction: Any) -> list[dict[str, Any]]:
    """Flag GST evidence that exists but is not verified."""

    if transaction.gst_info is None or transaction.gst_info.validity_status == "valid":
        return []

    return [
        _flag(
            field="gst",
            invoice_value=transaction.invoice.gstin,
            grn_value=transaction.gst_info.validity_status,
            discrepancy_type=f"gst_{transaction.gst_info.validity_status}",
            source_docs=[transaction.invoice.invoice_id, transaction.gst_info.gstin],
        )
    ]


def _quantity_and_price_flags(transaction: Any) -> list[dict[str, Any]]:
    flags: list[dict[str, Any]] = []
    po_lines = transaction.po.line_items
    invoice_lines = transaction.invoice.line_items
    grn_lines = transaction.grn.line_items
    po_item_names = {line["item"] for line in po_lines}

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
                _flag(
                    field="quantity",
                    po_value=po_qty,
                    grn_value=grn_qty,
                    invoice_value=invoice_qty,
                    discrepancy_type="quantity_mismatch",
                    amount_at_risk=_money(shortfall) * _money(rate),
                    source_docs=[transaction.grn.grn_id, transaction.invoice.invoice_id],
                )
            )

        po_amount = _money(po_line["amount"])
        po_expected_amount = _money(po_line["rate"]) * po_qty
        if po_amount != po_expected_amount:
            flags.append(
                _flag(
                    field="price",
                    po_value=po_line["amount"],
                    invoice_value=float(po_expected_amount),
                    discrepancy_type="po_line_amount_invalid",
                    amount_at_risk=abs(po_amount - po_expected_amount),
                    source_docs=[transaction.po.po_id],
                )
            )

        if invoice_line is not None:
            invoice_amount = _money(invoice_line["amount"])
            invoice_expected_amount = _money(invoice_line["rate"]) * invoice_qty

            if _money(po_line["rate"]) != _money(invoice_line["rate"]):
                flags.append(
                    _flag(
                        field="price",
                        po_value=po_line["rate"],
                        invoice_value=invoice_line["rate"],
                        discrepancy_type="price_mismatch",
                        amount_at_risk=abs(
                            _money(po_line["rate"]) - _money(invoice_line["rate"])
                        )
                        * invoice_qty,
                        source_docs=[transaction.po.po_id, transaction.invoice.invoice_id],
                    )
                )
            elif po_amount != invoice_amount:
                flags.append(
                    _flag(
                        field="price",
                        po_value=po_line["amount"],
                        invoice_value=invoice_line["amount"],
                        discrepancy_type="line_amount_mismatch",
                        amount_at_risk=abs(po_amount - invoice_amount),
                        source_docs=[transaction.po.po_id, transaction.invoice.invoice_id],
                    )
                )

            if invoice_amount != invoice_expected_amount:
                flags.append(
                    _flag(
                        field="price",
                        po_value=float(invoice_expected_amount),
                        invoice_value=invoice_line["amount"],
                        discrepancy_type="invoice_line_amount_invalid",
                        amount_at_risk=abs(invoice_amount - invoice_expected_amount),
                        source_docs=[transaction.invoice.invoice_id],
                    )
                )

    for invoice_line in invoice_lines:
        if invoice_line["item"] not in po_item_names:
            flags.append(
                _flag(
                    field="price",
                    invoice_value=invoice_line["item"],
                    discrepancy_type="unapproved_invoice_line_item",
                    amount_at_risk=_money(invoice_line["amount"]),
                    source_docs=[transaction.po.po_id, transaction.invoice.invoice_id],
                )
            )

    for grn_line in grn_lines:
        if grn_line["item"] not in po_item_names:
            flags.append(
                _flag(
                    field="quantity",
                    grn_value=grn_line["item"],
                    discrepancy_type="unapproved_grn_line_item",
                    source_docs=[transaction.po.po_id, transaction.grn.grn_id],
                )
            )

    po_total = _money(transaction.po.total_amount)
    invoice_total = _money(transaction.invoice.total_amount)
    po_line_total = sum((_money(line["amount"]) for line in po_lines), Decimal("0"))
    invoice_line_total = sum(
        (_money(line["amount"]) for line in invoice_lines), Decimal("0")
    )

    # Sum amount_at_risk from line-level flags that could explain total differences.
    # Only emit derived total-level flags if the difference is not already explained.
    line_level_risk_for_total_diff = Decimal("0")
    po_line_level_risk = Decimal("0")
    invoice_line_level_risk = Decimal("0")

    for flag in flags:
        discrepancy_type = flag.get("discrepancy_type")
        # These line-level flags can explain po-vs-invoice total differences.
        if discrepancy_type in (
            "price_mismatch",
            "line_amount_mismatch",
            "quantity_mismatch",
            "unapproved_invoice_line_item",
        ):
            line_level_risk_for_total_diff += _money(flag.get("amount_at_risk", 0))
        # po_line_amount_invalid can explain po_total_invalid.
        if discrepancy_type == "po_line_amount_invalid":
            po_line_level_risk += _money(flag.get("amount_at_risk", 0))
        # invoice_line_amount_invalid and unapproved_invoice_line_item can explain invoice_total_invalid.
        if discrepancy_type in ("invoice_line_amount_invalid", "unapproved_invoice_line_item"):
            invoice_line_level_risk += _money(flag.get("amount_at_risk", 0))

    if po_total != invoice_total:
        total_diff = abs(po_total - invoice_total)
        if total_diff > line_level_risk_for_total_diff:
            flags.append(
                _flag(
                    field="price",
                    po_value=transaction.po.total_amount,
                    invoice_value=transaction.invoice.total_amount,
                    discrepancy_type="total_amount_mismatch",
                    amount_at_risk=total_diff,
                    source_docs=[transaction.po.po_id, transaction.invoice.invoice_id],
                )
            )
    if po_total != po_line_total:
        po_total_diff = abs(po_total - po_line_total)
        if po_total_diff > po_line_level_risk:
            flags.append(
                _flag(
                    field="price",
                    po_value=transaction.po.total_amount,
                    invoice_value=float(po_line_total),
                    discrepancy_type="po_total_invalid",
                    amount_at_risk=po_total_diff,
                    source_docs=[transaction.po.po_id],
                )
            )
    if invoice_total != invoice_line_total:
        invoice_total_diff = abs(invoice_total - invoice_line_total)
        if invoice_total_diff > invoice_line_level_risk:
            flags.append(
                _flag(
                    field="price",
                    po_value=float(invoice_line_total),
                    invoice_value=transaction.invoice.total_amount,
                    discrepancy_type="invoice_total_invalid",
                    amount_at_risk=invoice_total_diff,
                    source_docs=[transaction.invoice.invoice_id],
                )
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

    if (
        transaction.delivery_proof is not None
        and transaction.delivery_proof.status != "missing"
        and not window_start <= transaction.delivery_proof.date <= window_end
    ):
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

    flags = (
        _reference_flags(transaction)
        + _gst_flags(transaction)
        + _quantity_and_price_flags(transaction)
        + _date_flags(transaction)
    )
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
