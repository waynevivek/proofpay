"""Reconciliation and acceptance-pack endpoints."""

from pydantic import BaseModel
from fastapi import APIRouter
from fastapi.responses import JSONResponse

router = APIRouter(prefix="/transactions", tags=["reconciliation"])


class DraftMessageRequest(BaseModel):
    """Request shape for regenerating a clarification draft."""

    recipient: str | None = None


def _not_implemented() -> JSONResponse:
    return JSONResponse(
        status_code=501,
        content={
            "error": "Reconciliation operations are not implemented yet",
            "code": "not_implemented",
        },
    )


@router.post("/{transaction_id}/reconcile", status_code=501)
async def reconcile_transaction(transaction_id: str) -> JSONResponse:
    """Run reconciliation for a transaction."""

    return _not_implemented()


@router.get("/{transaction_id}/acceptance-pack", status_code=501)
async def get_acceptance_pack(transaction_id: str) -> JSONResponse:
    """Return the formatted acceptance pack for a reconciled transaction."""

    return _not_implemented()


@router.post("/{transaction_id}/draft-message", status_code=501)
async def draft_message(
    transaction_id: str,
    payload: DraftMessageRequest,
) -> JSONResponse:
    """Regenerate a clarification message draft."""

    return _not_implemented()
