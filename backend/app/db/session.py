"""SQLite engine and SQLAlchemy session factory."""

from __future__ import annotations

import os
from collections.abc import AsyncGenerator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.models.base import Base

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./proofpay.db")

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


async def get_db() -> AsyncGenerator[Session, None]:
    """Yield a database session for a request and close it afterward."""

    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
