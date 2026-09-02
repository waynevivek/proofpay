"""Explainable payment-readiness scoring for reconciliation results."""

from __future__ import annotations

from typing import Any


MISSING_EVIDENCE_PENALTY = 15
FIXED_FLAG_PENALTY = 10


def _quantity_penalty(flag: dict[str, Any]) -> float:
    """Return the quantity deviation percentage represented by one flag."""

    ordered = flag.get("po_value")
    if not isinstance(ordered, (int, float)) or ordered <= 0:
        return 0.0

    values = [
        value
        for value in (flag.get("grn_value"), flag.get("invoice_value"))
        if isinstance(value, (int, float))
    ]
    if not values:
        return 0.0
    deviation = max(abs(ordered - value) for value in values)
    return deviation / ordered * 100


def calculate_readiness_score(
    flags: list[dict[str, Any]], missing_evidence: list[str]
) -> int:
    """Calculate a capped 0-100 score using the documented fixed penalties."""

    score = 100.0 - len(missing_evidence) * MISSING_EVIDENCE_PENALTY
    for flag in flags:
        if flag.get("field") == "quantity":
            score -= _quantity_penalty(flag)
        else:
            score -= FIXED_FLAG_PENALTY
    return max(0, min(100, int(round(score))))
