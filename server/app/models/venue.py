from sqlalchemy import String, Integer, ForeignKey, Numeric, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

class Venue(Base):
    __tablename__ = "venues"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    vendor_id: Mapped[int] = mapped_column(ForeignKey("vendors.id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str] = mapped_column(String(150), index=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text())
    address_line1: Mapped[str] = mapped_column(String(120), nullable=False)
    address_line2: Mapped[str | None] = mapped_column(String(120))
    city: Mapped[str] = mapped_column(String(60), index=True, nullable=False)
    state: Mapped[str] = mapped_column(String(60), nullable=False)
    pincode: Mapped[str] = mapped_column(String(10), nullable=False)
    country: Mapped[str] = mapped_column(String(56), default="India", nullable=False)

    capacity_min: Mapped[int] = mapped_column(Integer, default=50)
    capacity_max: Mapped[int] = mapped_column(Integer, default=500)
    price_per_day: Mapped[float] = mapped_column(Numeric(12, 2), default=0, nullable=False)
    amenities: Mapped[dict | None] = mapped_column(JSONB)      # e.g., {"parking": true, "ac": true}
    images: Mapped[list | None] = mapped_column(JSONB)         # list of URLs

    vendor = relationship("Vendor", back_populates="venues")
    availabilities = relationship("Availability", back_populates="venue")
    bookings = relationship("Booking", back_populates="venue")
    reviews = relationship("Review", back_populates="venue")
