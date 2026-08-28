# # app/models/review.py
# #
# # ADJUST: import path for your declarative Base, and for the Admin model.
# # Add the `review_items` relationship to your existing ServiceVersion model
# # (see the commented block at the bottom).

# from enum import Enum as PyEnum

# from sqlalchemy import (
#     BigInteger,
#     Column,
#     DateTime,
#     ForeignKey,
#     Index,
#     Text,
#     UniqueConstraint,
# )
# from sqlalchemy.dialects.postgresql import ENUM as PGEnum
# from sqlalchemy.orm import relationship
# from sqlalchemy.sql import func

# from app.models.models import Base


# class ReviewSection(str, PyEnum):
#     basic_information = "basic_information"
#     location = "location"
#     media = "media"
#     pricing_variants = "pricing_variants"
#     service_details = "service_details"
#     policies_metadata = "policies_metadata"


# class ReviewItemStatus(str, PyEnum):
#     pending = "pending"
#     approved = "approved"
#     changes_requested = "changes_requested"


# # Postgres ENUM types. create_type=False because Alembic creates them
# # explicitly in the migration (avoids double-create races under autogenerate).
# review_section_pg = PGEnum(
#     ReviewSection, name="review_section", create_type=False
# )
# review_item_status_pg = PGEnum(
#     ReviewItemStatus, name="review_item_status", create_type=False
# )


# class ServiceVersionReviewItem(Base):
#     """
#     One row per (service_version_id, section). Created idempotently when a
#     version is submitted for review (see ensure_review_items_for_version).
#     Historical rows are never deleted -- a version's review items are its
#     permanent audit trail, even after the version is archived/rejected.
#     """

#     __tablename__ = "service_version_review_items"

#     id = Column(BigInteger, primary_key=True)

#     service_version_id = Column(
#         BigInteger,
#         ForeignKey("service_versions.id", ondelete="CASCADE"),
#         nullable=False,
#     )

#     section = Column(review_section_pg, nullable=False)
#     status = Column(
#         review_item_status_pg,
#         nullable=False,
#         server_default=ReviewItemStatus.pending.value,
#     )
#     comment = Column(Text, nullable=True)

#     reviewed_by = Column(BigInteger, ForeignKey("admins.id"), nullable=True)
#     reviewed_at = Column(DateTime(timezone=True), nullable=True)

#     created_at = Column(
#         DateTime(timezone=True), server_default=func.now(), nullable=False
#     )
#     updated_at = Column(
#         DateTime(timezone=True),
#         server_default=func.now(),
#         onupdate=func.now(),
#         nullable=False,
#     )

#     service_version = relationship(
#         "ServiceVersion", back_populates="review_items"
#     )
#     reviewer = relationship("Admin", foreign_keys=[reviewed_by])

#     __table_args__ = (
#         UniqueConstraint(
#             "service_version_id", "section", name="uq_review_item_version_section"
#         ),
#         Index("idx_review_item_version", "service_version_id"),
#         Index("idx_review_item_status", "status"),
#     )


# # --------------------------------------------------------------------------
# # ADD to your existing ServiceVersion model (app/models/service.py or similar):
# #
# #   review_items = relationship(
# #       "ServiceVersionReviewItem",
# #       back_populates="service_version",
# #       cascade="all, delete-orphan",
# #       order_by="ServiceVersionReviewItem.id",
# #   )
# #
# # This is a normal one-to-many; cascade="all, delete-orphan" is safe because
# # a version's review items should never outlive the version row itself
# # (the version row is your audit trail, not the review items in isolation).
# # --------------------------------------------------------------------------
