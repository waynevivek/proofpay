"""Create all ProofPay tables for the current SQLAlchemy metadata."""

from app.db.session import Base, engine
from app.models import (  # noqa: F401 - imports register models with Base.metadata
    AcceptanceProof,
    DeliveryProof,
    GSTInfo,
    GRN,
    Invoice,
    PurchaseOrder,
    Transaction,
)


def create_tables() -> None:
    """Create missing tables in the configured database."""

    Base.metadata.create_all(bind=engine)


if __name__ == "__main__":
    create_tables()
    print("ProofPay database tables created.")
