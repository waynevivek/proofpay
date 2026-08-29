"""Pydantic schemas for the normalized document shapes."""

from __future__ import annotations

from datetime import date
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class StrictModel(BaseModel):
    """Base schema that rejects fields outside the frozen data model."""

    model_config = ConfigDict(extra="forbid", from_attributes=True)


class PurchaseOrderLineItem(StrictModel):
    item: str
    qty: int = Field(ge=0)
    rate: float = Field(ge=0)
    amount: float = Field(ge=0)


class InvoiceLineItem(StrictModel):
    item: str
    qty: int = Field(ge=0)
    rate: float = Field(ge=0)
    amount: float = Field(ge=0)


class GRNLineItem(StrictModel):
    item: str
    qty_received: int = Field(ge=0)


class PurchaseOrderDocument(StrictModel):
    po_id: str
    date: date
    buyer: str
    supplier: str
    line_items: list[PurchaseOrderLineItem]
    total_amount: float = Field(ge=0)


class GRNDocument(StrictModel):
    grn_id: str
    po_ref: str
    date: date
    line_items: list[GRNLineItem]
    receiving_party: str


class InvoiceDocument(StrictModel):
    invoice_id: str
    po_ref: str
    date: date
    gstin: str
    line_items: list[InvoiceLineItem]
    total_amount: float = Field(ge=0)


class ProofDocument(StrictModel):
    proof_id: str
    ref_id: str
    type: Literal["delivery", "acceptance"]
    date: date
    signed_by: str
    status: Literal["present", "missing"]


class DeliveryProofDocument(ProofDocument):
    type: Literal["delivery"]


class AcceptanceProofDocument(ProofDocument):
    type: Literal["acceptance"]


class GSTInfoDocument(StrictModel):
    gstin: str
    validity_status: Literal["valid", "invalid", "unverified"]


class TransactionDocumentResponse(StrictModel):
    transaction_id: str
    po: PurchaseOrderDocument
    invoice: InvoiceDocument
    grn: GRNDocument
    delivery_proof: DeliveryProofDocument | None
    acceptance_proof: AcceptanceProofDocument | None
    gst_info: GSTInfoDocument | None
    status: Literal["uploaded", "reconciled"]

    model_config = ConfigDict(from_attributes=True, extra="forbid")


class TransactionSummary(StrictModel):
    transaction_id: str
    status: Literal["uploaded", "reconciled"]
    verdict: str | None = None
    readiness_score: int | None = None


class ReconciliationFlag(StrictModel):
    field: str
    po_value: int | float | str | None = None
    grn_value: int | float | str | None = None
    invoice_value: int | float | str | None = None
    discrepancy_type: str
    amount_at_risk: float = Field(ge=0)
    source_docs: list[str]


class ReconciliationResult(StrictModel):
    transaction_id: str
    verdict: Literal["verified", "risk", "partial"]
    readiness_score: int = Field(ge=0, le=100)
    flags: list[ReconciliationFlag]
    missing_evidence: list[str]
    recommended_action: str
    draft_message: str | None


class AcceptancePackSummary(StrictModel):
    verdict: Literal["verified", "risk", "partial"]
    readiness_score: int = Field(ge=0, le=100)


class AcceptancePack(StrictModel):
    transaction_id: str
    summary: AcceptancePackSummary
    flags: list[ReconciliationFlag]
    missing_evidence: list[str]
    recommended_action: str
    draft_message: str | None
