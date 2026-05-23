# ─────────────────────────────────────────────────────────────────────────────
# infrastructure/db/models/audit_log.py
# ─────────────────────────────────────────────────────────────────────────────

from datetime import datetime

from sqlalchemy import (
    BigInteger,
    String,
    DateTime,
    JSON,
)

from sqlalchemy.orm import (
    Mapped,
    mapped_column,
)

from app.infrastructure.db.base import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    # ────────────────────────────────────────────────────────────────────────
    # PRIMARY KEY
    # ────────────────────────────────────────────────────────────────────────

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
        autoincrement=True,
    )

    # ────────────────────────────────────────────────────────────────────────
    # ENTITY INFO
    # ────────────────────────────────────────────────────────────────────────

    # Example:
    # service
    # service_version
    # media
    entity_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    entity_id: Mapped[int] = mapped_column(
        BigInteger,
        nullable=False,
        index=True,
    )

    # ────────────────────────────────────────────────────────────────────────
    # ACTOR INFO
    # ────────────────────────────────────────────────────────────────────────

    actor_id: Mapped[int] = mapped_column(
        BigInteger,
        nullable=False,
    )

    # vendor | admin | customer
    actor_role: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
    )

    # created | updated | deleted | approved | rejected
    action: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    # ────────────────────────────────────────────────────────────────────────
    # EXTRA PAYLOAD
    # ────────────────────────────────────────────────────────────────────────

    # Store metadata / diffs / snapshots
    payload: Mapped[dict | None] = mapped_column(
        JSON,
        nullable=True,
    )

    # IPv4 / IPv6 safe
    ip_address: Mapped[str | None] = mapped_column(
        String(45),
        nullable=True,
    )

    # ────────────────────────────────────────────────────────────────────────
    # TIMESTAMPS
    # ────────────────────────────────────────────────────────────────────────

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        nullable=False,
    )