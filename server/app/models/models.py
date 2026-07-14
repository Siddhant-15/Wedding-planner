"""
Wedding Marketplace – SQLAlchemy Models
Compatible with: FastAPI + SQLAlchemy 2.x (mapped_column / DeclarativeBase)
Database: PostgreSQL
"""

from __future__ import annotations

import enum
from datetime import date, datetime, time
from decimal import Decimal
from typing import Any, List, Optional

from sqlalchemy import (
    BigInteger,
    Boolean,
    CheckConstraint,
    Date,
    DateTime,
    Enum,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    SmallInteger,
    String,
    Text,
    Time,
    UniqueConstraint,
    func,
    text,
)
from sqlalchemy.dialects.postgresql import ARRAY, JSONB, TSVECTOR
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


# =============================================================
# BASE
# =============================================================

class Base(DeclarativeBase):
    pass


# =============================================================
# PYTHON ENUMS  (mirror PostgreSQL ENUMs)
# =============================================================

class ServiceStatusEnum(str, enum.Enum):
    draft        = "draft"
    under_review = "under_review"
    live         = "live"
    inactive     = "inactive"
    suspended    = "suspended"
    needs_revision = "needs_revision"


class ServiceVersionStatusEnum(str, enum.Enum):
    draft        = "draft"
    under_review = "under_review"
    approved     = "approved"
    published    = "published"
    rejected     = "rejected"
    archived     = "archived"
    needs_revision = "needs_revision"


class ServiceTypeEnum(str, enum.Enum):
    venue            = "venue"
    catering         = "catering"
    dj               = "dj"
    photography      = "photography"
    makeup_artist    = "makeup_artist"
    event_management = "event_management"


class LeadStatusEnum(str, enum.Enum):
    new       = "new"
    accepted  = "accepted"
    engaged   = "engaged"
    unlocked  = "unlocked"
    contacted = "contacted"
    closed    = "closed"
    quoted = "quoted"
    cancel = "cancel"


class CustomerLeadStatusEnum(str, enum.Enum):
    REQUEST_SUBMITTED = "REQUEST_SUBMITTED"
    VENDOR_VIEWED     = "VENDOR_VIEWED"
    CONTACT_UNLOCKED  = "CONTACT_UNLOCKED"
    CONTACTED         = "CONTACTED"
    NEGOTIATION       = "NEGOTIATION"
    BOOKED            = "BOOKED"
    CANCELLED         = "CANCELLED"
    VENDOR_REVIEWING = "VENDOR_REVIEWING"
    VENDOR_REJECTED = "VENDOR_REJECTED"
    


class NotificationTypeEnum(str, enum.Enum):
    new_lead              = "new_lead"
    quote_received        = "quote_received"
    booking_created       = "booking_created"
    booking_confirmed     = "booking_confirmed"
    service_approved      = "service_approved"
    service_rejected      = "service_rejected"
    subscription_expiring = "subscription_expiring"


class VendorVerificationStatusEnum(str, enum.Enum):
    pending   = "pending"
    verified  = "verified"
    rejected  = "rejected"
    suspended = "suspended"


class AdminRoleEnum(str, enum.Enum):
    super_admin = "super_admin"
    reviewer    = "reviewer"
    operations  = "operations"
    support     = "support"


class DjEventTypeEnum(str, enum.Enum):
    wedding       = "wedding"
    corporate     = "corporate"
    birthday      = "birthday"
    club          = "club"
    private_party = "private_party"
    festival      = "festival"


# =============================================================
# SECTION 1: CORE USER TABLES
# =============================================================

class Customer(Base):
    __tablename__ = "customer"

    id:              Mapped[int]            = mapped_column(BigInteger, primary_key=True)
    email:           Mapped[str]            = mapped_column(String(255), unique=True, nullable=False)
    hashed_password: Mapped[str]            = mapped_column(String(255), nullable=False)
    first_name:      Mapped[str]            = mapped_column(String(100), nullable=False)
    last_name:       Mapped[str]            = mapped_column(String(100), nullable=False)

    add_line1:       Mapped[Optional[str]]  = mapped_column(String(150))
    add_line2:       Mapped[Optional[str]]  = mapped_column(String(150))
    city:            Mapped[Optional[str]]  = mapped_column(String(100))
    state:           Mapped[Optional[str]]  = mapped_column(String(100))
    country:         Mapped[str]            = mapped_column(String(100), server_default="India")
    pincode:         Mapped[Optional[str]]  = mapped_column(String(20))

    avatar:          Mapped[Optional[str]]  = mapped_column(String(255))
    phone:           Mapped[Optional[str]]  = mapped_column(String(20))
    is_verified:     Mapped[bool]           = mapped_column(Boolean, server_default=text("false"))

    created_at:      Mapped[datetime]       = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at:      Mapped[datetime]       = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    last_login:      Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    deleted_at:      Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

    # Relationships
    wishlists:       Mapped[List["Wishlist"]]    = relationship(back_populates="customer", cascade="all, delete-orphan")
    reviews:         Mapped[List["Review"]]      = relationship(back_populates="customer")
    leads:           Mapped[List["Lead"]]        = relationship(back_populates="customer", foreign_keys="Lead.user_id")
    bookings:        Mapped[List["Booking"]]     = relationship(back_populates="customer")

    __table_args__ = (
        Index("idx_customer_email", "email"),
        Index("idx_customer_deleted", "deleted_at"),
    )


class Vendor(Base):
    __tablename__ = "vendor"

    id:                   Mapped[int]            = mapped_column(BigInteger, primary_key=True)
    email:                Mapped[str]            = mapped_column(String(255), unique=True, nullable=False)
    hashed_password:      Mapped[str]            = mapped_column(String(255), nullable=False)

    first_name:           Mapped[str]            = mapped_column(String(100), nullable=False)
    last_name:            Mapped[str]            = mapped_column(String(100), nullable=False)

    add_line1:            Mapped[Optional[str]]  = mapped_column(String(150))
    add_line2:            Mapped[Optional[str]]  = mapped_column(String(150))
    city:                 Mapped[Optional[str]]  = mapped_column(String(100))
    state:                Mapped[Optional[str]]  = mapped_column(String(100))
    country:              Mapped[str]            = mapped_column(String(100), server_default="India")
    pincode:              Mapped[Optional[str]]  = mapped_column(String(20))

    avatar:               Mapped[Optional[str]]  = mapped_column(String(255))
    phone:                Mapped[Optional[str]]  = mapped_column(String(20))

    verification_status:  Mapped[VendorVerificationStatusEnum] = mapped_column(
        Enum(VendorVerificationStatusEnum, name="vendor_verification_status"),
        nullable=False,
        server_default="pending",
    )

    business_name:        Mapped[str]            = mapped_column(String(150), nullable=False)
    business_description: Mapped[Optional[str]]  = mapped_column(Text)
    experience_years:     Mapped[int]            = mapped_column(SmallInteger, server_default=text("0"))
    contact_person:       Mapped[Optional[str]]  = mapped_column(String(100))
    website:              Mapped[Optional[str]]  = mapped_column(String(255))

    created_at:           Mapped[datetime]       = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at:           Mapped[datetime]       = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    last_login:           Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    deleted_at:           Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

    # Relationships
    services:             Mapped[List["Service"]]             = relationship(back_populates="vendor", cascade="all, delete-orphan")
    subscriptions:        Mapped[List["VendorSubscription"]]  = relationship(back_populates="vendor", cascade="all, delete-orphan")
    leads:                Mapped[List["Lead"]]                = relationship(back_populates="vendor", foreign_keys="Lead.vendor_id")
    bookings:             Mapped[List["Booking"]]             = relationship(back_populates="vendor")
    kyc:                  Mapped[Optional["VendorKYC"]]       = relationship(back_populates="vendor", uselist=False)
    payouts:              Mapped[List["VendorPayout"]]        = relationship(back_populates="vendor")
    unavailable_dates:    Mapped[List["VendorUnavailableDate"]] = relationship(back_populates="vendor", cascade="all, delete-orphan")

    __table_args__ = (
        Index("idx_vendor_email", "email"),
        Index("idx_vendor_business_name", "business_name"),
        Index("idx_vendor_deleted", "deleted_at"),
    )


class Admin(Base):
    __tablename__ = "admins"

    id:              Mapped[int]            = mapped_column(BigInteger, primary_key=True)
    email:           Mapped[str]            = mapped_column(String(255), unique=True, nullable=False)
    hashed_password: Mapped[str]            = mapped_column(String(255), nullable=False)
    first_name:      Mapped[Optional[str]]  = mapped_column(String(100))
    last_name:       Mapped[Optional[str]]  = mapped_column(String(100))
    role:            Mapped[AdminRoleEnum]  = mapped_column(
        Enum(AdminRoleEnum, name="admin_role_enum"),
        nullable=False,
        server_default="reviewer",
    )
    is_active:       Mapped[bool]           = mapped_column(Boolean, server_default=text("true"))
    created_at:      Mapped[datetime]       = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at:      Mapped[datetime]       = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    deleted_at:      Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

    __table_args__ = (
        Index("idx_admins_email", "email"),
    )


# =============================================================
# SECTION 2: SERVICES
# =============================================================

class Service(Base):
    __tablename__ = "services"

    id:                       Mapped[int]                   = mapped_column(BigInteger, primary_key=True)
    vendor_id:                Mapped[int]                   = mapped_column(BigInteger, ForeignKey("vendor.id", ondelete="CASCADE"), nullable=False)

    current_live_version_id:  Mapped[Optional[int]]         = mapped_column(BigInteger, ForeignKey("service_versions.id", use_alter=True, name="fk_service_live_version"), nullable=True)
    current_draft_version_id: Mapped[Optional[int]]         = mapped_column(BigInteger, ForeignKey("service_versions.id", use_alter=True, name="fk_service_draft_version"), nullable=True)

    service_type:             Mapped[ServiceTypeEnum]       = mapped_column(
        Enum(ServiceTypeEnum, name="service_type_enum"),
        nullable=False,
    )
    status:                   Mapped[ServiceStatusEnum]     = mapped_column(
        Enum(ServiceStatusEnum, name="service_status"),
        nullable=False,
        server_default="draft",
    )
    is_active:                Mapped[bool]                  = mapped_column(Boolean, server_default=text("true"))

    created_at:               Mapped[datetime]              = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at:               Mapped[datetime]              = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    deleted_at:               Mapped[Optional[datetime]]    = mapped_column(DateTime(timezone=True))

    # Relationships
    vendor:                   Mapped["Vendor"]              = relationship(back_populates="services")
    versions:                 Mapped[List["ServiceVersion"]] = relationship(
        back_populates="service",
        foreign_keys="ServiceVersion.service_id",
        cascade="all, delete-orphan",
    )
    current_live_version:     Mapped[Optional["ServiceVersion"]] = relationship(
        foreign_keys=[current_live_version_id],
        primaryjoin="Service.current_live_version_id == ServiceVersion.id",
        post_update=True,
    )
    current_draft_version:    Mapped[Optional["ServiceVersion"]] = relationship(
        foreign_keys=[current_draft_version_id],
        primaryjoin="Service.current_draft_version_id == ServiceVersion.id",
        post_update=True,
    )
    reviews:                  Mapped[List["Review"]]             = relationship(back_populates="service", cascade="all, delete-orphan")
    rating_summary:           Mapped[Optional["ServiceRatingSummary"]] = relationship(back_populates="service", uselist=False, cascade="all, delete-orphan")
    wishlisted_by:            Mapped[List["Favorite"]]           = relationship(back_populates="service", cascade="all, delete-orphan")
    unavailable_dates:        Mapped[List["UnavailableDate"]]    = relationship(back_populates="service", cascade="all, delete-orphan")
    leads:                    Mapped[List["Lead"]]               = relationship(back_populates="service")
    bookings:                 Mapped[List["Booking"]]            = relationship(back_populates="service")

    __table_args__ = (
        Index("idx_services_vendor", "vendor_id"),
        Index("idx_services_status", "status"),
        Index("idx_services_deleted", "deleted_at"),
    )


# =============================================================
# SECTION 3: SERVICE VERSIONS
# =============================================================

class ServiceVersion(Base):
    __tablename__ = "service_versions"

    id:               Mapped[int]                          = mapped_column(BigInteger, primary_key=True)
    service_id:       Mapped[int]                          = mapped_column(BigInteger, ForeignKey("services.id", ondelete="CASCADE"), nullable=False)
    version_number:   Mapped[int]                          = mapped_column(Integer, nullable=False)

    status:           Mapped[ServiceVersionStatusEnum]     = mapped_column(
        Enum(ServiceVersionStatusEnum, name="service_version_status"),
        nullable=False,
        server_default="draft",
    )

    service_name:     Mapped[str]                          = mapped_column(String(150), nullable=False)
    description:      Mapped[Optional[str]]                = mapped_column(Text)

    add_line1:        Mapped[Optional[str]]                = mapped_column(String(150))
    add_line2:        Mapped[Optional[str]]                = mapped_column(String(150))
    area:             Mapped[Optional[str]]                = mapped_column(String(100))
    city:             Mapped[Optional[str]]                = mapped_column(String(100))
    state:            Mapped[Optional[str]]                = mapped_column(String(100))
    country:          Mapped[str]                          = mapped_column(String(100), server_default="India")
    pincode:          Mapped[Optional[str]]                = mapped_column(String(20))

    latitude:         Mapped[Optional[Decimal]]            = mapped_column(Numeric(9, 6))
    longitude:        Mapped[Optional[Decimal]]            = mapped_column(Numeric(9, 6))

    search_vector:    Mapped[Optional[Any]]                = mapped_column(TSVECTOR)
    metadata_:        Mapped[dict]                         = mapped_column("metadata",JSONB,nullable=True)

    submitted_at:     Mapped[Optional[datetime]]           = mapped_column(DateTime(timezone=True))

    # Approval audit
    reviewed_at:      Mapped[Optional[datetime]]           = mapped_column(DateTime(timezone=True))
    reviewed_by:      Mapped[Optional[int]]                = mapped_column(BigInteger, ForeignKey("admins.id"))
    approved_at:      Mapped[Optional[datetime]]           = mapped_column(DateTime(timezone=True))
    approved_by:      Mapped[Optional[int]]                = mapped_column(BigInteger, ForeignKey("admins.id"))
    rejected_at:      Mapped[Optional[datetime]]           = mapped_column(DateTime(timezone=True))
    rejected_by:      Mapped[Optional[int]]                = mapped_column(BigInteger, ForeignKey("admins.id"))
    rejection_reason: Mapped[Optional[str]]                = mapped_column(Text)

    created_at:       Mapped[datetime]                     = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at:       Mapped[datetime]                     = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    deleted_at:       Mapped[Optional[datetime]]           = mapped_column(DateTime(timezone=True))

    # Relationships
    service:          Mapped["Service"]                    = relationship(back_populates="versions", foreign_keys=[service_id])
    media:            Mapped[List["ServiceMedia"]]         = relationship(back_populates="version", cascade="all, delete-orphan")
    variants:         Mapped[List["ServiceVariant"]]       = relationship(back_populates="version", cascade="all, delete-orphan")
    audit_log:        Mapped[List["ServiceVersionAudit"]]  = relationship(back_populates="version", cascade="all, delete-orphan")

    # Service-type detail relationships (each is 1-to-1)
    venue_detail:             Mapped[Optional["Venue"]]                  = relationship(back_populates="version", uselist=False, cascade="all, delete-orphan")
    catering_detail:          Mapped[Optional["CateringDetail"]]         = relationship(back_populates="version", uselist=False, cascade="all, delete-orphan")
    dj_detail:                Mapped[Optional["DjDetail"]]               = relationship(back_populates="version", uselist=False, cascade="all, delete-orphan")
    photography_detail:       Mapped[Optional["PhotographyDetail"]]      = relationship(back_populates="version", uselist=False, cascade="all, delete-orphan")
    event_management_detail:  Mapped[Optional["EventManagementDetail"]]  = relationship(back_populates="version", uselist=False, cascade="all, delete-orphan")
    makeup_artist_detail:     Mapped[Optional["MakeupArtistDetail"]]     = relationship(back_populates="version", uselist=False, cascade="all, delete-orphan")

    __table_args__ = (
        UniqueConstraint("service_id", "version_number", name="uq_service_version_number"),
        Index("idx_service_versions_city", "city"),
        Index("idx_service_versions_state", "state"),
        Index("idx_service_versions_location", "city", "state"),
        Index("idx_service_versions_deleted", "deleted_at"),
        Index("idx_service_search", "search_vector", postgresql_using="gin"),
    )


class ServiceVersionAudit(Base):
    __tablename__ = "service_version_audit"

    id:                  Mapped[int]           = mapped_column(BigInteger, primary_key=True)
    service_version_id:  Mapped[int]           = mapped_column(BigInteger, ForeignKey("service_versions.id", ondelete="CASCADE"), nullable=False)
    action:              Mapped[str]           = mapped_column(String(50), nullable=False)
    performed_by:        Mapped[Optional[int]] = mapped_column(BigInteger)
    performed_by_type:   Mapped[Optional[str]] = mapped_column(String(20))  # 'admin' | 'vendor'
    old_data:            Mapped[Optional[dict]] = mapped_column(JSONB)
    new_data:            Mapped[Optional[dict]] = mapped_column(JSONB)
    created_at:          Mapped[datetime]       = mapped_column(DateTime(timezone=True), server_default=func.now())

    version: Mapped["ServiceVersion"] = relationship(back_populates="audit_log")

    __table_args__ = (
        Index("idx_sva_version", "service_version_id"),
        Index("idx_sva_performed_by", "performed_by"),
    )


# =============================================================
# SECTION 4: SERVICE MEDIA
# =============================================================

class ServiceMedia(Base):
    __tablename__ = "service_media"

    id:                 Mapped[int]           = mapped_column(BigInteger, primary_key=True)
    service_version_id: Mapped[int]           = mapped_column(BigInteger, ForeignKey("service_versions.id", ondelete="CASCADE"), nullable=False)
    media_url:          Mapped[str]           = mapped_column(Text, nullable=False)
    media_type:         Mapped[str]           = mapped_column(String(20), nullable=False)
    is_cover:           Mapped[bool]          = mapped_column(Boolean, server_default=text("false"))
    display_order:      Mapped[int]           = mapped_column(Integer, server_default=text("0"))
    metadata_: Mapped[dict] = mapped_column(
    "metadata",
    JSONB,
    nullable=True,
    default=dict
)
    created_at:         Mapped[datetime]      = mapped_column(DateTime(timezone=True), server_default=func.now())

    version: Mapped["ServiceVersion"] = relationship(back_populates="media")

    __table_args__ = (
        CheckConstraint("media_type IN ('image', 'video')", name="chk_media_type"),
        # Partial unique index for cover image — defined via Index below
        Index("idx_media_version", "service_version_id"),
        # Unique cover per version handled in DB via partial unique index:
        # CREATE UNIQUE INDEX idx_media_unique_cover ON service_media(service_version_id) WHERE is_cover = TRUE
    )
print(ServiceMedia.__table__.columns.keys())

# =============================================================
# SECTION 5: SERVICE VARIANTS
# =============================================================

class ServiceVariant(Base):
    __tablename__ = "service_variants"

    id:                 Mapped[int]           = mapped_column(BigInteger, primary_key=True)
    service_version_id: Mapped[int]           = mapped_column(BigInteger, ForeignKey("service_versions.id", ondelete="CASCADE"), nullable=False)

    variant_name:   Mapped[str]              = mapped_column(String(100), nullable=False)
    description:    Mapped[Optional[str]]    = mapped_column(Text)

    min_quantity:   Mapped[Optional[int]]    = mapped_column(Integer)
    max_quantity:   Mapped[Optional[int]]    = mapped_column(Integer)

    pricing_type:   Mapped[str]              = mapped_column(String(50), nullable=False)
    currency:       Mapped[str]              = mapped_column(String(10), server_default="INR")

    pricing:        Mapped[dict]             = mapped_column(JSONB, nullable=False)
    menu:           Mapped[Optional[dict]]   = mapped_column(JSONB)
    deliverables:   Mapped[Optional[dict]]   = mapped_column(JSONB)
    inclusions:     Mapped[Optional[dict]]   = mapped_column(JSONB)
    exclusions:     Mapped[Optional[dict]]   = mapped_column(JSONB)
    policies:       Mapped[Optional[dict]]   = mapped_column(JSONB)
    metadata_:      Mapped[dict]             = mapped_column("metadata",JSONB,nullable=True,default=dict)

    is_default:     Mapped[bool]             = mapped_column(Boolean, server_default=text("false"))
    is_active:      Mapped[bool]             = mapped_column(Boolean, server_default=text("true"))

    created_at:     Mapped[datetime]         = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at:     Mapped[datetime]         = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    version: Mapped["ServiceVersion"] = relationship(back_populates="variants")

    __table_args__ = (
        UniqueConstraint("service_version_id", "variant_name", name="uq_variant_version_name"),
        Index("idx_variant_version", "service_version_id"),
        Index("idx_variant_pricing_type", "pricing_type"),
        Index("idx_variant_pricing_json", "pricing", postgresql_using="gin", postgresql_ops={"pricing": "jsonb_path_ops"}),
    )


# =============================================================
# SECTION 6: SERVICE-TYPE DETAIL TABLES
# =============================================================

class Venue(Base):
    __tablename__ = "venues"

    id:                 Mapped[int]           = mapped_column(BigInteger, primary_key=True)
    service_version_id: Mapped[int]           = mapped_column(BigInteger, ForeignKey("service_versions.id", ondelete="CASCADE"), nullable=False, unique=True)

    venue_type:         Mapped[str]           = mapped_column(String(50), nullable=False)
    venue_nature:       Mapped[str]           = mapped_column(String(20), nullable=False)
    min_capacity:       Mapped[int]           = mapped_column(Integer, nullable=False)
    max_capacity:       Mapped[int]           = mapped_column(Integer, nullable=False)
    square_feet:        Mapped[int]           = mapped_column(Integer, nullable=False)
    parking_capacity:   Mapped[int]           = mapped_column(Integer, server_default=text("0"))
    venue_policies:     Mapped[dict]          = mapped_column(JSONB, nullable=False, server_default=text("'{}'::jsonb"))

    created_at:         Mapped[datetime]      = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at:         Mapped[datetime]      = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    version: Mapped["ServiceVersion"] = relationship(back_populates="venue_detail")

    __table_args__ = (
        Index("idx_venue_type", "venue_type"),
        Index("idx_venue_capacity", "max_capacity"),
        Index("idx_venue_policies", "venue_policies", postgresql_using="gin"),
        Index("idx_venue_version", "service_version_id"),
    )


class CateringDetail(Base):
    __tablename__ = "catering_details"

    id:                         Mapped[int]              = mapped_column(BigInteger, primary_key=True)
    service_version_id:         Mapped[int]              = mapped_column(BigInteger, ForeignKey("service_versions.id", ondelete="CASCADE"), nullable=False, unique=True)

    cuisine_types:              Mapped[list]             = mapped_column(JSONB, nullable=False, server_default=text("'[]'::jsonb"))
    meal_types:                 Mapped[Optional[list]]   = mapped_column(ARRAY(String(20)), server_default=text("ARRAY['lunch']"))

    veg_price_per_head:         Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2))
    non_veg_price_per_head:     Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2))

    min_order:                  Mapped[int]              = mapped_column(Integer, nullable=False)
    max_order:                  Mapped[Optional[int]]    = mapped_column(Integer)

    service_styles:             Mapped[list]             = mapped_column(JSONB, nullable=False, server_default=text("'[]'::jsonb"))

    staff_included:             Mapped[bool]             = mapped_column(Boolean, server_default=text("true"))
    crockery_cutlery_included:  Mapped[bool]             = mapped_column(Boolean, server_default=text("true"))
    tasting_available:          Mapped[bool]             = mapped_column(Boolean, server_default=text("false"))

    setup_time_minutes:         Mapped[Optional[int]]    = mapped_column(Integer)
    service_duration_minutes:   Mapped[Optional[int]]    = mapped_column(Integer)

    travel_cost_per_km:         Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2))
    base_city:                  Mapped[Optional[str]]    = mapped_column(String(100))

    gst_percentage:             Mapped[Decimal]          = mapped_column(Numeric(5, 2), server_default=text("5.00"))
    price_includes_tax:         Mapped[bool]             = mapped_column(Boolean, server_default=text("false"))

    special_diets_supported:    Mapped[list]             = mapped_column(JSONB, server_default=text("'[]'::jsonb"))
    customizable_menu:          Mapped[bool]             = mapped_column(Boolean, server_default=text("true"))
    is_active:                  Mapped[bool]             = mapped_column(Boolean, server_default=text("true"))

    created_at:                 Mapped[datetime]         = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at:                 Mapped[datetime]         = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    version: Mapped["ServiceVersion"] = relationship(back_populates="catering_detail")

    __table_args__ = (
        CheckConstraint("veg_price_per_head >= 0", name="chk_veg_price"),
        CheckConstraint("non_veg_price_per_head >= 0", name="chk_non_veg_price"),
        CheckConstraint("min_order > 0", name="chk_min_order"),
        CheckConstraint("max_order IS NULL OR max_order >= min_order", name="chk_catering_max_order"),
        Index("idx_catering_version", "service_version_id"),
        Index("idx_catering_cuisine", "cuisine_types", postgresql_using="gin"),
        Index("idx_catering_styles", "service_styles", postgresql_using="gin"),
        Index("idx_catering_diets", "special_diets_supported", postgresql_using="gin"),
    )


class DjDetail(Base):
    __tablename__ = "dj_details"

    id:                          Mapped[int]              = mapped_column(BigInteger, primary_key=True)
    service_version_id:          Mapped[int]              = mapped_column(BigInteger, ForeignKey("service_versions.id", ondelete="CASCADE"), nullable=False, unique=True)

    genres_supported:            Mapped[list]             = mapped_column(JSONB, nullable=False, server_default=text("'[]'::jsonb"))
    languages_supported:         Mapped[list]             = mapped_column(JSONB, server_default=text("'[]'::jsonb"))
    event_types_supported:       Mapped[Optional[list]]   = mapped_column(ARRAY(Enum(DjEventTypeEnum, name="dj_event_type_enum")))

    performance_duration_hours:  Mapped[Decimal]          = mapped_column(Numeric(5, 2), nullable=False)
    overtime_rate_per_hour:      Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2))

    equipments_provided:         Mapped[list]             = mapped_column(JSONB, server_default=text("'[]'::jsonb"))

    sound_system_included:       Mapped[bool]             = mapped_column(Boolean, server_default=text("true"))
    lighting_included:           Mapped[bool]             = mapped_column(Boolean, server_default=text("false"))
    smoke_machine_included:      Mapped[bool]             = mapped_column(Boolean, server_default=text("false"))
    led_wall_included:           Mapped[bool]             = mapped_column(Boolean, server_default=text("false"))
    mc_host_available:           Mapped[bool]             = mapped_column(Boolean, server_default=text("false"))

    crowd_interaction_level:     Mapped[Optional[str]]    = mapped_column(String(20))

    setup_time_minutes:          Mapped[Optional[int]]    = mapped_column(Integer)
    teardown_time_minutes:       Mapped[Optional[int]]    = mapped_column(Integer)
    power_requirement_kw:        Mapped[Optional[Decimal]] = mapped_column(Numeric(5, 2))
    backup_power_required:       Mapped[bool]             = mapped_column(Boolean, server_default=text("false"))

    travel_cost_per_km:          Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2))
    base_city:                   Mapped[Optional[str]]    = mapped_column(String(100))

    outdoor_supported:           Mapped[bool]             = mapped_column(Boolean, server_default=text("true"))
    late_night_allowed:          Mapped[bool]             = mapped_column(Boolean, server_default=text("true"))
    sound_license_required:      Mapped[bool]             = mapped_column(Boolean, server_default=text("true"))
    custom_playlist_allowed:     Mapped[bool]             = mapped_column(Boolean, server_default=text("true"))
    playlist_link_supported:     Mapped[bool]             = mapped_column(Boolean, server_default=text("true"))

    experience_years:            Mapped[int]              = mapped_column(SmallInteger, server_default=text("0"))
    total_events_performed:      Mapped[int]              = mapped_column(Integer, server_default=text("0"))
    is_active:                   Mapped[bool]             = mapped_column(Boolean, server_default=text("true"))

    created_at:                  Mapped[datetime]         = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at:                  Mapped[datetime]         = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    version: Mapped["ServiceVersion"] = relationship(back_populates="dj_detail")

    __table_args__ = (
        CheckConstraint("performance_duration_hours > 0", name="chk_dj_duration"),
        CheckConstraint(
            "crowd_interaction_level IS NULL OR crowd_interaction_level IN ('low','medium','high')",
            name="chk_dj_crowd_level",
        ),
        Index("idx_dj_version", "service_version_id"),
        Index("idx_dj_genres", "genres_supported", postgresql_using="gin"),
        Index("idx_dj_languages", "languages_supported", postgresql_using="gin"),
        Index("idx_dj_equipment", "equipments_provided", postgresql_using="gin"),
    )


class PhotographyDetail(Base):
    __tablename__ = "photography_details"

    id:                              Mapped[int]              = mapped_column(BigInteger, primary_key=True)
    service_version_id:              Mapped[int]              = mapped_column(BigInteger, ForeignKey("service_versions.id", ondelete="CASCADE"), nullable=False, unique=True)

    photography_types:               Mapped[list]             = mapped_column(JSONB, nullable=False, server_default=text("'[]'::jsonb"))
    videography_available:           Mapped[bool]             = mapped_column(Boolean, server_default=text("false"))
    drone_shoot_available:           Mapped[bool]             = mapped_column(Boolean, server_default=text("false"))

    photo_delivery_count:            Mapped[Optional[int]]    = mapped_column(Integer)
    video_delivery_duration_minutes: Mapped[Optional[int]]    = mapped_column(Integer)

    edited_photos_included:          Mapped[bool]             = mapped_column(Boolean, server_default=text("true"))
    raw_photos_provided:             Mapped[bool]             = mapped_column(Boolean, server_default=text("false"))
    album_included:                  Mapped[bool]             = mapped_column(Boolean, server_default=text("false"))
    album_pages:                     Mapped[Optional[int]]    = mapped_column(Integer)

    coverage_hours:                  Mapped[Optional[Decimal]] = mapped_column(Numeric(5, 2))
    overtime_rate_per_hour:          Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2))

    team_size:                       Mapped[int]              = mapped_column(Integer, server_default=text("1"))
    second_shooter_included:         Mapped[bool]             = mapped_column(Boolean, server_default=text("false"))

    editing_styles:                  Mapped[list]             = mapped_column(JSONB, server_default=text("'[]'::jsonb"))
    travel_cost_per_km:              Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2))
    base_city:                       Mapped[Optional[str]]    = mapped_column(String(100))

    experience_years:                Mapped[int]              = mapped_column(SmallInteger, server_default=text("0"))
    total_events_covered:            Mapped[int]              = mapped_column(Integer, server_default=text("0"))
    is_active:                       Mapped[bool]             = mapped_column(Boolean, server_default=text("true"))

    created_at:                      Mapped[datetime]         = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at:                      Mapped[datetime]         = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    version: Mapped["ServiceVersion"] = relationship(back_populates="photography_detail")

    __table_args__ = (
        Index("idx_photo_version", "service_version_id"),
        Index("idx_photo_types", "photography_types", postgresql_using="gin"),
        Index("idx_photo_editing", "editing_styles", postgresql_using="gin"),
    )


class EventManagementDetail(Base):
    __tablename__ = "event_management_details"

    id:                             Mapped[int]              = mapped_column(BigInteger, primary_key=True)
    service_version_id:             Mapped[int]              = mapped_column(BigInteger, ForeignKey("service_versions.id", ondelete="CASCADE"), nullable=False, unique=True)

    event_types_supported:          Mapped[list]             = mapped_column(JSONB, nullable=False, server_default=text("'[]'::jsonb"))
    services_offered:               Mapped[list]             = mapped_column(JSONB, server_default=text("'[]'::jsonb"))
    themes_supported:               Mapped[list]             = mapped_column(JSONB, server_default=text("'[]'::jsonb"))

    team_size:                      Mapped[Optional[int]]    = mapped_column(Integer)
    on_site_managers:               Mapped[int]              = mapped_column(Integer, server_default=text("1"))

    decoration_included:            Mapped[bool]             = mapped_column(Boolean, server_default=text("false"))
    catering_management:            Mapped[bool]             = mapped_column(Boolean, server_default=text("false"))
    entertainment_management:       Mapped[bool]             = mapped_column(Boolean, server_default=text("false"))
    vendor_coordination_included:   Mapped[bool]             = mapped_column(Boolean, server_default=text("false"))
    guest_management_included:      Mapped[bool]             = mapped_column(Boolean, server_default=text("false"))
    logistics_management_included:  Mapped[bool]             = mapped_column(Boolean, server_default=text("false"))

    planning_duration_days:         Mapped[Optional[int]]    = mapped_column(Integer)
    setup_time_hours:               Mapped[Optional[Decimal]] = mapped_column(Numeric(5, 2))
    teardown_time_hours:            Mapped[Optional[Decimal]] = mapped_column(Numeric(5, 2))

    min_budget:                     Mapped[Optional[Decimal]] = mapped_column(Numeric(12, 2))
    max_budget:                     Mapped[Optional[Decimal]] = mapped_column(Numeric(12, 2))

    travel_cost_per_km:             Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2))
    base_city:                      Mapped[Optional[str]]    = mapped_column(String(100))
    serviceable_cities:             Mapped[list]             = mapped_column(JSONB, server_default=text("'[]'::jsonb"))

    experience_years:               Mapped[int]              = mapped_column(SmallInteger, server_default=text("0"))
    total_events_managed:           Mapped[int]              = mapped_column(Integer, server_default=text("0"))
    is_active:                      Mapped[bool]             = mapped_column(Boolean, server_default=text("true"))

    version_notes:                  Mapped[Optional[str]]    = mapped_column(Text)
    created_by:                     Mapped[Optional[int]]    = mapped_column(BigInteger)
    updated_by:                     Mapped[Optional[int]]    = mapped_column(BigInteger)

    created_at:                     Mapped[datetime]         = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at:                     Mapped[datetime]         = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    version: Mapped["ServiceVersion"] = relationship(back_populates="event_management_detail")

    __table_args__ = (
        CheckConstraint("max_budget IS NULL OR min_budget IS NULL OR max_budget >= min_budget", name="chk_event_budget_valid"),
        Index("idx_event_version", "service_version_id"),
        Index("idx_event_types", "event_types_supported", postgresql_using="gin"),
        Index("idx_event_services", "services_offered", postgresql_using="gin"),
        Index("idx_event_themes", "themes_supported", postgresql_using="gin"),
        Index("idx_event_serviceable_cities", "serviceable_cities", postgresql_using="gin"),
    )


class MakeupArtistDetail(Base):
    __tablename__ = "makeup_artist_details"

    id:                      Mapped[int]              = mapped_column(BigInteger, primary_key=True)
    service_version_id:      Mapped[int]              = mapped_column(BigInteger, ForeignKey("service_versions.id", ondelete="CASCADE"), nullable=False, unique=True)

    makeup_types:            Mapped[list]             = mapped_column(JSONB, nullable=False, server_default=text("'[]'::jsonb"))
    specialization:          Mapped[list]             = mapped_column(JSONB, nullable=False, server_default=text("'[]'::jsonb"))
    brands_used:             Mapped[list]             = mapped_column(JSONB, server_default=text("'[]'::jsonb"))
    premium_products_used:   Mapped[bool]             = mapped_column(Boolean, server_default=text("true"))

    team_size:               Mapped[int]              = mapped_column(Integer, server_default=text("1"))
    assistants_count:        Mapped[int]              = mapped_column(Integer, server_default=text("0"))

    service_duration_minutes: Mapped[Optional[int]]   = mapped_column(Integer)
    travel_to_client:        Mapped[bool]             = mapped_column(Boolean, server_default=text("true"))

    travel_cost_per_km:      Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2))
    base_city:               Mapped[Optional[str]]    = mapped_column(String(100))
    serviceable_cities:      Mapped[list]             = mapped_column(JSONB, server_default=text("'[]'::jsonb"))

    hairstyling_included:    Mapped[bool]             = mapped_column(Boolean, server_default=text("true"))
    draping_included:        Mapped[bool]             = mapped_column(Boolean, server_default=text("false"))
    nail_art_available:      Mapped[bool]             = mapped_column(Boolean, server_default=text("false"))
    trial_available:         Mapped[bool]             = mapped_column(Boolean, server_default=text("false"))
    paid_trial_available:    Mapped[bool]             = mapped_column(Boolean, server_default=text("false"))
    trial_cost:              Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2))

    experience_years:        Mapped[int]              = mapped_column(SmallInteger, server_default=text("0"))
    total_clients_served:    Mapped[int]              = mapped_column(Integer, server_default=text("0"))
    total_bridal_bookings:   Mapped[int]              = mapped_column(Integer, server_default=text("0"))
    is_active:               Mapped[bool]             = mapped_column(Boolean, server_default=text("true"))

    version_notes:           Mapped[Optional[str]]    = mapped_column(Text)
    created_by:              Mapped[Optional[int]]    = mapped_column(BigInteger)
    updated_by:              Mapped[Optional[int]]    = mapped_column(BigInteger)

    created_at:              Mapped[datetime]         = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at:              Mapped[datetime]         = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    version: Mapped["ServiceVersion"] = relationship(back_populates="makeup_artist_detail")

    __table_args__ = (
        Index("idx_makeup_version", "service_version_id"),
        Index("idx_makeup_types", "makeup_types", postgresql_using="gin"),
        Index("idx_makeup_specialization", "specialization", postgresql_using="gin"),
        Index("idx_makeup_brands", "brands_used", postgresql_using="gin"),
        Index("idx_makeup_serviceable_cities", "serviceable_cities", postgresql_using="gin"),
    )


# =============================================================
# SECTION 7: REVIEWS + RATING SUMMARY
# =============================================================

class Review(Base):
    __tablename__ = "reviews"

    id:                     Mapped[int]           = mapped_column(BigInteger, primary_key=True)
    service_id:             Mapped[int]           = mapped_column(BigInteger, ForeignKey("services.id", ondelete="CASCADE"), nullable=False)
    user_id:                Mapped[int]           = mapped_column(BigInteger, ForeignKey("customer.id", ondelete="CASCADE"), nullable=False)

    overall_rating:         Mapped[int]           = mapped_column(SmallInteger, nullable=False)
    food_beverage_rating:   Mapped[Optional[int]] = mapped_column(SmallInteger)
    service_quality_rating: Mapped[Optional[int]] = mapped_column(SmallInteger)
    ambiance_rating:        Mapped[Optional[int]] = mapped_column(SmallInteger)
    value_for_money_rating: Mapped[Optional[int]] = mapped_column(SmallInteger)

    title:                  Mapped[Optional[str]] = mapped_column(String(255))
    review_text:            Mapped[Optional[str]] = mapped_column(Text)

    event_type:             Mapped[Optional[str]] = mapped_column(String(100))
    event_date:             Mapped[Optional[date]] = mapped_column(Date)

    photos:                 Mapped[Optional[dict]] = mapped_column(JSONB)
    helpful_count:          Mapped[int]           = mapped_column(Integer, server_default=text("0"))

    created_at:             Mapped[datetime]      = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at:             Mapped[datetime]      = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    deleted_at:             Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

    service:  Mapped["Service"]   = relationship(back_populates="reviews")
    customer: Mapped["Customer"]  = relationship(back_populates="reviews")

    __table_args__ = (
        CheckConstraint("overall_rating BETWEEN 1 AND 5", name="chk_overall_rating"),
        CheckConstraint("food_beverage_rating IS NULL OR food_beverage_rating BETWEEN 1 AND 5", name="chk_fb_rating"),
        CheckConstraint("service_quality_rating IS NULL OR service_quality_rating BETWEEN 1 AND 5", name="chk_sq_rating"),
        CheckConstraint("ambiance_rating IS NULL OR ambiance_rating BETWEEN 1 AND 5", name="chk_ambiance_rating"),
        CheckConstraint("value_for_money_rating IS NULL OR value_for_money_rating BETWEEN 1 AND 5", name="chk_vfm_rating"),
        Index("idx_reviews_service", "service_id"),
        Index("idx_reviews_user", "user_id"),
        Index("idx_reviews_deleted", "deleted_at"),
    )


class ServiceRatingSummary(Base):
    __tablename__ = "service_rating_summary"

    id:               Mapped[int]           = mapped_column(BigInteger, primary_key=True)
    service_id:       Mapped[int]           = mapped_column(BigInteger, ForeignKey("services.id", ondelete="CASCADE"), nullable=False, unique=True)
    average_rating:   Mapped[Decimal]       = mapped_column(Numeric(3, 2), server_default=text("0"))
    total_reviews:    Mapped[int]           = mapped_column(Integer, server_default=text("0"))
    rating_breakdown: Mapped[dict]          = mapped_column(JSONB, server_default=text("""'{"1":0,"2":0,"3":0,"4":0,"5":0}'::jsonb"""))
    updated_at:       Mapped[datetime]      = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    service: Mapped["Service"] = relationship(back_populates="rating_summary")

    __table_args__ = (
        Index("idx_rating_summary_service", "service_id"),
    )


# =============================================================
# SECTION 8: WISHLISTS & FAVORITES
# =============================================================

class Wishlist(Base):
    __tablename__ = "wishlists"

    id:          Mapped[int]           = mapped_column(BigInteger, primary_key=True)
    user_id:     Mapped[int]           = mapped_column(BigInteger, ForeignKey("customer.id", ondelete="CASCADE"), nullable=False)
    name:        Mapped[str]           = mapped_column(String(150), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    is_default:  Mapped[bool]          = mapped_column(Boolean, server_default=text("false"))
    is_public:   Mapped[bool]          = mapped_column(Boolean, server_default=text("false"))
    created_at:  Mapped[datetime]      = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at:  Mapped[datetime]      = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    customer:   Mapped["Customer"]      = relationship(back_populates="wishlists")
    favorites:  Mapped[List["Favorite"]] = relationship(back_populates="wishlist", cascade="all, delete-orphan")


class Favorite(Base):
    __tablename__ = "favorites"

    id:          Mapped[int]           = mapped_column(BigInteger, primary_key=True)
    wishlist_id: Mapped[int]           = mapped_column(BigInteger, ForeignKey("wishlists.id", ondelete="CASCADE"), nullable=False)
    service_id:  Mapped[int]           = mapped_column(BigInteger, ForeignKey("services.id", ondelete="CASCADE"), nullable=False)
    note:        Mapped[Optional[str]] = mapped_column(Text)
    priority:    Mapped[int]           = mapped_column(SmallInteger, server_default=text("0"))
    created_at:  Mapped[datetime]      = mapped_column(DateTime(timezone=True), server_default=func.now())

    wishlist: Mapped["Wishlist"] = relationship(back_populates="favorites")
    service:  Mapped["Service"]  = relationship(back_populates="wishlisted_by")

    __table_args__ = (
        UniqueConstraint("wishlist_id", "service_id", name="uq_favorite_wishlist_service"),
    )


# =============================================================
# SECTION 9: AVAILABILITY
# =============================================================

class UnavailableDate(Base):
    __tablename__ = "unavailable_dates"

    id:         Mapped[int]           = mapped_column(BigInteger, primary_key=True)
    service_id: Mapped[int]           = mapped_column(BigInteger, ForeignKey("services.id", ondelete="CASCADE"), nullable=False)
    start_date: Mapped[date]          = mapped_column(Date, nullable=False)
    end_date:   Mapped[date]          = mapped_column(Date, nullable=False)
    reason:     Mapped[Optional[str]] = mapped_column(String(255))
    created_at: Mapped[datetime]      = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime]      = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    service: Mapped["Service"] = relationship(back_populates="unavailable_dates")

    __table_args__ = (
        Index("idx_unavailable_service_dates", "service_id", "start_date", "end_date"),
    )


class VendorUnavailableDate(Base):
    __tablename__ = "vendor_unavailable_dates"

    id:         Mapped[int]           = mapped_column(BigInteger, primary_key=True)
    vendor_id:  Mapped[int]           = mapped_column(BigInteger, ForeignKey("vendor.id", ondelete="CASCADE"), nullable=False)
    service_id: Mapped[int]           = mapped_column(BigInteger, ForeignKey("services.id", ondelete="CASCADE"), nullable=False)
    start_date: Mapped[datetime]      = mapped_column(DateTime, nullable=False)
    end_date:   Mapped[datetime]      = mapped_column(DateTime, nullable=False)
    reason:     Mapped[Optional[str]] = mapped_column(String(255))
    created_at: Mapped[datetime]      = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime]      = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    vendor:  Mapped["Vendor"]  = relationship(back_populates="unavailable_dates")

    __table_args__ = (
        Index("idx_unavailable_vendor_dates", "vendor_id", "start_date", "end_date"),
        Index("idx_unavailable_service", "service_id"),
    )


# =============================================================
# SECTION 10: LEADS
# =============================================================

class Lead(Base):
    __tablename__ = "leads"

    id:              Mapped[int]                      = mapped_column(BigInteger, primary_key=True)
    user_id:         Mapped[int]                      = mapped_column(BigInteger, ForeignKey("customer.id", ondelete="RESTRICT"), nullable=False)
    vendor_id:       Mapped[int]                      = mapped_column(BigInteger, ForeignKey("vendor.id", ondelete="RESTRICT"), nullable=False)
    service_id:      Mapped[int]                      = mapped_column(BigInteger, ForeignKey("services.id", ondelete="RESTRICT"), nullable=False)

    service_type:    Mapped[Optional[ServiceTypeEnum]] = mapped_column(Enum(ServiceTypeEnum, name="service_type_enum"))

    name:            Mapped[Optional[str]]            = mapped_column(String(100))
    phone:           Mapped[Optional[str]]            = mapped_column(String(20))
    email:           Mapped[Optional[str]]            = mapped_column(String(100))

    event_type:      Mapped[Optional[str]]            = mapped_column(String(50))
    event_date:      Mapped[Optional[date]]           = mapped_column(Date)
    event_time:      Mapped[Optional[time]]           = mapped_column(Time)

    location:        Mapped[Optional[str]]            = mapped_column(String(255))
    budget_range:    Mapped[Optional[str]]            = mapped_column(String(50))
    guests:          Mapped[Optional[int]]            = mapped_column(Integer)
    description:     Mapped[Optional[str]]            = mapped_column(Text)

    status:          Mapped[LeadStatusEnum]           = mapped_column(
        Enum(LeadStatusEnum, name="lead_status"),
        nullable=False,
        server_default="new",
    )
    customer_status: Mapped[CustomerLeadStatusEnum]   = mapped_column(
        Enum(CustomerLeadStatusEnum, name="customer_lead_status"),
        nullable=False,
        server_default="REQUEST_SUBMITTED",
    )
    phone_unlocked:  Mapped[bool]                     = mapped_column(Boolean, server_default=text("false"))

    created_at:      Mapped[datetime]                 = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at:      Mapped[datetime]                 = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    customer: Mapped["Customer"]         = relationship(back_populates="leads", foreign_keys=[user_id])
    vendor:   Mapped["Vendor"]           = relationship(back_populates="leads", foreign_keys=[vendor_id])
    service:  Mapped["Service"]          = relationship(back_populates="leads")
    actions:  Mapped[List["LeadAction"]] = relationship(back_populates="lead", cascade="all, delete-orphan")
    booking:  Mapped[Optional["Booking"]] = relationship(back_populates="lead", uselist=False)

    __table_args__ = (
        Index("idx_vendor_leads", "vendor_id"),
        Index("idx_user_leads", "user_id"),
        Index("idx_service_leads", "service_id"),
        Index("idx_event_date", "event_date"),
    )


class LeadAction(Base):
    __tablename__ = "lead_actions"

    id:        Mapped[int]      = mapped_column(BigInteger, primary_key=True)
    lead_id:   Mapped[int]      = mapped_column(BigInteger, ForeignKey("leads.id", ondelete="CASCADE"), nullable=False)
    vendor_id: Mapped[int]      = mapped_column(BigInteger, ForeignKey("vendor.id", ondelete="CASCADE"), nullable=False)
    action:    Mapped[str]      = mapped_column(String(20), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    lead: Mapped["Lead"] = relationship(back_populates="actions")

    __table_args__ = (
        Index("idx_lead_actions_lead", "lead_id"),
        Index("idx_lead_actions_vendor", "vendor_id"),
    )


# =============================================================
# SECTION 11: BOOKINGS
# =============================================================

class Booking(Base):
    __tablename__ = "bookings"

    id:             Mapped[int]           = mapped_column(BigInteger, primary_key=True)
    customer_id:    Mapped[int]           = mapped_column(BigInteger, ForeignKey("customer.id", ondelete="RESTRICT"), nullable=False)
    vendor_id:      Mapped[int]           = mapped_column(BigInteger, ForeignKey("vendor.id", ondelete="RESTRICT"), nullable=False)
    service_id:     Mapped[int]           = mapped_column(BigInteger, ForeignKey("services.id", ondelete="RESTRICT"), nullable=False)
    lead_id:        Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("leads.id", ondelete="SET NULL"))

    event_date:     Mapped[date]          = mapped_column(Date, nullable=False)
    booking_amount: Mapped[Decimal]       = mapped_column(Numeric(12, 2), nullable=False)
    currency:       Mapped[str]           = mapped_column(String(10), server_default="INR")

    # confirmed | completed | cancelled | refunded
    status:         Mapped[str]           = mapped_column(String(20), nullable=False, server_default="confirmed")

    notes:          Mapped[Optional[str]] = mapped_column(Text)
    metadata_:       Mapped[Optional[dict]] = mapped_column(JSONB)

    created_at:     Mapped[datetime]      = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at:     Mapped[datetime]      = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    customer: Mapped["Customer"]          = relationship(back_populates="bookings")
    vendor:   Mapped["Vendor"]            = relationship(back_populates="bookings")
    service:  Mapped["Service"]           = relationship(back_populates="bookings")
    lead:     Mapped[Optional["Lead"]]    = relationship(back_populates="booking")
    payouts:  Mapped[List["VendorPayout"]] = relationship(back_populates="booking", cascade="all, delete-orphan")

    __table_args__ = (
        CheckConstraint("booking_amount >= 0", name="chk_booking_amount"),
        Index("idx_bookings_customer", "customer_id"),
        Index("idx_bookings_vendor", "vendor_id"),
        Index("idx_bookings_service", "service_id"),
        Index("idx_bookings_date", "event_date"),
    )


# =============================================================
# SECTION 12: SUBSCRIPTIONS
# =============================================================

class Subscription(Base):
    __tablename__ = "subscriptions"

    id:                 Mapped[int]           = mapped_column(BigInteger, primary_key=True)
    name:               Mapped[str]           = mapped_column(String(50), nullable=False)
    daily_unlock_limit: Mapped[int]           = mapped_column(Integer, nullable=False, server_default=text("0"))
    price:              Mapped[Decimal]       = mapped_column(Numeric(10, 2), nullable=False, server_default=text("0"))
    description:        Mapped[Optional[str]] = mapped_column(Text)
    is_active:          Mapped[bool]          = mapped_column(Boolean, server_default=text("true"))
    created_at:         Mapped[datetime]      = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at:         Mapped[datetime]      = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    vendor_subscriptions: Mapped[List["VendorSubscription"]] = relationship(back_populates="subscription")


class VendorSubscription(Base):
    __tablename__ = "vendor_subscriptions"

    id:              Mapped[int]           = mapped_column(BigInteger, primary_key=True)
    vendor_id:       Mapped[int]           = mapped_column(BigInteger, ForeignKey("vendor.id", ondelete="CASCADE"), nullable=False)
    subscription_id: Mapped[int]           = mapped_column(BigInteger, ForeignKey("subscriptions.id", ondelete="RESTRICT"), nullable=False)
    started_at:      Mapped[datetime]      = mapped_column(DateTime(timezone=True), server_default=func.now())
    expires_at:      Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    status:          Mapped[str]           = mapped_column(String(20), server_default="active")
    created_at:      Mapped[datetime]      = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at:      Mapped[datetime]      = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    vendor:       Mapped["Vendor"]       = relationship(back_populates="subscriptions")
    subscription: Mapped["Subscription"] = relationship(back_populates="vendor_subscriptions")

    __table_args__ = (
        Index("idx_vendor_subscriptions_vendor", "vendor_id"),
        Index("idx_vendor_subscriptions_sub", "subscription_id"),
    )


class UnlockUsage(Base):
    __tablename__ = "unlock_usage"

    id:         Mapped[int]      = mapped_column(BigInteger, primary_key=True)
    vendor_id:  Mapped[int]      = mapped_column(BigInteger, ForeignKey("vendor.id", ondelete="CASCADE"), nullable=False)
    usage_date: Mapped[date]     = mapped_column(Date, nullable=False)
    used_count: Mapped[int]      = mapped_column(Integer, server_default=text("0"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        UniqueConstraint("vendor_id", "usage_date", name="uq_unlock_usage_vendor_date"),
        Index("idx_unlock_usage_vendor", "vendor_id", "usage_date"),
    )


# =============================================================
# SECTION 13: NOTIFICATIONS
# =============================================================

class Notification(Base):
    __tablename__ = "notifications"

    id:             Mapped[int]                      = mapped_column(BigInteger, primary_key=True)
    recipient_id:   Mapped[int]                      = mapped_column(BigInteger, nullable=False)
    recipient_type: Mapped[str]                      = mapped_column(String(20), nullable=False)

    type:           Mapped[NotificationTypeEnum]     = mapped_column(
        Enum(NotificationTypeEnum, name="notification_type_enum"),
        nullable=False,
    )

    title:          Mapped[Optional[str]]            = mapped_column(String(255))
    message:        Mapped[Optional[str]]            = mapped_column(Text)
    data:           Mapped[Optional[dict]]           = mapped_column(JSONB)

    is_read:        Mapped[bool]                     = mapped_column(Boolean, server_default=text("false"))
    created_at:     Mapped[datetime]                 = mapped_column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        CheckConstraint("recipient_type IN ('customer', 'vendor', 'admin')", name="chk_recipient_type"),
        Index("idx_notifications_recipient", "recipient_id", "recipient_type"),
        Index("idx_notifications_unread", "recipient_id", "is_read"),
    )


# =============================================================
# SECTION 14: VENDOR KYC
# =============================================================

class VendorKYC(Base):
    __tablename__ = "vendor_kyc"

    id:                           Mapped[int]                        = mapped_column(BigInteger, primary_key=True)
    vendor_id:                    Mapped[int]                        = mapped_column(BigInteger, ForeignKey("vendor.id", ondelete="CASCADE"), nullable=False, unique=True)

    pan_number:                   Mapped[Optional[str]]              = mapped_column(String(20))
    gst_number:                   Mapped[Optional[str]]              = mapped_column(String(20))
    business_registration_number: Mapped[Optional[str]]              = mapped_column(String(50))
    aadhaar_last4:                Mapped[Optional[str]]              = mapped_column(String(4))

    verification_status:          Mapped[VendorVerificationStatusEnum] = mapped_column(
        Enum(VendorVerificationStatusEnum, name="vendor_verification_status"),
        nullable=False,
        server_default="pending",
    )

    verified_at:                  Mapped[Optional[datetime]]         = mapped_column(DateTime(timezone=True))
    verified_by:                  Mapped[Optional[int]]              = mapped_column(BigInteger, ForeignKey("admins.id"))
    rejection_reason:             Mapped[Optional[str]]              = mapped_column(Text)

    created_at:                   Mapped[datetime]                   = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at:                   Mapped[datetime]                   = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    vendor: Mapped["Vendor"] = relationship(back_populates="kyc")

    __table_args__ = (
        Index("idx_vendor_kyc_vendor", "vendor_id"),
    )


# =============================================================
# SECTION 15: VENDOR PAYOUTS
# =============================================================

class VendorPayout(Base):
    __tablename__ = "vendor_payouts"

    id:         Mapped[int]           = mapped_column(BigInteger, primary_key=True)
    vendor_id:  Mapped[int]           = mapped_column(BigInteger, ForeignKey("vendor.id", ondelete="RESTRICT"), nullable=False)
    booking_id: Mapped[int]           = mapped_column(BigInteger, ForeignKey("bookings.id", ondelete="RESTRICT"), nullable=False)

    amount:     Mapped[Decimal]       = mapped_column(Numeric(12, 2), nullable=False)
    currency:   Mapped[str]           = mapped_column(String(10), server_default="INR")

    # pending | processing | paid | failed
    status:     Mapped[str]           = mapped_column(String(20), nullable=False, server_default="pending")

    paid_at:    Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    notes:      Mapped[Optional[str]] = mapped_column(Text)
    metadata_:   Mapped[Optional[dict]] = mapped_column(JSONB)

    created_at: Mapped[datetime]      = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime]      = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    vendor:  Mapped["Vendor"]  = relationship(back_populates="payouts")
    booking: Mapped["Booking"] = relationship(back_populates="payouts")

    __table_args__ = (
        CheckConstraint("amount >= 0", name="chk_payout_amount"),
        Index("idx_vendor_payouts_vendor", "vendor_id"),
        Index("idx_vendor_payouts_booking", "booking_id"),
        Index("idx_vendor_payouts_status", "status"),
    )