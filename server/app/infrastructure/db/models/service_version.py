# ─────────────────────────────────────────────────────────────────────────────
# infrastructure/db/models/service_version.py
# ─────────────────────────────────────────────────────────────────────────────
"""
Immutable versioning for services.
Every create and every approved update creates a new ServiceVersion row.
The 'snapshot' column holds the full denormalized service payload at that moment.
"""
import enum
from datetime import datetime
from sqlalchemy import (
    BigInteger, String, Text, Integer, ForeignKey,
    DateTime, Enum as SAEnum, JSON,
)
from sqlalchemy.orm import Mapped, mapped_column
from app.infrastructure.db.base import Base
 
 
class VersionState(str, enum.Enum):
    draft                  = "draft"
    pending_review         = "pending_review"
    approved               = "approved"
    rejected               = "rejected"
    published              = "published"
    archived               = "archived"
    pending_update_review  = "pending_update_review"
    update_approved        = "update_approved"
    update_rejected        = "update_rejected"
    suspended              = "suspended"
 
 
# ── Allowed state transitions (enforced in Python before any DB write) ────────
VALID_TRANSITIONS: dict[VersionState, set[VersionState]] = {
    VersionState.draft:                 {VersionState.pending_review},
    VersionState.pending_review:        {VersionState.approved, VersionState.rejected},
    VersionState.approved:              {VersionState.published},
    VersionState.published:             {VersionState.pending_update_review, VersionState.archived, VersionState.suspended},
    VersionState.rejected:              {VersionState.draft},
    VersionState.pending_update_review: {VersionState.update_approved, VersionState.update_rejected},
    VersionState.update_approved:       {VersionState.published},
    VersionState.update_rejected:       {VersionState.draft},
    VersionState.archived:              set(),  # terminal
    VersionState.suspended:             {VersionState.published},  # admin can reinstate
}
 
 
class InvalidTransitionError(ValueError):
    pass
 
 
def assert_valid_transition(current: VersionState, target: VersionState) -> None:
    allowed = VALID_TRANSITIONS.get(current, set())
    if target not in allowed:
        raise InvalidTransitionError(
            f"Invalid state transition: {current!r} → {target!r}. "
            f"Allowed from {current!r}: {[s.value for s in allowed]}"
        )
 
 
class ServiceVersion(Base):
    __tablename__ = "service_versions"
 
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
 
    service_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("services.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    version_number: Mapped[int] = mapped_column(Integer, nullable=False)
 
    state: Mapped[VersionState] = mapped_column(
        SAEnum(VersionState, name="version_state_enum"),
        default=VersionState.draft,
        nullable=False,
        index=True,
    )
 
    # Full denormalized snapshot of service data at this version.
    # Stored as JSONB so we can diff any two versions without joining.
    snapshot: Mapped[dict] = mapped_column(JSON, nullable=False)
 
    # ── Moderation ────────────────────────────────────────────────────────────
    submitted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    reviewed_at:  Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
 
    reviewer_id:       Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    rejection_reason:  Mapped[str | None] = mapped_column(Text, nullable=True)
    moderation_notes:  Mapped[str | None] = mapped_column(Text, nullable=True)
 
    # ── Audit ─────────────────────────────────────────────────────────────────
    created_by: Mapped[int] = mapped_column(BigInteger, nullable=False)   # vendor_id
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow
    )