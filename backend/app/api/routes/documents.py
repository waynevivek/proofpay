"""Document upload and extraction endpoints."""

from typing import Any
from typing import Literal

from fastapi import APIRouter, Body, Depends, HTTPException, Query
from fastapi.responses import JSONResponse
from pydantic import ValidationError
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.extraction.schemas import (
    AcceptanceProofDocument,
    DeliveryProofDocument,
    GRNDocument,
    GSTInfoDocument,
    InvoiceDocument,
    PurchaseOrderDocument,
)
from app.models import (
    AcceptanceProof,
    DeliveryProof,
    GRN,
    GSTInfo,
    Invoice,
    PurchaseOrder,
)

router = APIRouter(prefix="/documents", tags=["documents"])

DocumentType = Literal[
    "po",
    "invoice",
    "grn",
    "delivery_proof",
    "acceptance_proof",
    "gst_info",
]


DOCUMENT_DEFINITIONS = {
    "po": (PurchaseOrderDocument, PurchaseOrder, "po_id"),
    "invoice": (InvoiceDocument, Invoice, "invoice_id"),
    "grn": (GRNDocument, GRN, "grn_id"),
    "delivery_proof": (DeliveryProofDocument, DeliveryProof, "proof_id"),
    "acceptance_proof": (AcceptanceProofDocument, AcceptanceProof, "proof_id"),
    "gst_info": (GSTInfoDocument, GSTInfo, "gstin"),
}


@router.post("/upload")
async def upload_document(
    payload: dict[str, Any] = Body(...),
    doc_type: DocumentType = Query(...),
    db: Session = Depends(get_db),
) -> JSONResponse:
    """Validate and store one already-extracted document JSON object.

    The real file/OCR input is intentionally stubbed for this build.  ``doc_type`` is
    a query parameter and the request body is the normalized document JSON.
    """

    schema_class, model_class, id_field = DOCUMENT_DEFINITIONS[doc_type]
    try:
        document = schema_class.model_validate(payload)
    except ValidationError:
        raise HTTPException(
            status_code=422,
            detail={
                "error": f"Invalid document body for doc_type '{doc_type}'",
                "code": "invalid_document",
            },
        ) from None

    document_id = getattr(document, id_field)
    if db.get(model_class, document_id) is not None:
        raise HTTPException(
            status_code=409,
            detail={
                "error": f"Document '{document_id}' already exists",
                "code": "document_exists",
            },
        )

    db.add(model_class(**document.model_dump()))
    db.commit()

    return JSONResponse(content=document.model_dump(mode="json"))
