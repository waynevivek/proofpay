"""Draft-only clarification message generation."""

from __future__ import annotations

from typing import Any


def build_draft_message(
    result: dict[str, Any], recipient: str | None = None
) -> str | None:
    """Generate a clarification draft without sending it anywhere."""

    if not result["flags"] and not result["missing_evidence"]:
        return None

    greeting = f"Dear {recipient}," if recipient else "Hello,"
    issues: list[str] = []
    for flag in result["flags"]:
        if flag["field"] == "quantity":
            issues.append(
                "quantity mismatch "
                f"(PO {flag['po_value']}, GRN {flag['grn_value']}, "
                f"invoice {flag['invoice_value']})"
            )
        elif flag["field"] == "price":
            issues.append(
                "price mismatch "
                f"(PO rate {flag['po_value']}, invoice rate {flag['invoice_value']})"
            )
        else:
            issues.append(flag["discrepancy_type"].replace("_", " "))
    issues.extend(item.replace("_", " ") for item in result["missing_evidence"])

    return (
        f"{greeting} We need to clarify transaction {result['transaction_id']} "
        "before payment. Outstanding items: "
        + ", ".join(issues)
        + "."
    )
