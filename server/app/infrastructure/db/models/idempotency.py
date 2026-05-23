# ─────────────────────────────────────────────────────────────────────────────
# infrastructure/db/models/idempotency.py
# ─────────────────────────────────────────────────────────────────────────────
from datetime import datetime
from sqlalchemy import BigInteger, String, JSON, SmallInteger, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from app.infrastructure.db.base import Base
 
 
class IdempotencyRecord(Base):
    __tablename__ = "idempotency_records"
 
    id:             Mapped[int]      = mapped_column(BigInteger, primary_key=True)
    key:            Mapped[str]      = mapped_column(String(128), unique=True, nullable=False, index=True)
    request_hash:   Mapped[str]      = mapped_column(String(64), nullable=False)
    response_body:  Mapped[dict | None] = mapped_column(JSON, nullable=True)
    status_code:    Mapped[int]      = mapped_column(SmallInteger, nullable=False)
    created_at:     Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    expires_at:     Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
 