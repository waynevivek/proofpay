"""Transaction endpoints."""

from uuid import uuid4

from pydantic import BaseModel, ConfigDict
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.extraction.schemas import TransactionDocumentResponse, TransactionSummary
from app.models import (
    AcceptanceProof,
    DeliveryProof,
    GRN,
    GSTInfo,
    Invoice,
    PurchaseOrder,
    Transaction,
)

router = APIRouter(prefix="/transactions", tags=["transactions"])


class TransactionCreate(BaseModel):
    """Request shape for bundling uploaded document IDs."""

    model_config = ConfigDict(extra="forbid")

    po_id: str
    invoice_id: str
    grn_id: str
    delivery_proof_id: str | None = None
    acceptance_proof_id: str | None = None
    gst_info_id: str | None = None


DOCUMENT_FIELDS = (
    ("po_id", PurchaseOrder),
    ("invoice_id", Invoice),
    ("grn_id", GRN),
    ("delivery_proof_id", DeliveryProof),
    ("acceptance_proof_id", AcceptanceProof),
    ("gst_info_id", GSTInfo),
)


def _transaction_json(transaction: Transaction) -> dict:
    return TransactionDocumentResponse.model_validate(transaction).model_dump(
        mode="json"
    )


def _missing_document_error(field: str, document_id: str) -> HTTPException:
    return HTTPException(
        status_code=404,
        detail={
            "error": f"Document '{document_id}' for field '{field}' was not found",
            "code": "document_not_found",
        },
    )


@router.post("")
async def create_transaction(
    payload: TransactionCreate, db: Session = Depends(get_db)
) -> JSONResponse:
    """Bundle uploaded document IDs into a transaction."""

    for field, model_class in DOCUMENT_FIELDS:
        document_id = getattr(payload, field)
        if document_id is None:
            continue
        if db.get(model_class, document_id) is None:
            raise _missing_document_error(field, document_id)

    transaction_id = f"TXN-{uuid4().hex[:12].upper()}"
    while db.get(Transaction, transaction_id) is not None:
        transaction_id = f"TXN-{uuid4().hex[:12].upper()}"

    transaction = Transaction(
        transaction_id=transaction_id,
        **payload.model_dump(),
        status="uploaded",
    )
    db.add(transaction)
    db.commit()
    db.refresh(transaction)

    return JSONResponse(content=_transaction_json(transaction))


@router.get("")
async def list_transactions(db: Session = Depends(get_db)) -> JSONResponse:
    """List transactions for the dashboard."""

    transactions = db.query(Transaction).order_by(Transaction.transaction_id).all()
    summaries = [
        TransactionSummary(
            transaction_id=transaction.transaction_id,
            status=transaction.status,
        ).model_dump(mode="json", exclude_none=True)
        for transaction in transactions
    ]
    return JSONResponse(content=summaries)


@router.get("/{transaction_id}")
async def get_transaction(
    transaction_id: str, db: Session = Depends(get_db)
) -> JSONResponse:
    """Return a full transaction by ID."""

    transaction = db.get(Transaction, transaction_id)
    if transaction is None:
        raise HTTPException(
            status_code=404,
            detail={
                "error": f"Transaction '{transaction_id}' was not found",
                "code": "transaction_not_found",
            },
        )
    return JSONResponse(content=_transaction_json(transaction))
