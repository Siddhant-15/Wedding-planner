# models/service.py
import uuid
from sqlalchemy import Column, String, Text, ForeignKey, Numeric, Enum, TIMESTAMP, func
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import relationship
import enum
from app.database import Base


class ServiceType(str, enum.Enum):
    WEDDING_VENUES = "Wedding Venue"
    DJS = "DJ"
    EVENT_MANAGEMENT = "Event Management"
    CATERING = "Catering"
    PHOTOGRAPHY = "Photography"


class ServiceImage(Base):
    __tablename__ = "service_images"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    service_id = Column(UUID(as_uuid=True), ForeignKey("services.id", ondelete="CASCADE"), nullable=False)
    image_url = Column(Text, nullable=False)
    path = Column(Text, nullable=False)
    created_at = Column(TIMESTAMP(timezone=False), server_default=func.now())

    service = relationship("Service", back_populates="images")


class Service(Base):
    __tablename__ = "services"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Numeric(12, 2), nullable=True)
    type = Column(Enum(ServiceType, name="service_type", values_callable=lambda obj: [e.value for e in obj]), nullable=False)
    country = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    city = Column(String(100), nullable=True)
    venue = Column(String(150), nullable=True)
    capacity = Column(String(50), nullable=True)
    amenities = Column(ARRAY(Text), nullable=True)
    created_at = Column(TIMESTAMP(timezone=False), server_default=func.now())

    # relationship with User
    user = relationship("User", back_populates="services")
    bookings = relationship("Booking", back_populates="service", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="service", cascade="all, delete-orphan")
    appointments = relationship("Appointment", back_populates="service", cascade="all, delete-orphan")
    images = relationship("ServiceImage", back_populates="service", cascade="all, delete-orphan")

