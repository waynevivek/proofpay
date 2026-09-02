"""Acceptance-pack assembly from a persisted reconciliation result."""

from __future__ import annotations

from typing import Any

from app.extraction.schemas import AcceptancePack, ReconciliationResult


def build_acceptance_pack(result: dict[str, Any]) -> dict[str, Any]:
    """Return the UI-facing acceptance pack for a reconciled transaction."""

    reconciliation = ReconciliationResult.model_validate(result)
    return AcceptancePack(
        transaction_id=reconciliation.transaction_id,
        summary={
            "verdict": reconciliation.verdict,
            "readiness_score": reconciliation.readiness_score,
        },
        flags=reconciliation.flags,
        missing_evidence=reconciliation.missing_evidence,
        recommended_action=reconciliation.recommended_action,
        draft_message=reconciliation.draft_message,
    ).model_dump(mode="json")
