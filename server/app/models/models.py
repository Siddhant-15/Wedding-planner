# from sqlalchemy import Column, String, Integer, ForeignKey, Text, Numeric, DateTime, Boolean, CheckConstraint
# from sqlalchemy.dialects.postgresql import UUID
# from sqlalchemy.orm import relationship
# from sqlalchemy.sql import func
# import uuid
# from app.database import Base  # your SQLAlchemy Base (from database.py)


# class User(Base):
#     __tablename__ = "users"

#     id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
#     first_name = Column(String(50), nullable=False)
#     last_name = Column(String(50), nullable=False)
#     email = Column(String(100), unique=True, nullable=False, index=True)
#     password = Column(String(255), nullable=False)
#     role = Column(String(20), nullable=False)  # customer, vendor, admin
#     created_at = Column(DateTime(timezone=True), server_default=func.now())

#     appointments = relationship("Appointment", back_populates="customer")
#     reviews = relationship("Review", back_populates="customer")
#     bookings = relationship("Booking", back_populates="customer")


# class Vendor(Base):
#     __tablename__ = "vendors"

#     id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
#     user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
#     business_name = Column(String(100), nullable=False)
#     phone = Column(String(20), nullable=False)
#     address = Column(Text)
#     city = Column(String(50))
#     created_at = Column(DateTime(timezone=True), server_default=func.now())

#     user = relationship("User")
#     services = relationship("Service", back_populates="vendor")
#     appointments = relationship("Appointment", back_populates="vendor")
#     reviews = relationship("Review", back_populates="vendor")


# class Venue(Base):
#     __tablename__ = "venues"

#     id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
#     name = Column(String(100), nullable=False, index=True)
#     address = Column(Text)
#     city = Column(String(50), index=True)
#     capacity = Column(Integer)
#     price = Column(Numeric(12, 2))
#     created_at = Column(DateTime(timezone=True), server_default=func.now())

#     appointments = relationship("Appointment", back_populates="venue")
#     reviews = relationship("Review", back_populates="venue")
#     bookings = relationship("Booking", back_populates="venue")


# class Service(Base):
#     __tablename__ = "services"

#     id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
#     vendor_id = Column(UUID(as_uuid=True), ForeignKey("vendors.id", ondelete="CASCADE"))
#     name = Column(String(100), nullable=False)
#     description = Column(Text)
#     price = Column(Numeric(12, 2))
#     created_at = Column(DateTime(timezone=True), server_default=func.now())

#     vendor = relationship("Vendor", back_populates="services")
#     appointments = relationship("Appointment", back_populates="service")
#     reviews = relationship("Review", back_populates="service")
#     bookings = relationship("Booking", back_populates="service")


# class Appointment(Base):
#     __tablename__ = "appointments"

#     id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
#     customer_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
#     vendor_id = Column(UUID(as_uuid=True), ForeignKey("vendors.id", ondelete="CASCADE"))
#     venue_id = Column(UUID(as_uuid=True), ForeignKey("venues.id", ondelete="CASCADE"))
#     service_id = Column(UUID(as_uuid=True), ForeignKey("services.id", ondelete="CASCADE"))
#     appointment_date = Column(DateTime, nullable=False)
#     status = Column(String(50), default="pending")
#     created_at = Column(DateTime(timezone=True), server_default=func.now())

#     customer = relationship("User", back_populates="appointments")
#     vendor = relationship("Vendor", back_populates="appointments")
#     venue = relationship("Venue", back_populates="appointments")
#     service = relationship("Service", back_populates="appointments")
#     payments = relationship("Payment", back_populates="appointment")


# class Booking(Base):
#     __tablename__ = "bookings"

#     id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
#     customer_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
#     vendor_id = Column(UUID(as_uuid=True), ForeignKey("vendors.id", ondelete="CASCADE"))
#     venue_id = Column(UUID(as_uuid=True), ForeignKey("venues.id", ondelete="CASCADE"))
#     service_id = Column(UUID(as_uuid=True), ForeignKey("services.id", ondelete="CASCADE"))
#     booking_date = Column(DateTime, nullable=False)
#     status = Column(String(50), default="pending")
#     created_at = Column(DateTime(timezone=True), server_default=func.now())

#     customer = relationship("User", back_populates="bookings")
#     venue = relationship("Venue", back_populates="bookings")
#     service = relationship("Service", back_populates="bookings")


# class Payment(Base):
#     __tablename__ = "payments"

#     id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
#     appointment_id = Column(UUID(as_uuid=True), ForeignKey("appointments.id", ondelete="CASCADE"))
#     amount = Column(Numeric(12, 2), nullable=False)
#     status = Column(String(50), default="pending")
#     payment_method = Column(String(50), nullable=False)  # upi, card, cash
#     created_at = Column(DateTime(timezone=True), server_default=func.now())

#     appointment = relationship("Appointment", back_populates="payments")


# class Review(Base):
#     __tablename__ = "reviews"

#     id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
#     customer_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
#     vendor_id = Column(UUID(as_uuid=True), ForeignKey("vendors.id", ondelete="CASCADE"))
#     venue_id = Column(UUID(as_uuid=True), ForeignKey("venues.id", ondelete="CASCADE"))
#     service_id = Column(UUID(as_uuid=True), ForeignKey("services.id", ondelete="CASCADE"))
#     rating = Column(Integer, nullable=False)
#     comment = Column(Text)
#     created_at = Column(DateTime(timezone=True), server_default=func.now())

#     customer = relationship("User", back_populates="reviews")
#     vendor = relationship("Vendor", back_populates="reviews")
#     venue = relationship("Venue", back_populates="reviews")
#     service = relationship("Service", back_populates="reviews")


# class Availability(Base):
#     __tablename__ = "availability"

#     id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
#     vendor_id = Column(UUID(as_uuid=True), ForeignKey("vendors.id", ondelete="CASCADE"))
#     date = Column(DateTime, nullable=False)
#     is_available = Column(Boolean, default=True)
#     created_at = Column(DateTime(timezone=True), server_default=func.now())

#     vendor = relationship("Vendor")
