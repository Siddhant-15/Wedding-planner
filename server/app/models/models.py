from datetime import datetime, date, time
from typing import Optional, List, Dict

from sqlalchemy import (
    String, Boolean, Text, SmallInteger, func, Index, DECIMAL,
    DateTime, BigInteger, ForeignKey, UniqueConstraint, Integer, Date, Time
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy import CheckConstraint, Column

class Base(DeclarativeBase):
    """Base class for all models"""
    pass

from sqlalchemy.dialects.postgresql import ENUM, ARRAY


LeadStatusEnum = ENUM(
    "new",
    "viewed",
    "accepted",
    "rejected",
    "unavailable",
    "unlocked",
    "contacted",
    "quoted",
    "won",
    "lost",
    "expired",
    "closed",
    name="lead_status_enum"
)

DjEventTypeEnum = ENUM(
    "wedding",
    "corporate",
    "birthday",
    "club",
    "private_party",
    "festival",
    name="dj_event_type_enum",
    create_type=False 
)


class Customer(Base):
    __tablename__ = "customer"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)

    add_line1: Mapped[Optional[str]] = mapped_column(String(150))
    add_line2: Mapped[Optional[str]] = mapped_column(String(150))
    city: Mapped[Optional[str]] = mapped_column(String(100))
    state: Mapped[Optional[str]] = mapped_column(String(100))
    country: Mapped[str] = mapped_column(String(100), server_default="India")
    pincode: Mapped[Optional[str]] = mapped_column(String(20))
    avatar: Mapped[Optional[str]] = mapped_column(String(255))
    phone: Mapped[Optional[str]] = mapped_column(String(20))

    is_verified: Mapped[bool] = mapped_column(Boolean, server_default="false")

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
    last_login: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

    wishlists: Mapped[List["Wishlist"]] = relationship(
    "Wishlist", back_populates="customer", cascade="all, delete-orphan"
)
    reviews: Mapped[list["Review"]] = relationship(
        "Review", back_populates="customer", cascade="all, delete-orphan"
    )
    leads: Mapped[List["Lead"]] = relationship("Lead")

    __table_args__ = (
        Index("idx_customer_email", "email"),
    )


class Vendor(Base):
    __tablename__ = "vendor"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)

    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)

    add_line1: Mapped[Optional[str]] = mapped_column(String(150))
    add_line2: Mapped[Optional[str]] = mapped_column(String(150))
    city: Mapped[Optional[str]] = mapped_column(String(100))
    state: Mapped[Optional[str]] = mapped_column(String(100))
    country: Mapped[str] = mapped_column(String(100), server_default="India")
    pincode: Mapped[Optional[str]] = mapped_column(String(20))

    avatar: Mapped[Optional[str]] = mapped_column(String(255))
    phone: Mapped[Optional[str]] = mapped_column(String(20))

    is_verified: Mapped[bool] = mapped_column(Boolean, server_default="false")

    business_name: Mapped[str] = mapped_column(String(150), nullable=False)
    business_description: Mapped[Optional[str]] = mapped_column(Text)
    experience_years: Mapped[int] = mapped_column(SmallInteger, server_default="0")
    contact_person: Mapped[Optional[str]] = mapped_column(String(100))
    website: Mapped[Optional[str]] = mapped_column(String(255))

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
    last_login: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

    # Relationships
    services: Mapped[List["Service"]] = relationship("Service", back_populates="vendor", cascade="all, delete-orphan")
    leads: Mapped[List["Lead"]] = relationship("Lead")
    unavailable_dates: Mapped[List["VendorUnavailableDate"]] = relationship(
    "VendorUnavailableDate",
    back_populates="vendor",
    cascade="all, delete-orphan"
)
    unlock_usages: Mapped[List["UnlockUsage"]] = relationship(
    "UnlockUsage",
    cascade="all, delete-orphan"
)

    __table_args__ = (
        Index("idx_vendor_email", "email"),
        Index("idx_vendor_business_name", "business_name"),
    )

class ServiceMedia(Base):
    __tablename__ = "service_media"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)

    service_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("services.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    media_url: Mapped[str] = mapped_column(Text, nullable=False)
    media_type: Mapped[str] = mapped_column(String(20), server_default="image")  # image | video
    source_type: Mapped[str] = mapped_column(String(20), server_default="upload")  # upload | youtube | vimeo
    is_cover: Mapped[bool] = mapped_column(Boolean, server_default="false")
    display_order: Mapped[int] = mapped_column(Integer, server_default="0")

    metadata_: Mapped[Optional[Dict]] = mapped_column("metadata", JSONB)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    # 🔗 Relationship
    service: Mapped["Service"] = relationship("Service", back_populates="media")

    __table_args__ = (
        Index("idx_service_media_service", "service_id"),
    )


class Service(Base):
    __tablename__ = "services"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    vendor_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("vendor.id", ondelete="CASCADE"), nullable=False)

    service_type: Mapped[str] = mapped_column(String(50), nullable=False)
    service_name: Mapped[str] = mapped_column(String(150), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)

    add_line1: Mapped[Optional[str]] = mapped_column(String(150))
    add_line2: Mapped[Optional[str]] = mapped_column(String(150))
    area: Mapped[Optional[str]] = mapped_column(String(100))
    city: Mapped[Optional[str]] = mapped_column(String(100))
    state: Mapped[Optional[str]] = mapped_column(String(100))
    country: Mapped[str] = mapped_column(String(100), server_default="India")
    pincode: Mapped[Optional[str]] = mapped_column(String(20))

    latitude: Mapped[Optional[float]] = mapped_column(DECIMAL(9, 6))
    longitude: Mapped[Optional[float]] = mapped_column(DECIMAL(9, 6))

    status: Mapped[str] = mapped_column(String(30), server_default="draft")
    is_active: Mapped[bool] = mapped_column(Boolean, server_default="true")
    is_verified: Mapped[bool] = mapped_column(Boolean, server_default="false")

    metadata_: Mapped[Optional[Dict]] = mapped_column("metadata", JSONB, default=dict)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    vendor: Mapped["Vendor"] = relationship("Vendor", back_populates="services")
    venue: Mapped[Optional["Venue"]] = relationship("Venue", back_populates="service", uselist=False, cascade="all, delete-orphan")
    catering: Mapped[Optional["Catering"]] = relationship(
    "Catering",
    back_populates="service",
    uselist=False,
    cascade="all, delete-orphan"
)
    dj: Mapped[Optional["Dj"]] = relationship(
    "Dj",
    back_populates="service",
    uselist=False,
    cascade="all, delete-orphan"
)
    photography: Mapped[Optional["Photography"]] = relationship("Photography", back_populates="service", uselist=False, cascade="all, delete-orphan")

    event_management: Mapped[Optional["EventManagement"]] = relationship("EventManagement", back_populates="service", uselist=False, cascade="all, delete-orphan")

    makeup_artist: Mapped[Optional["MakeupArtist"]] = relationship("MakeupArtist", back_populates="service", uselist=False, cascade="all, delete-orphan")
    variants: Mapped[List["ServiceVariant"]] = relationship("ServiceVariant", back_populates="service", cascade="all, delete-orphan")
    media: Mapped[List["ServiceMedia"]] = relationship(
    "ServiceMedia",
    back_populates="service",
    cascade="all, delete-orphan",
    order_by="ServiceMedia.display_order",
    lazy="selectin"   # 🔥 important for performance
)
    unavailable_dates: Mapped[List["VendorUnavailableDate"]] = relationship(
    "VendorUnavailableDate",
    back_populates="service",
    cascade="all, delete-orphan"
)
    reviews: Mapped[List["Review"]] = relationship(
        "Review", back_populates="service", cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("idx_services_vendor", "vendor_id"),
        Index("idx_services_type_city", "service_type", "city"),
        Index("idx_services_status", "status"),
    )


class Venue(Base):
    __tablename__ = "venues"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    service_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("services.id", ondelete="CASCADE"), unique=True, nullable=False)

    venue_type: Mapped[str] = mapped_column(String(50), nullable=False)
    venue_nature: Mapped[str] = mapped_column(String(20), nullable=False)

    max_capacity: Mapped[int] = mapped_column(Integer, nullable=False)
    min_capacity: Mapped[int] = mapped_column(Integer, nullable=False)
    square_feet: Mapped[float] = mapped_column(DECIMAL(10, 2), nullable=False)
    parking_capacity: Mapped[int] = mapped_column(Integer, server_default="0")

    venue_policies: Mapped[Optional[Dict]] = mapped_column(JSONB)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    service: Mapped["Service"] = relationship("Service", back_populates="venue")

    __table_args__ = (
        Index("idx_venue_type", "venue_type"),
        Index("idx_venue_capacity", "max_capacity"),
    )


class Catering(Base):
    __tablename__ = "catering_details"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)

    service_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("services.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True
    )

    # Cuisine Types (["indian", "chinese"])
    cuisine_types: Mapped[List[str]] = mapped_column(
        JSONB,
        nullable=False,
        default=list
    )

    # Meal Types (["breakfast", "lunch"])
    meal_types: Mapped[List[str]] = mapped_column(
    ARRAY(String),
    default=list
)

    # Base Pricing (actual handled in variants)
    veg_price_per_head: Mapped[Optional[float]] = mapped_column(DECIMAL(10, 2))
    non_veg_price_per_head: Mapped[Optional[float]] = mapped_column(DECIMAL(10, 2))

    # Order Constraints
    min_order: Mapped[int] = mapped_column(Integer, nullable=False)
    max_order: Mapped[Optional[int]] = mapped_column(Integer)

    # Multiple service styles (["buffet", "live_counter"])
    service_styles: Mapped[List[str]] = mapped_column(
        JSONB,
        nullable=False,
        default=list
    )

    # Inclusions
    staff_included: Mapped[bool] = mapped_column(Boolean, server_default="true")
    crockery_cutlery_included: Mapped[bool] = mapped_column(Boolean, server_default="true")
    tasting_available: Mapped[bool] = mapped_column(Boolean, server_default="false")

    # Logistics
    setup_time_minutes: Mapped[Optional[int]] = mapped_column(Integer)
    service_duration_minutes: Mapped[Optional[int]] = mapped_column(Integer)

    # Travel
    travel_cost_per_km: Mapped[Optional[float]] = mapped_column(DECIMAL(10, 2))
    base_city: Mapped[Optional[str]] = mapped_column(String(100))

    # Tax
    gst_percentage: Mapped[float] = mapped_column(DECIMAL(5, 2), server_default="5.00")
    price_includes_tax: Mapped[bool] = mapped_column(Boolean, server_default="false")

    # Dietary options (important for India)
    special_diets_supported: Mapped[List[str]] = mapped_column(
        JSONB,
        default=list
    )

    # Customization
    customizable_menu: Mapped[bool] = mapped_column(Boolean, server_default="true")

    # Status
    is_active: Mapped[bool] = mapped_column(Boolean, server_default="true")

    # Audit
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

    # 🔗 Relationship
    service: Mapped["Service"] = relationship("Service", back_populates="catering")

    __table_args__ = (
        Index("idx_catering_service", "service_id"),
        Index("idx_catering_cuisine", "cuisine_types", postgresql_using="gin"),
        Index("idx_catering_styles", "service_styles", postgresql_using="gin"),
        Index("idx_catering_diets", "special_diets_supported", postgresql_using="gin"),

        CheckConstraint("min_order > 0", name="chk_min_order_positive"),
        CheckConstraint("max_order IS NULL OR max_order >= min_order", name="chk_max_order_valid"),
        CheckConstraint("veg_price_per_head IS NULL OR veg_price_per_head >= 0", name="chk_veg_price_positive"),
        CheckConstraint("non_veg_price_per_head IS NULL OR non_veg_price_per_head >= 0", name="chk_nonveg_price_positive"),
    )


class Dj(Base):
    __tablename__ = "dj_details"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)

    service_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("services.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True
    )

    # Music
    genres_supported: Mapped[List[str]] = mapped_column(JSONB, default=list)
    languages_supported: Mapped[List[str]] = mapped_column(JSONB, default=list)

    # ENUM ARRAY
    event_types_supported: Mapped[List[str]] = mapped_column(
    ARRAY(DjEventTypeEnum),
    default=lambda: ["wedding"]
)

    # Performance
    performance_duration_hours: Mapped[float] = mapped_column(DECIMAL(5, 2), nullable=False)
    overtime_rate_per_hour: Mapped[Optional[float]] = mapped_column(DECIMAL(10, 2))

    # Equipment
    equipments_provided: Mapped[List[str]] = mapped_column(JSONB, default=list)

    sound_system_included: Mapped[bool] = mapped_column(Boolean, server_default="true")
    lighting_included: Mapped[bool] = mapped_column(Boolean, server_default="false")
    smoke_machine_included: Mapped[bool] = mapped_column(Boolean, server_default="false")
    led_wall_included: Mapped[bool] = mapped_column(Boolean, server_default="false")

    # Hosting
    mc_host_available: Mapped[bool] = mapped_column(Boolean, server_default="false")
    crowd_interaction_level: Mapped[Optional[str]] = mapped_column(String(20))

    # Setup
    setup_time_minutes: Mapped[Optional[int]] = mapped_column(Integer)
    teardown_time_minutes: Mapped[Optional[int]] = mapped_column(Integer)

    # Power
    power_requirement_kw: Mapped[Optional[float]] = mapped_column(DECIMAL(5, 2))
    backup_power_required: Mapped[bool] = mapped_column(Boolean, server_default="false")

    # Travel
    travel_cost_per_km: Mapped[Optional[float]] = mapped_column(DECIMAL(10, 2))
    base_city: Mapped[Optional[str]] = mapped_column(String(100))

    # Restrictions
    outdoor_supported: Mapped[bool] = mapped_column(Boolean, server_default="true")
    late_night_allowed: Mapped[bool] = mapped_column(Boolean, server_default="true")
    sound_license_required: Mapped[bool] = mapped_column(Boolean, server_default="true")

    # Customization
    custom_playlist_allowed: Mapped[bool] = mapped_column(Boolean, server_default="true")
    playlist_link_supported: Mapped[bool] = mapped_column(Boolean, server_default="true")

    # Meta
    experience_years: Mapped[int] = mapped_column(SmallInteger, server_default="0")
    rating: Mapped[Optional[float]] = mapped_column(DECIMAL(2, 1))
    total_events_performed: Mapped[int] = mapped_column(Integer, server_default="0")

    is_active: Mapped[bool] = mapped_column(Boolean, server_default="true")

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationship
    service: Mapped["Service"] = relationship("Service", back_populates="dj")

    __table_args__ = (
        Index("idx_dj_service", "service_id"),
    )


class Photography(Base):
    __tablename__ = "photography_details"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)

    service_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("services.id", ondelete="CASCADE"),
        unique=True, nullable=False, index=True
    )

    photography_types: Mapped[List[str]] = mapped_column(JSONB, default=list)
    videography_available: Mapped[bool] = mapped_column(Boolean, server_default="false")
    drone_shoot_available: Mapped[bool] = mapped_column(Boolean, server_default="false")

    photo_delivery_count: Mapped[Optional[int]] = mapped_column(Integer)
    video_delivery_duration_minutes: Mapped[Optional[int]] = mapped_column(Integer)

    edited_photos_included: Mapped[bool] = mapped_column(Boolean, server_default="true")
    raw_photos_provided: Mapped[bool] = mapped_column(Boolean, server_default="false")

    album_included: Mapped[bool] = mapped_column(Boolean, server_default="false")
    album_pages: Mapped[Optional[int]] = mapped_column(Integer)

    coverage_hours: Mapped[Optional[float]] = mapped_column(DECIMAL(5, 2))
    overtime_rate_per_hour: Mapped[Optional[float]] = mapped_column(DECIMAL(10, 2))

    team_size: Mapped[int] = mapped_column(Integer, server_default="1")
    second_shooter_included: Mapped[bool] = mapped_column(Boolean, server_default="false")

    editing_styles: Mapped[List[str]] = mapped_column(JSONB, default=list)

    travel_cost_per_km: Mapped[Optional[float]] = mapped_column(DECIMAL(10, 2))
    base_city: Mapped[Optional[str]] = mapped_column(String(100))

    experience_years: Mapped[int] = mapped_column(SmallInteger, server_default="0")
    rating: Mapped[Optional[float]] = mapped_column(DECIMAL(2, 1))
    total_events_covered: Mapped[int] = mapped_column(Integer, server_default="0")

    is_active: Mapped[bool] = mapped_column(Boolean, server_default="true")

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    service: Mapped["Service"] = relationship("Service", back_populates="photography")


class EventManagement(Base):
    __tablename__ = "event_management_details"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)

    service_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("services.id", ondelete="CASCADE"),
        unique=True, nullable=False, index=True
    )

    event_types_supported: Mapped[List[str]] = mapped_column(JSONB, default=list)
    services_offered: Mapped[List[str]] = mapped_column(JSONB, default=list)
    themes_supported: Mapped[List[str]] = mapped_column(JSONB, default=list)

    team_size: Mapped[Optional[int]] = mapped_column(Integer)
    on_site_managers: Mapped[int] = mapped_column(Integer, server_default="1")

    decoration_included: Mapped[bool] = mapped_column(Boolean, server_default="false")
    catering_management: Mapped[bool] = mapped_column(Boolean, server_default="false")
    entertainment_management: Mapped[bool] = mapped_column(Boolean, server_default="false")

    planning_duration_days: Mapped[Optional[int]] = mapped_column(Integer)
    setup_time_hours: Mapped[Optional[float]] = mapped_column(DECIMAL(5, 2))

    min_budget: Mapped[Optional[float]] = mapped_column(DECIMAL(12, 2))
    max_budget: Mapped[Optional[float]] = mapped_column(DECIMAL(12, 2))

    travel_cost_per_km: Mapped[Optional[float]] = mapped_column(DECIMAL(10, 2))
    base_city: Mapped[Optional[str]] = mapped_column(String(100))

    experience_years: Mapped[int] = mapped_column(SmallInteger, server_default="0")
    rating: Mapped[Optional[float]] = mapped_column(DECIMAL(2, 1))
    total_events_managed: Mapped[int] = mapped_column(Integer, server_default="0")

    is_active: Mapped[bool] = mapped_column(Boolean, server_default="true")

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    service: Mapped["Service"] = relationship("Service", back_populates="event_management")


class MakeupArtist(Base):
    __tablename__ = "makeup_artist_details"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)

    service_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("services.id", ondelete="CASCADE"),
        unique=True, nullable=False, index=True
    )

    makeup_types: Mapped[List[str]] = mapped_column(JSONB, default=list)
    specialization: Mapped[List[str]] = mapped_column(JSONB, default=list)

    brands_used: Mapped[List[str]] = mapped_column(JSONB, default=list)
    premium_products_used: Mapped[bool] = mapped_column(Boolean, server_default="true")

    team_size: Mapped[int] = mapped_column(Integer, server_default="1")

    service_duration_minutes: Mapped[Optional[int]] = mapped_column(Integer)
    travel_to_client: Mapped[bool] = mapped_column(Boolean, server_default="true")

    travel_cost_per_km: Mapped[Optional[float]] = mapped_column(DECIMAL(10, 2))
    base_city: Mapped[Optional[str]] = mapped_column(String(100))

    hairstyling_included: Mapped[bool] = mapped_column(Boolean, server_default="true")
    draping_included: Mapped[bool] = mapped_column(Boolean, server_default="false")
    trial_available: Mapped[bool] = mapped_column(Boolean, server_default="false")

    experience_years: Mapped[int] = mapped_column(SmallInteger, server_default="0")
    rating: Mapped[Optional[float]] = mapped_column(DECIMAL(2, 1))
    total_clients_served: Mapped[int] = mapped_column(Integer, server_default="0")

    is_active: Mapped[bool] = mapped_column(Boolean, server_default="true")

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    service: Mapped["Service"] = relationship("Service", back_populates="makeup_artist")


class ServiceVariant(Base):
    __tablename__ = "service_variants"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    service_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("services.id", ondelete="CASCADE"), nullable=False)

    variant_name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)

    min_quantity: Mapped[Optional[int]] = mapped_column(Integer)
    max_quantity: Mapped[Optional[int]] = mapped_column(Integer)

    pricing_type: Mapped[str] = mapped_column(String(50), nullable=False)
    currency: Mapped[str] = mapped_column(String(10), server_default="INR")

    pricing: Mapped[Dict] = mapped_column(JSONB, nullable=False)
    menu: Mapped[Optional[Dict]] = mapped_column(JSONB)
    deliverables: Mapped[Optional[Dict]] = mapped_column(JSONB)
    inclusions: Mapped[Optional[List[str]]] = mapped_column(JSONB)
    exclusions: Mapped[Optional[List[str]]] = mapped_column(JSONB)
    policies: Mapped[Optional[Dict]] = mapped_column(JSONB)
    metadata_: Mapped[Optional[Dict]] = mapped_column("metadata", JSONB)

    is_default: Mapped[bool] = mapped_column(Boolean, server_default="false")
    is_active: Mapped[bool] = mapped_column(Boolean, server_default="true")

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    service: Mapped["Service"] = relationship("Service", back_populates="variants")

    __table_args__ = (
        UniqueConstraint("service_id", "variant_name", name="uq_service_variant_name_variants"),
        Index("idx_variant_service", "service_id"),
        Index("idx_variant_pricing_type", "pricing_type"),
    )

class Wishlist(Base):
    __tablename__ = "wishlists"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("customer.id", ondelete="CASCADE"), nullable=False
    )

    name: Mapped[str] = mapped_column(String(150), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    is_default: Mapped[bool] = mapped_column(Boolean, server_default="false")
    is_public: Mapped[bool] = mapped_column(Boolean, server_default="false")

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    items: Mapped[List["WishlistItem"]] = relationship(
        "WishlistItem", back_populates="wishlist", cascade="all, delete-orphan"
    )

    customer: Mapped["Customer"] = relationship(
    "Customer", back_populates="wishlists"
)

class WishlistItem(Base):
    __tablename__ = "favorites"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    wishlist_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("wishlists.id", ondelete="CASCADE"), nullable=False
    )
    service_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("services.id", ondelete="CASCADE"), nullable=False
    )

    note: Mapped[Optional[str]] = mapped_column(Text)
    priority: Mapped[int] = mapped_column(SmallInteger, server_default="0")

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    wishlist: Mapped["Wishlist"] = relationship(
        "Wishlist", back_populates="items"
    )

    __table_args__ = (
        UniqueConstraint("wishlist_id", "service_id", name="uq_wishlist_service"),
    )
    service: Mapped["Service"] = relationship("Service")



class Lead(Base):
    __tablename__ = "leads"

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
        autoincrement=True,
        index=True
    )

    # CUSTOMER
    user_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("customer.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    # VENDOR
    vendor_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("vendor.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    # SERVICE
    service_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("services.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    service_type: Mapped[Optional[str]] = mapped_column(
        String(50)
    )

    # CONTACT INFO
    name: Mapped[str] = mapped_column(String(100))

    phone: Mapped[str] = mapped_column(String(20))

    email: Mapped[Optional[str]] = mapped_column(
        String(100)
    )

    # EVENT
    event_type: Mapped[str] = mapped_column(
        String(50)
    )

    event_date: Mapped[date] = mapped_column(Date)

    event_time: Mapped[Optional[time]] = mapped_column(
        Time
    )

    location: Mapped[str] = mapped_column(
        String(255)
    )

    budget_range: Mapped[Optional[str]] = mapped_column(
        String(50)
    )

    guests: Mapped[Optional[int]] = mapped_column(
        Integer
    )

    description: Mapped[Optional[str]] = mapped_column(
        Text
    )

    # STATUS
    status: Mapped[str] = mapped_column(
        String(20),
        default="new"
    )

    customer_status: Mapped[str] = mapped_column(
        String(50),
        default="REQUEST_SUBMITTED"
    )

    phone_unlocked: Mapped[bool] = mapped_column(
        Boolean,
        default=False
    )

    # TIMESTAMPS
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now()
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now()
    )

    # RELATIONS
    actions: Mapped[List["LeadAction"]] = relationship(
        "LeadAction",
        back_populates="lead",
        cascade="all, delete-orphan"
    )

    customer: Mapped["Customer"] = relationship("Customer")

    vendor: Mapped["Vendor"] = relationship("Vendor")

    service: Mapped["Service"] = relationship("Service")

    __table_args__ = (
        Index("idx_lead_vendor_status", "vendor_id", "status"),
        Index("idx_lead_event_date", "event_date"),
    )


class LeadAction(Base):
    __tablename__ = "lead_actions"

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
        autoincrement=True
    )

    lead_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("leads.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    vendor_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("vendor.id", ondelete="CASCADE"),
        nullable=False
    )

    action: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )

    # notes: Mapped[Optional[str]] = mapped_column(Text)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    lead: Mapped["Lead"] = relationship(
        "Lead",
        back_populates="actions"
    )



class VendorSubscription(Base):
    __tablename__ = "vendor_subscriptions"

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
        autoincrement=True,
    )

    vendor_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("vendor.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    subscription_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("subscriptions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    expires_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    status: Mapped[str] = mapped_column(
        String(20),
        default="active",
        nullable=False,
    )
    """
    active
    expired
    cancelled
    """

    # Relationships
    subscription: Mapped["Subscription"] = relationship(
        "Subscription",
        back_populates="vendor_subscriptions",
    )

    vendor: Mapped["Vendor"] = relationship(
        "Vendor",
    )

class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)

    recipient_id: Mapped[int] = mapped_column(BigInteger, nullable=False)
    recipient_type: Mapped[str] = mapped_column(String(20), nullable=False)

    type: Mapped[str] = mapped_column(String(50))
    title: Mapped[str] = mapped_column(String(255))
    message: Mapped[str] = mapped_column(Text)

    data: Mapped[dict] = mapped_column(JSONB, nullable=True)

    is_read: Mapped[bool] = mapped_column(default=False)

    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)

class VendorUnavailableDate(Base):
    __tablename__ = "vendor_unavailable_dates"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    vendor_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("vendor.id", ondelete="CASCADE"), nullable=False, index=True
    )
    service_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("services.id", ondelete="CASCADE"), nullable=False, index=True
    )
    start_date: Mapped[datetime] = mapped_column(DateTime(timezone=False), nullable=False)
    end_date: Mapped[datetime] = mapped_column(DateTime(timezone=False), nullable=False)
    reason: Mapped[Optional[str]] = mapped_column(String(255))

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    vendor: Mapped["Vendor"] = relationship(
        "Vendor",
        back_populates="unavailable_dates"
    )

    service: Mapped["Service"] = relationship(
        "Service",
        back_populates="unavailable_dates"
    )

    __table_args__ = (
        Index("idx_unavailable_service_dates", "vendor_id", "start_date", "end_date"),
    )

class Review(Base):
    __tablename__ = "reviews"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    service_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("services.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("customer.id", ondelete="CASCADE"), nullable=False, index=True)

    overall_rating: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    food_beverage_rating: Mapped[Optional[int]] = mapped_column(SmallInteger)
    service_quality_rating: Mapped[Optional[int]] = mapped_column(SmallInteger)
    ambiance_rating: Mapped[Optional[int]] = mapped_column(SmallInteger)
    value_for_money_rating: Mapped[Optional[int]] = mapped_column(SmallInteger)

    title: Mapped[Optional[str]] = mapped_column(String(255))
    review_text: Mapped[Optional[str]] = mapped_column(Text)
    
    event_type: Mapped[Optional[str]] = mapped_column(String(100))
    event_date: Mapped[Optional[datetime]] = mapped_column(Date)
    
    photos: Mapped[Optional[list]] = mapped_column(JSONB)
    helpful_count: Mapped[int] = mapped_column(Integer, server_default="0")

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    customer: Mapped["Customer"] = relationship("Customer", back_populates="reviews")
    service: Mapped["Service"] = relationship("Service", back_populates="reviews")


class Subscription(Base):
    __tablename__ = "subscriptions"

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
        autoincrement=True
    )

    name: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )

    daily_unlock_limit: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0
    )

    price: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    # Relationships
    vendor_subscriptions: Mapped[List["VendorSubscription"]] = relationship(
    "VendorSubscription",
    back_populates="subscription",
    cascade="all, delete-orphan"
)

    __table_args__ = (
        Index("idx_subscription_name", "name"),
    )



class UnlockUsage(Base):
    __tablename__ = "unlock_usage"

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
        autoincrement=True
    )

    vendor_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("vendor.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    usage_date: Mapped[datetime] = mapped_column(
        Date,
        nullable=False
    )

    used_count: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    # Relationship
    vendor: Mapped["Vendor"] = relationship("Vendor")

    __table_args__ = (
        UniqueConstraint(
            "vendor_id",
            "usage_date",
            name="uq_vendor_usage_date"
        ),
        Index(
            "idx_unlock_usage_vendor_date",
            "vendor_id",
            "usage_date"
        ),
    )


