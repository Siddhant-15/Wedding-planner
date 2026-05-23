from sqlalchemy import BigInteger, String, Text, Enum, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
import enum
from app.infrastructure.db.base import Base


class UploadStatus(str, enum.Enum):
    pending   = "pending"
    finalized = "finalized"
    failed    = "failed"
    cleaned   = "cleaned"


class UploadStaging(Base):
    __tablename__ = "upload_staging"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    service_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("services.id", ondelete="CASCADE"))
    version_id: Mapped[int | None] = mapped_column(BigInteger, ForeignKey("service_versions.id", ondelete="SET NULL"), nullable=True)
    idempotency_key: Mapped[str | None] = mapped_column(String(100), nullable=True, index=True)

    temp_key: Mapped[str] = mapped_column(Text)          # storage/temp/... path
    final_key: Mapped[str | None] = mapped_column(Text, nullable=True)  # storage/final/...

    media_type: Mapped[str] = mapped_column(String(20))  # image | video
    content_type: Mapped[str] = mapped_column(String(100))
    size_bytes: Mapped[int] = mapped_column(BigInteger)
    checksum: Mapped[str] = mapped_column(String(64))

    display_order: Mapped[int] = mapped_column(default=0)
    is_cover: Mapped[bool] = mapped_column(default=False)
    meta: Mapped[dict] = mapped_column("metadata_", default=dict)  # type: ignore

    status: Mapped[UploadStatus] = mapped_column(
        Enum(UploadStatus), default=UploadStatus.pending, index=True
    )
    retry_count: Mapped[int] = mapped_column(default=0)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)