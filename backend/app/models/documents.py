"""SQLAlchemy models for the normalized document shapes."""

from __future__ import annotations

from datetime import date as date_type
from decimal import Decimal
from typing import Any

from sqlalchemy import CheckConstraint, Date, JSON, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class PurchaseOrder(Base):
    """PurchaseOrder document from DATA_MODEL.md."""

    __tablename__ = "purchase_orders"

    po_id: Mapped[str] = mapped_column(String(100), primary_key=True)
    date: Mapped[date_type] = mapped_column(Date, nullable=False)
    buyer: Mapped[str] = mapped_column(String(255), nullable=False)
    supplier: Mapped[str] = mapped_column(String(255), nullable=False)
    line_items: Mapped[list[dict[str, Any]]] = mapped_column(JSON, nullable=False)
    total_amount: Mapped[Decimal] = mapped_column(Numeric(15, 2), nullable=False)


class GRN(Base):
    """Goods Receipt Note document from DATA_MODEL.md."""

    __tablename__ = "grns"

    grn_id: Mapped[str] = mapped_column(String(100), primary_key=True)
    po_ref: Mapped[str] = mapped_column(String(100), nullable=False)
    date: Mapped[date_type] = mapped_column(Date, nullable=False)
    line_items: Mapped[list[dict[str, Any]]] = mapped_column(JSON, nullable=False)
    receiving_party: Mapped[str] = mapped_column(String(255), nullable=False)


class Invoice(Base):
    """Invoice document from DATA_MODEL.md."""

    __tablename__ = "invoices"

    invoice_id: Mapped[str] = mapped_column(String(100), primary_key=True)
    po_ref: Mapped[str] = mapped_column(String(100), nullable=False)
    date: Mapped[date_type] = mapped_column(Date, nullable=False)
    gstin: Mapped[str] = mapped_column(String(15), nullable=False)
    line_items: Mapped[list[dict[str, Any]]] = mapped_column(JSON, nullable=False)
    total_amount: Mapped[Decimal] = mapped_column(Numeric(15, 2), nullable=False)


class DeliveryProof(Base):
    """DeliveryProof document from DATA_MODEL.md."""

    __tablename__ = "delivery_proofs"
    __table_args__ = (
        CheckConstraint("type = 'delivery'", name="ck_delivery_proof_type"),
        CheckConstraint(
            "status IN ('present', 'missing')", name="ck_delivery_proof_status"
        ),
    )

    proof_id: Mapped[str] = mapped_column(String(100), primary_key=True)
    ref_id: Mapped[str] = mapped_column(String(100), nullable=False)
    type: Mapped[str] = mapped_column(String(10), nullable=False, default="delivery")
    date: Mapped[date_type] = mapped_column(Date, nullable=False)
    signed_by: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[str] = mapped_column(String(10), nullable=False)


class AcceptanceProof(Base):
    """AcceptanceProof document from DATA_MODEL.md."""

    __tablename__ = "acceptance_proofs"
    __table_args__ = (
        CheckConstraint("type = 'acceptance'", name="ck_acceptance_proof_type"),
        CheckConstraint(
            "status IN ('present', 'missing')", name="ck_acceptance_proof_status"
        ),
    )

    proof_id: Mapped[str] = mapped_column(String(100), primary_key=True)
    ref_id: Mapped[str] = mapped_column(String(100), nullable=False)
    type: Mapped[str] = mapped_column(String(10), nullable=False, default="acceptance")
    date: Mapped[date_type] = mapped_column(Date, nullable=False)
    signed_by: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[str] = mapped_column(String(10), nullable=False)


class GSTInfo(Base):
    """GSTInfo document from DATA_MODEL.md."""

    __tablename__ = "gst_info"
    __table_args__ = (
        CheckConstraint(
            "validity_status IN ('valid', 'invalid', 'unverified')",
            name="ck_gst_info_validity_status",
        ),
    )

    gstin: Mapped[str] = mapped_column(String(15), primary_key=True)
    validity_status: Mapped[str] = mapped_column(String(10), nullable=False)
