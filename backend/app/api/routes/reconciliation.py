"""Reconciliation and acceptance-pack endpoints."""

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel, ConfigDict
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.extraction.schemas import AcceptancePack, ReconciliationResult
from app.models import ReconciliationResultRecord, Transaction
from app.reconciliation.rules import reconcile_documents
from app.services.acceptance_pack import build_acceptance_pack
from app.services.draft_message import build_draft_message

router = APIRouter(prefix="/transactions", tags=["reconciliation"])


class DraftMessageRequest(BaseModel):
    """Request shape for regenerating a clarification draft."""

    model_config = ConfigDict(extra="forbid")

    recipient: str | None = None


@router.post("/{transaction_id}/reconcile")
async def reconcile_transaction(
    transaction_id: str, db: Session = Depends(get_db)
) -> JSONResponse:
    """Run reconciliation for a transaction."""

    transaction = db.get(Transaction, transaction_id)
    if transaction is None:
        raise HTTPException(
            status_code=404,
            detail={
                "error": f"Transaction '{transaction_id}' was not found",
                "code": "transaction_not_found",
            },
        )

    result = ReconciliationResult.model_validate(
        reconcile_documents(transaction)
    ).model_dump(mode="json")
    transaction.status = "reconciled"

    stored_result = db.get(ReconciliationResultRecord, transaction_id)
    if stored_result is None:
        db.add(
            ReconciliationResultRecord(
                transaction_id=transaction_id,
                result=result,
            )
        )
    else:
        stored_result.result = result

    db.commit()
    return JSONResponse(content=result)


@router.get("/{transaction_id}/acceptance-pack")
async def get_acceptance_pack(
    transaction_id: str, db: Session = Depends(get_db)
) -> JSONResponse:
    """Return the formatted acceptance pack for a reconciled transaction."""

    transaction = db.get(Transaction, transaction_id)
    if transaction is None:
        raise HTTPException(
            status_code=404,
            detail={
                "error": f"Transaction '{transaction_id}' was not found",
                "code": "transaction_not_found",
            },
        )

    stored_result = db.get(ReconciliationResultRecord, transaction_id)
    if stored_result is None or transaction.status != "reconciled":
        raise HTTPException(
            status_code=409,
            detail={
                "error": "Transaction must be reconciled before its acceptance pack is available",
                "code": "not_reconciled",
            },
        )

    pack = AcceptancePack.model_validate(
        build_acceptance_pack(stored_result.result)
    ).model_dump(mode="json")
    return JSONResponse(content=pack)


@router.post("/{transaction_id}/draft-message")
async def draft_message(
    transaction_id: str,
    payload: DraftMessageRequest,
    db: Session = Depends(get_db),
) -> JSONResponse:
    """Regenerate a clarification message draft."""

    transaction = db.get(Transaction, transaction_id)
    if transaction is None:
        raise HTTPException(
            status_code=404,
            detail={
                "error": f"Transaction '{transaction_id}' was not found",
                "code": "transaction_not_found",
            },
        )

    stored_result = db.get(ReconciliationResultRecord, transaction_id)
    if stored_result is None or transaction.status != "reconciled":
        raise HTTPException(
            status_code=409,
            detail={
                "error": "Transaction must be reconciled before its draft message is available",
                "code": "not_reconciled",
            },
        )

    result = ReconciliationResult.model_validate(stored_result.result).model_dump(
        mode="json"
    )
    regenerated = build_draft_message(result, payload.recipient)
    if regenerated is None:
        raise HTTPException(
            status_code=409,
            detail={
                "error": "No clarification draft is needed for a verified transaction",
                "code": "no_draft_needed",
            },
        )

    stored_result.result = {**result, "draft_message": regenerated}
    db.commit()
    return JSONResponse(content={"draft_message": regenerated})
