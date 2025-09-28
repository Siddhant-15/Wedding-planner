import uuid
from sqlalchemy import (
    Column, String, Boolean, ForeignKey, Integer, Text,
    DateTime, Enum, Numeric, JSON, Date, UniqueConstraint
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

# ----- ENUMS -----
from enum import Enum as PyEnum

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

class Slot(str, PyEnum):
    morning = "morning"
    afternoon = "afternoon"
    evening = "evening"
    night = "night"

class BookingStatus(str, PyEnum):
    pending = "pending"
    confirmed = "confirmed"
    canceled = "canceled"
    completed = "completed"

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


# ----- USERS -----
class User(Base):
    __tablename__ = "users"
    __table_args__ = {"extend_existing": True}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    first_name = Column(String(150))
    last_name = Column(String(150))
    email = Column(Text, unique=True, nullable=False)
    phone = Column(Text, unique=True)
    hashed_password = Column(Text, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    roles = relationship("UserRole", back_populates="user")
    bookings = relationship("Booking", back_populates="user")
    enquiries = relationship("Enquiry", back_populates="user")
    reviews = relationship("Review", back_populates="user")


# ----- ROLES -----
class Role(Base):
    __tablename__ = "roles"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True)
    name = Column(Text, unique=True, nullable=False)


class UserRole(Base):
    __tablename__ = "user_roles"
    __table_args__ = {"extend_existing": True}

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    role_id = Column(Integer, ForeignKey("roles.id", ondelete="RESTRICT"), primary_key=True)
    assigned_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="roles")
    role = relationship("Role")


# ----- VENDORS -----
class Vendor(Base):
    __tablename__ = "vendors"
    __table_args__ = {"extend_existing": True}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"))
    business_name = Column(Text, nullable=False)
    business_description = Column(Text)
    contact_person = Column(String(200))
    phone = Column(Text)
    city = Column(Text)
    state = Column(Text)
    country = Column(Text)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    services = relationship("Service", back_populates="vendor")
    enquiries = relationship("Enquiry", back_populates="vendor")
    bookings = relationship("Booking", back_populates="vendor")


# ----- SERVICES -----
class Service(Base):
    __tablename__ = "services"
    __table_args__ = (
    UniqueConstraint("vendor_id", "category", "title", "location", name="unique_vendor_service"),
    {"extend_existing": True}
)

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    vendor_id = Column(UUID(as_uuid=True), ForeignKey("vendors.id", ondelete="CASCADE"))
    category = Column(Enum(ServiceCategory), nullable=False)
    title = Column(Text, nullable=False)
    description = Column(Text)
    base_price = Column(Numeric(12, 2), default=0)
    pricing_type = Column(Enum(PricingType), nullable=False)
    location = Column(Text)
    latitude = Column(Numeric(9, 6))
    longitude = Column(Numeric(9, 6))
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    vendor = relationship("Vendor", back_populates="services")
    bookings = relationship("Booking", back_populates="service")
    enquiries = relationship("Enquiry", back_populates="service")
    reviews = relationship("Review", back_populates="service")
    rating_summary = relationship("ServiceRatingSummary", uselist=False, back_populates="service")


# ----- BOOKINGS -----
class Booking(Base):
    __tablename__ = "bookings"
    __table_args__ = {"extend_existing": True}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"))
    vendor_id = Column(UUID(as_uuid=True), ForeignKey("vendors.id", ondelete="SET NULL"))
    service_id = Column(UUID(as_uuid=True), ForeignKey("services.id", ondelete="RESTRICT"))
    event_date = Column(DateTime(timezone=True), nullable=False)
    slot = Column(Enum(Slot), default="evening")
    guest_count = Column(Integer)
    status = Column(Enum(BookingStatus), default="pending")

    user = relationship("User", back_populates="bookings")
    vendor = relationship("Vendor", back_populates="bookings")
    service = relationship("Service", back_populates="bookings")
    reviews = relationship("Review", back_populates="booking")


# ----- REVIEWS -----
class Review(Base):
    __tablename__ = "reviews"
    __table_args__ = {"extend_existing": True}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    booking_id = Column(UUID(as_uuid=True), ForeignKey("bookings.id", ondelete="SET NULL"))
    service_id = Column(UUID(as_uuid=True), ForeignKey("services.id", ondelete="CASCADE"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"))
    rating = Column(Integer, nullable=False)
    review_text = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    booking = relationship("Booking", back_populates="reviews")
    service = relationship("Service", back_populates="reviews")
    user = relationship("User", back_populates="reviews")


# ----- SERVICE RATING SUMMARY -----
class ServiceRatingSummary(Base):
    __tablename__ = "service_rating_summary"
    __table_args__ = {"extend_existing": True}

    service_id = Column(UUID(as_uuid=True), ForeignKey("services.id", ondelete="CASCADE"), primary_key=True)
    average_rating = Column(Numeric(3, 2), default=0)
    total_reviews = Column(Integer, default=0)

    service = relationship("Service", back_populates="rating_summary")


# ----- ENQUIRIES -----
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
    channel = Column(Enum(EnquiryChannel), default="website")
    status = Column(Enum(EnquiryStatus), default="pending")
    booking_id = Column(UUID(as_uuid=True), ForeignKey("bookings.id", ondelete="SET NULL"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="enquiries")
    service = relationship("Service", back_populates="enquiries")
    vendor = relationship("Vendor", back_populates="enquiries")
