import uuid
from sqlalchemy import (
    Column, String, Boolean, ForeignKey, Integer, Text, SmallInteger,
    DateTime, Enum, Numeric, Index, JSON, Date, UniqueConstraint, Computed
)
from sqlalchemy import Enum as SAEnum
from decimal import Decimal
from datetime import datetime
from sqlalchemy import text
from sqlalchemy.orm import relationship, mapped_column, Mapped
from sqlalchemy.sql import func
from app.database import Base
from enum import Enum as PyEnum
from typing import List
from sqlalchemy.dialects.postgresql import UUID, JSONB, TIMESTAMP

from sqlalchemy.orm import configure_mappers
configure_mappers()

# ======================
# ENUMS
# ======================

class ServiceCategory(str, PyEnum):
    venue = "venue"
    catering = "catering"
    dj = "dj"
    event_management = "event_management"
    photographer = "photographer"

class PricingType(str, PyEnum):
    per_day = "per_day"
    per_hour = "per_hour"
    per_head = "per_head"
    package = "package"

class HallType(str, PyEnum):
    banquet = "banquet"
    lawn = "lawn"
    farmhouse = "farmhouse"
    resort = "resort"

class IndoorOutdoor(str, PyEnum):
    indoor = "indoor"
    outdoor = "outdoor"
    both = "both"

class DecorationPolicy(str, PyEnum):
    allowed = "allowed"
    in_house_only = "in-house-only"

class CateringPolicy(str, PyEnum):
    allowed = "allowed"
    in_house_only = "in-house-only"

class AlcoholPolicy(str, PyEnum):
    allowed = "allowed"
    not_allowed = "not-allowed"

class ServiceStyle(str, PyEnum):
    buffet = "buffet"
    plated = "plated"
    live_counter = "live_counter"

class Slot(str, PyEnum):
    morning = "morning"
    afternoon = "afternoon"
    evening = "evening"
    night = "night"

class AvailabilityReason(str, PyEnum):
    booking = "booking"
    vendor_block = "vendor_block"
    system_block = "system_block"

class BookingStatus(str, PyEnum):
    pending = "pending"
    confirmed = "confirmed"
    canceled = "canceled"
    completed = "completed"

class BookingSource(str, PyEnum):
    online = "online"
    offline = "offline"

class PaymentStatus(str, PyEnum):
    pending = "pending"
    paid = "paid"
    refunded = "refunded"

class PaymentProviderStatus(str, PyEnum):
    requires_action = "requires_action"
    pending = "pending"
    succeeded = "succeeded"
    failed = "failed"
    refunded = "refunded"

class PackageModal(str, PyEnum):
    package_based = "package_based"
    hourly = "hourly"
    fixed = "fixed"

class EnquiryChannel(str, PyEnum):
    website = "website"
    email = "email"
    phone = "phone"
    whatsapp = "whatsapp"

class EnquiryStatus(str, PyEnum):
    pending = "pending"
    contacted = "contacted"
    converted = "converted"
    closed = "closed"
    spam = "spam"

class OrderStatus(str, PyEnum):
    pending = "pending"
    confirmed = "confirmed"
    processing = "processing"
    completed = "completed"
    canceled = "canceled"


class OrderPaymentStatus(str, PyEnum):
    pending = "pending"
    paid = "paid"
    partially_paid = "partially_paid"
    refunded = "refunded"


# class PaymentProviderStatus(str, Enum):
#     created = "created"
#     attempted = "attempted"
#     paid = "paid"
#     failed = "failed"
#     refunded = "refunded"

# ======================
# USERS / ROLES
# ======================

class User(Base):
    __tablename__ = "users"
    __table_args__ = {"extend_existing": True}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(Text, unique=True, nullable=False, index=True)
    first_name = Column(String(150), nullable=False)
    last_name = Column(String(150), nullable=False)
    hashed_password = Column(Text, nullable=False)
    avatar = Column(Text, nullable=True)
    location = Column(Text, nullable=True)
    is_verified = Column(Boolean, default=False, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # relationships
    roles = relationship("UserRole", back_populates="user")
    # bookings = relationship("Booking", back_populates="user")
    enquiries = relationship("Enquiry", back_populates="user")
    reviews = relationship("Review", back_populates="user")
    customer_profile = relationship("Customer", uselist=False, back_populates="user")
    vendor_profile = relationship("Vendor", uselist=False, back_populates="user")
    wishlist_items = relationship("WishlistItem", back_populates="user")
    # orders: Mapped[List["Order"]] = relationship(
    #     "Order",
    #     back_populates="user",
    #     lazy="selectin",  # best for performance
    # )



class Role(Base):
    __tablename__ = "roles"
    __table_args__ = {"extend_existing": True}

    id = Column(SmallInteger, primary_key=True)
    name = Column(Text, unique=True, nullable=False)


class UserRole(Base):
    __tablename__ = "user_roles"
    __table_args__ = {"extend_existing": True}

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    role_id = Column(SmallInteger, ForeignKey("roles.id", ondelete="RESTRICT"), primary_key=True)
    assigned_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="roles")
    role = relationship("Role")


class Customer(Base):
    __tablename__ = "customer"
    __table_args__ = {"extend_existing": True}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    phone = Column(Text, unique=True)
    address_line1 = Column(Text)
    address_line2 = Column(Text)
    city = Column(Text)
    state = Column(Text)
    country = Column(Text)
    pincode = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    user = relationship("User", back_populates="customer_profile")


# ======================
# VENDOR
# ======================

class Vendor(Base):
    __tablename__ = "vendors"
    __table_args__ = (
        UniqueConstraint("business_name", "city", name="uq_vendor_business_city"),
        Index("idx_vendors_city_state", "city", "state"),
        {"extend_existing": True},
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    business_name = Column(Text, nullable=False)
    business_description = Column(Text)
    contact_person = Column(String(150), nullable=False)
    phone = Column(Text, unique=True)
    city = Column(Text, index=True)
    state = Column(Text, index=True)
    country = Column(Text, index=True)
    pincode = Column(Text, index=True)
    experience_years = Column(Integer)
    website = Column(Text)
    is_verified = Column(Boolean, default=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    # updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # relationships - must match back_populates names on User, Service, Enquiry, Booking
    user = relationship("User", back_populates="vendor_profile")
    services = relationship("Service", back_populates="vendor", cascade="all, delete-orphan")
    enquiries = relationship("Enquiry", back_populates="vendor")
    # bookings = relationship("Booking", back_populates="vendor")


# ======================
# SERVICES
# ======================

class Service(Base):
    __tablename__ = "services"
    __table_args__ = (
        UniqueConstraint("vendor_id", "category", "title", "city", "pincode", name="uq_vendor_service"),
        Index("idx_service_filtering", "city", "category", "base_price", "is_active", "verified", "featured"),
        {"extend_existing": True},
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    # service_code = Column(String(50), unique=True, nullable=True, default=lambda: f"SVC-{uuid.uuid4().hex[:8].upper()}")
    vendor_id = Column(UUID(as_uuid=True), ForeignKey("vendors.id", ondelete="CASCADE"))
    category = Column(Enum(ServiceCategory), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    tags = Column(JSONB, default=list)
    base_price = Column(Numeric(12, 2), default=0, index=True)
    currency = Column(String(10), default="INR")
    pricing_type = Column(Enum(PricingType), nullable=False)
    images = Column(JSONB, default=list)
    amenities = Column(JSONB, default=list)
    featured = Column(Boolean, default=False, index=True)
    verified = Column(Boolean, default=False, index=True)
    is_active = Column(Boolean, default=True, index=True)
    address_line1 = Column(Text)
    address_line2 = Column(Text)
    area = Column(String(150))
    city = Column(String(150), index=True)
    state = Column(String(150), index=True)
    country = Column(String(150), index=True)
    pincode = Column(String(20), index=True)
    geo_point = Column(JSONB, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # relationships
    vendor = relationship("Vendor", back_populates="services")
    # bookings = relationship("Booking", back_populates="service")
    enquiries = relationship("Enquiry", back_populates="service")
    reviews = relationship("Review", back_populates="service")
    rating_summary = relationship("ServiceRatingSummary", uselist=False, back_populates="service")
    variants = relationship("ServiceVariant", back_populates="service", cascade="all, delete-orphan")

    # Category-specific relationships
    venue_service = relationship("VenueService", uselist=False, back_populates="service")
    catering_service = relationship("CateringService", uselist=False, back_populates="service")
    dj_service = relationship("DJService", uselist=False, back_populates="service")
    photographer_service = relationship("PhotographerService", uselist=False, back_populates="service")
    event_management_service = relationship("EventManagementService", uselist=False, back_populates="service")
    wishlist_items = relationship("WishlistItem", back_populates="service")


# ======================
# SERVICE VARIANT
# ======================

class ServiceVariant(Base):
    __tablename__ = "service_variants"
    __table_args__ = (
        Index("idx_service_variants_service_price", "service_id", "price"),
        {"extend_existing": True},
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    service_id = Column(UUID(as_uuid=True), ForeignKey("services.id", ondelete="CASCADE"), index=True)
    name = Column(String(150), nullable=False)
    # description = Column(Text)
    price = Column(Numeric(12, 2), nullable=False)
    # currency = Column(String(10), default="INR")
    # pricing_type = Column(Enum(PricingType))
    images = Column(JSONB, default=list)
    amenities = Column(JSONB, default=list)
    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    # updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    service = relationship("Service", back_populates="variants")
    


# Venue, Catering, DJ, Photographer, EventManagement service tables
class VenueService(Base):
    __tablename__ = "venue_services"
    service_id = Column(UUID(as_uuid=True), ForeignKey("services.id", ondelete="CASCADE"), primary_key=True)
    capacity_min = Column(Integer)
    capacity_max = Column(Integer)
    hall_type = Column(Enum(HallType))
    indoor_outdoor = Column(Enum(IndoorOutdoor))
    square_feet = Column(Numeric(10, 2))
    parking_capacity = Column(Integer)
    decoration_policy = Column(Enum(DecorationPolicy))
    catering_policy = Column(Enum(CateringPolicy))
    alcohol_policy = Column(Enum(AlcoholPolicy))

    service = relationship("Service", back_populates="venue_service")


class CateringService(Base):
    __tablename__ = "catering_services"
    service_id = Column(UUID(as_uuid=True), ForeignKey("services.id", ondelete="CASCADE"), primary_key=True)
    cuisine_types = Column(JSONB, default=list)
    veg_price_per_head = Column(Numeric(12, 2))
    nonveg_price_per_head = Column(Numeric(12, 2))
    min_order = Column(Integer)
    max_order = Column(Integer)
    service_style = Column(Enum(ServiceStyle))
    staff_included = Column(Boolean, default=True)
    crockery_cutlery_included = Column(Boolean, default=True)
    tasting_available = Column(Boolean, default=False)

    service = relationship("Service", back_populates="catering_service")


class DJService(Base):
    __tablename__ = "dj_services"
    service_id = Column(UUID(as_uuid=True), ForeignKey("services.id", ondelete="CASCADE"), primary_key=True)
    genres_supported = Column(JSONB, default=list)
    duration_hours = Column(Numeric(5, 2))
    equipment = Column(JSONB, default=list)
    lighting_included = Column(Boolean, default=False)
    mc_host_available = Column(Boolean, default=False)
    setup_time_required = Column(Numeric(5, 2), default=1.0)

    service = relationship("Service", back_populates="dj_service")


class PhotographerService(Base):
    __tablename__ = "photographer_services"
    service_id = Column(UUID(as_uuid=True), ForeignKey("services.id", ondelete="CASCADE"), primary_key=True)
    package_type = Column(JSONB, default=list)
    hours_covered = Column(Numeric(6, 2))
    photos_delivered = Column(Integer)
    edited_photos_count = Column(Integer)
    delivery_time_days = Column(Integer)
    videography_included = Column(Boolean, default=False)
    drone_available = Column(Boolean, default=False)
    album_included = Column(Boolean, default=False)

    service = relationship("Service", back_populates="photographer_service")


class EventManagementService(Base):
    __tablename__ = "event_management_services"
    service_id = Column(UUID(as_uuid=True), ForeignKey("services.id", ondelete="CASCADE"), primary_key=True)
    event_types = Column(JSONB, default=list)
    team_size = Column(Integer)
    includes = Column(JSONB, default=list)
    package_modal = Column(Enum(PackageModal))
    vendor_network_size = Column(Integer)
    experience_years = Column(Integer)

    service = relationship("Service", back_populates="event_management_service")


class ServiceExtra(Base):
    __tablename__ = "service_extra"
    service_id = Column(UUID(as_uuid=True), ForeignKey("services.id", ondelete="CASCADE"), primary_key=True)
    extra_data = Column(JSONB, default=dict)
    updated_at = Column(DateTime(timezone=True), server_default=func.now())


# ======================
# WISHLIST
# ======================

class WishlistItem(Base):
    __tablename__ = "wishlist_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    service_id = Column(UUID(as_uuid=True), ForeignKey("services.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships (optional, for eager loading)
    service = relationship("Service", back_populates="wishlist_items")
    user = relationship("User", back_populates="wishlist_items")



# class Order(Base):
#     __tablename__ = "orders"

#     id: Mapped[uuid.UUID] = mapped_column(
#         UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid()
#     )
#     user_id: Mapped[uuid.UUID] = mapped_column(
#         ForeignKey("users.id", ondelete="SET NULL"), nullable=False
#     )

#     subtotal: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False, default=text("0.00"))
#     tax_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal("0.00"))
#     platform_fee: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal("0.00"))
#     total_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False, default=text("0.00"))

#     currency: Mapped[str] = mapped_column(String(10), server_default=text("'INR'"))

#     status: Mapped[OrderStatus] = mapped_column(
#         Enum(OrderStatus, name="order_status_t"),  # Pass the Enum class here
#         nullable=False,
#         server_default=OrderStatus.pending.value,
#     )

#     payment_status: Mapped[OrderPaymentStatus] = mapped_column(
#         Enum(OrderPaymentStatus, name="order_payment_status_t"),
#         nullable=False,
#         server_default=OrderPaymentStatus.pending.value,
#     )

#     invoice_number: Mapped[str | None] = mapped_column(Text, unique=True, nullable=True)

#     created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
#     updated_at: Mapped[datetime] = mapped_column(
#         DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
#     )

#     # Relationships
#     user: Mapped["User"] = relationship("User", back_populates="orders")
#     items: Mapped[list["OrderItem"]] = relationship(
#         "OrderItem", back_populates="order", cascade="all, delete-orphan", lazy="joined"
#     )
#     payments: Mapped[list["OrderPayment"]] = relationship(
#         "OrderPayment", back_populates="order", lazy="joined"
#     )
#     status_logs: Mapped[list["OrderStatusLog"]] = relationship(
#         "OrderStatusLog", back_populates="order"
#     )

#     __table_args__ = (
#         Index("idx_orders_user", "user_id"),
#         Index("idx_orders_status", "status"),
#     )


# class OrderItem(Base):
#     __tablename__ = "order_items"

#     id: Mapped[uuid.UUID] = mapped_column(
#         UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid()
#     )
#     order_id: Mapped[uuid.UUID] = mapped_column(
#         ForeignKey("orders.id", ondelete="CASCADE"), nullable=False
#     )
#     service_id: Mapped[uuid.UUID | None] = mapped_column(
#         ForeignKey("services.id", ondelete="SET NULL"), nullable=True
#     )
#     variant_id: Mapped[uuid.UUID | None] = mapped_column(
#         ForeignKey("service_variants.id", ondelete="SET NULL"), nullable=True
#     )
#     vendor_id: Mapped[uuid.UUID | None] = mapped_column(
#         ForeignKey("vendors.id", ondelete="SET NULL"), nullable=True
#     )

#     price: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
#     quantity: Mapped[int] = mapped_column(Integer, nullable=False, default=1)

#     total: Mapped[Decimal] = mapped_column(
#         Numeric(12, 2), Computed("price * quantity"), nullable=False
#     )

#     created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

#     # Relationships
#     order: Mapped["Order"] = relationship("Order", back_populates="items")
#     service: Mapped["Service"] = relationship("Service", lazy="joined")
#     variant: Mapped["ServiceVariant"] = relationship("ServiceVariant", lazy="joined")

#     __table_args__ = (
#         Index("idx_order_items_order", "order_id"),
#         Index("idx_order_items_vendor", "vendor_id"),
#     )


# class OrderPayment(Base):
#     __tablename__ = "order_payments"

#     id: Mapped[uuid.UUID] = mapped_column(
#         UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid()
#     )
#     order_id = mapped_column(
#         ForeignKey("orders.id", ondelete="CASCADE"), nullable=False
#     )
#     provider: Mapped[str] = mapped_column(Text, nullable=False)
#     provider_reference: Mapped[str | None] = mapped_column(Text, nullable=True)

#     amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
#     status: Mapped[PaymentProviderStatus] = mapped_column(
#         Enum(PaymentProviderStatus, name="payment_provider_status_t"), nullable=False
#     )

#     paid_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
#     created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

#     order: Mapped["Order"] = relationship("Order", back_populates="payments")

#     __table_args__ = (Index("idx_order_payments_order", "order_id"),)


# class OrderStatusLog(Base):
#     __tablename__ = "order_status_logs"

#     id: Mapped[uuid.UUID] = mapped_column(
#         UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid()
#     )
#     order_id: Mapped[uuid.UUID] = mapped_column(
#         ForeignKey("orders.id", ondelete="CASCADE"), nullable=False
#     )
#     old_status: Mapped[OrderStatus | None] = mapped_column(
#         Enum(OrderStatus, name="order_status_t"),
#         nullable=True
#     )

#     new_status: Mapped[OrderStatus] = mapped_column(
#         Enum(OrderStatus, name="order_status_t"),
#         nullable=False
    # )
    # old_status: Mapped[OrderStatus | None] = mapped_column(
    #     Enum(OrderStatus, name="order_status_t"), nullable=True
    # )
    # new_status: Mapped[OrderStatus] = mapped_column(
    #     Enum(OrderStatus, name="order_status_t"), nullable=False
    # )
    # changed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    # changed_by: Mapped[uuid.UUID | None] = mapped_column(
    #     ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    # )

    # order: Mapped["Order"] = relationship("Order", back_populates="status_logs")

    # __table_args__ = (Index("idx_order_status_logs_order", "order_id"),)


# ======================
# BOOKINGS / PAYMENTS / AVAILABILITY
# ======================

# class Booking(Base):
#     __tablename__ = "bookings"
#     __table_args__ = (
#         Index("ix_bookings_status_date", "status", "event_date"),
#         Index("ix_bookings_user_service", "user_id", "service_id"),
#         Index("ix_bookings_source", "source"),
#         {"extend_existing": True},
#     )

#     id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
#     user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"))
#     vendor_id = Column(UUID(as_uuid=True), ForeignKey("vendors.id", ondelete="SET NULL"))
#     service_id = Column(UUID(as_uuid=True), ForeignKey("services.id", ondelete="RESTRICT"))
#     event_date = Column(DateTime(timezone=True), nullable=False)
#     currency = Column(Text, default="INR")
#     slot = Column(Enum(Slot), default=Slot.evening)
#     guest_count = Column(Integer)
#     status = Column(Enum(BookingStatus), default=BookingStatus.pending)
#     source = Column(Enum(BookingSource), default=BookingSource.online)
#     amount_total = Column(Numeric(12, 2), default=0)
#     amount_paid = Column(Numeric(12, 2), default=0)
#     payment_status = Column(Enum(PaymentStatus), default=PaymentStatus.pending)
#     created_at = Column(DateTime(timezone=True), server_default=func.now())
#     updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

#     user = relationship("User", back_populates="bookings")
#     vendor = relationship("Vendor", back_populates="bookings")
#     service = relationship("Service", back_populates="bookings")
#     reviews = relationship("Review", back_populates="booking")


# class Payment(Base):
#     __tablename__ = "payments"
#     __table_args__ = {"extend_existing": True}

#     id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
#     booking_id = Column(UUID(as_uuid=True), ForeignKey("bookings.id", ondelete="CASCADE"))
#     transaction_id = Column(Text)
#     amount = Column(Numeric(12, 2), nullable=False)
#     currency = Column(Text, default="INR")
#     provider = Column(Text)
#     provider_reference = Column(Text)
#     provider_status = Column(Enum(PaymentProviderStatus))
#     paid_at = Column(DateTime(timezone=True))
#     created_at = Column(DateTime(timezone=True), server_default=func.now())


class AvailabilityBlock(Base):
    __tablename__ = "availability_blocks"
    __table_args__ = {"extend_existing": True}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    service_id = Column(UUID(as_uuid=True), ForeignKey("services.id", ondelete="CASCADE"), nullable=False)
    date = Column(Date, nullable=False)
    slot = Column(Enum(Slot), nullable=False)
    reason = Column(Enum(AvailabilityReason), nullable=False)
    reference_id = Column(UUID(as_uuid=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # optional relationship to booking via reference_id is not declared here (would be manual join)


# ======================
# REVIEWS / RATING / ENQUIRIES
# ======================

class Review(Base):
    __tablename__ = "reviews"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    service_id = Column(UUID(as_uuid=True), ForeignKey("services.id", ondelete="CASCADE"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"))

    overall_rating = Column(SmallInteger, nullable=False)
    food_beverage_rating = Column(SmallInteger)
    service_quality_rating = Column(SmallInteger)
    ambiance_rating = Column(SmallInteger)
    value_for_money_rating = Column(SmallInteger)

    title = Column(Text)
    review_text = Column(Text)

    photos = Column(JSONB, default=list)

    event_type = Column(Text)
    event_date = Column(Date)

    helpful_count = Column(Integer, default=0)

    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="reviews")
    service = relationship("Service", back_populates="reviews")



class ServiceRatingSummary(Base):
    __tablename__ = "service_rating_summary"
    __table_args__ = {"extend_existing": True}

    service_id = Column(UUID(as_uuid=True), ForeignKey("services.id", ondelete="CASCADE"), primary_key=True)
    average_rating = Column(Numeric(3, 2), default=0)
    total_reviews = Column(Integer, default=0)

    service = relationship("Service", back_populates="rating_summary")


class Enquiry(Base):
    __tablename__ = "enquiries"
    __table_args__ = {"extend_existing": True}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"))
    service_id = Column(UUID(as_uuid=True), ForeignKey("services.id", ondelete="CASCADE"))
    vendor_id = Column(UUID(as_uuid=True), ForeignKey("vendors.id", ondelete="CASCADE"))
    name = Column(String(150))
    email = Column(Text)
    phone = Column(Text)
    preferred_date = Column(Date)
    guest_count = Column(Integer)
    message = Column(Text)
    channel = Column(Enum(EnquiryChannel), default=EnquiryChannel.website)
    status = Column(Enum(EnquiryStatus), default=EnquiryStatus.pending)
    booking_id = Column(UUID(as_uuid=True), ForeignKey("bookings.id", ondelete="SET NULL"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="enquiries")
    service = relationship("Service", back_populates="enquiries")
    vendor = relationship("Vendor", back_populates="enquiries")
