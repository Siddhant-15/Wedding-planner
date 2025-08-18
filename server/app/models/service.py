from sqlalchemy import String, Enum, Integer, ForeignKey, Numeric, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
import enum
from app.database import Base

class ServiceType(str, enum.Enum):
    CATERING = "catering"
    DJ = "dj"
    PHOTOGRAPHY = "photography"
    DECOR = "decor"
    MAKEUP = "makeup"
    OTHER = "other"

class Service(Base):
    __tablename__ = "services"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    vendor_id: Mapped[int] = mapped_column(ForeignKey("vendors.id", ondelete="CASCADE"), nullable=False)

    name: Mapped[str] = mapped_column(String(150), nullable=False)
    type: Mapped[ServiceType] = mapped_column(Enum(ServiceType), nullable=False)
    description: Mapped[str | None] = mapped_column(Text())
    base_price: Mapped[float] = mapped_column(Numeric(12, 2), default=0, nullable=False)
    unit: Mapped[str] = mapped_column(String(20), default="day")  # day/hour/event
    images: Mapped[list | None] = mapped_column(JSONB)

    vendor = relationship("Vendor", back_populates="services")
    bookings = relationship("Booking", back_populates="service")
    reviews = relationship("Review", back_populates="service")
