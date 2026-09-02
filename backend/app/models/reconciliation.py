"""Persisted reconciliation result records."""

from __future__ import annotations

from typing import Any, TYPE_CHECKING

from sqlalchemy import ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.transaction import Transaction


class ReconciliationResultRecord(Base):
    """Stored result for the latest reconciliation run of a transaction."""

    __tablename__ = "reconciliation_results"

    transaction_id: Mapped[str] = mapped_column(
        ForeignKey("transactions.transaction_id", ondelete="CASCADE"),
        primary_key=True,
    )
    result: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False)

    transaction: Mapped["Transaction"] = relationship(
        back_populates="reconciliation_result"
    )
