from sqlalchemy import Column, String,DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    email = Column(String(100), unique=True, nullable=False, index=True)
    phone = Column(String(20), unique=True, nullable=True) 
    password = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False)  # customer, vendor, admin
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    customer_appointments = relationship("Appointment", foreign_keys="Appointment.customer_id", back_populates="customer")
    vendor_appointments = relationship("Appointment", foreign_keys="Appointment.vendor_id", back_populates="vendor")
    services = relationship("Service", back_populates="user", cascade="all, delete-orphan")
     # reviews written by this user as a customer
    customer_reviews = relationship("Review", foreign_keys="Review.customer_id", back_populates="customer")

    # reviews received as a vendor
    vendor_reviews = relationship("Review", foreign_keys="Review.vendor_id", back_populates="vendor")
    customer_bookings = relationship("Booking", foreign_keys="Booking.customer_id", back_populates="customer")
    vendor_bookings = relationship("Booking", foreign_keys="Booking.vendor_id", back_populates="vendor")