"""SQLAlchemy model for the Transaction document bundle."""

from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import CheckConstraint, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.documents import (
        AcceptanceProof,
        DeliveryProof,
        GSTInfo,
        GRN,
        Invoice,
        PurchaseOrder,
    )


class Transaction(Base):
    """Transaction document bundle from DATA_MODEL.md."""

    __tablename__ = "transactions"
    __table_args__ = (
        CheckConstraint(
            "status IN ('uploaded', 'reconciled')", name="ck_transaction_status"
        ),
    )

    transaction_id: Mapped[str] = mapped_column(String(100), primary_key=True)
    po_id: Mapped[str] = mapped_column(
        ForeignKey("purchase_orders.po_id"), nullable=False
    )
    invoice_id: Mapped[str] = mapped_column(
        ForeignKey("invoices.invoice_id"), nullable=False
    )
    grn_id: Mapped[str] = mapped_column(ForeignKey("grns.grn_id"), nullable=False)
    delivery_proof_id: Mapped[str | None] = mapped_column(
        ForeignKey("delivery_proofs.proof_id"), nullable=True
    )
    acceptance_proof_id: Mapped[str | None] = mapped_column(
        ForeignKey("acceptance_proofs.proof_id"), nullable=True
    )
    gst_info_id: Mapped[str | None] = mapped_column(
        ForeignKey("gst_info.gstin"), nullable=True
    )
    status: Mapped[str] = mapped_column(String(12), nullable=False, default="uploaded")

    po: Mapped["PurchaseOrder"] = relationship(lazy="joined")
    invoice: Mapped["Invoice"] = relationship(lazy="joined")
    grn: Mapped["GRN"] = relationship(lazy="joined")
    delivery_proof: Mapped["DeliveryProof | None"] = relationship(lazy="joined")
    acceptance_proof: Mapped["AcceptanceProof | None"] = relationship(lazy="joined")
    gst_info: Mapped["GSTInfo | None"] = relationship(lazy="joined")
