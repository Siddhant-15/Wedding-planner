from datetime import datetime
from typing import Optional, List, Dict

from sqlalchemy import (
    String, Boolean, Text, SmallInteger, func, Index, DECIMAL,
    DateTime, BigInteger, ForeignKey, UniqueConstraint, Integer, Date
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    """Base class for all models"""
    pass


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

    wishlist_items: Mapped[list["WishlistItem"]] = relationship(
        "WishlistItem", back_populates="customer", cascade="all, delete-orphan"
    )
    reviews: Mapped[list["Review"]] = relationship(
        "Review", back_populates="customer", cascade="all, delete-orphan"
    )

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
    variants: Mapped[List["ServiceVariant"]] = relationship("ServiceVariant", back_populates="service", cascade="all, delete-orphan")
    media: Mapped[List["ServiceMedia"]] = relationship(
    "ServiceMedia",
    back_populates="service",
    cascade="all, delete-orphan",
    order_by="ServiceMedia.display_order",
    lazy="selectin"   # 🔥 important for performance
)
    unavailable_dates: Mapped[List["UnavailableDate"]] = relationship(
        "UnavailableDate", back_populates="service", cascade="all, delete-orphan"
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
    square_feet: Mapped[int] = mapped_column(DECIMAL(10,2), nullable=False)
    parking_capacity: Mapped[int] = mapped_column(Integer, server_default="0")

    catering_options: Mapped[Dict] = mapped_column(JSONB, nullable=False)
    amenities: Mapped[Optional[Dict]] = mapped_column(JSONB)
    venue_rules: Mapped[Optional[Dict]] = mapped_column(JSONB)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    service: Mapped["Service"] = relationship("Service", back_populates="venue")

    __table_args__ = (
        Index("idx_venue_type", "venue_type"),
        Index("idx_venue_capacity", "max_capacity"),
    )


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


class WishlistItem(Base):
    __tablename__ = "wishlist_items"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("customer.id", ondelete="CASCADE"), nullable=False, index=True
    )
    service_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("services.id", ondelete="CASCADE"), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    customer: Mapped["Customer"] = relationship("Customer", back_populates="wishlist_items")
    service: Mapped["Service"] = relationship("Service")

    __table_args__ = (
        UniqueConstraint("user_id", "service_id", name="uq_user_service_wishlist"),
    )


class UnavailableDate(Base):
    __tablename__ = "unavailable_dates"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
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
    service: Mapped["Service"] = relationship("Service", back_populates="unavailable_dates")

    __table_args__ = (
        Index("idx_unavailable_service_dates", "service_id", "start_date", "end_date"),
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