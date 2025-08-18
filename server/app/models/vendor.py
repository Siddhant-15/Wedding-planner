from sqlalchemy import String, Integer, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

class Vendor(Base):
    __tablename__ = "vendors"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    business_name: Mapped[str] = mapped_column(String(150), nullable=False)
    description: Mapped[str | None] = mapped_column(Text())
    address_line1: Mapped[str | None] = mapped_column(String(120))
    address_line2: Mapped[str | None] = mapped_column(String(120))
    city: Mapped[str | None] = mapped_column(String(60))
    state: Mapped[str | None] = mapped_column(String(60))
    pincode: Mapped[str | None] = mapped_column(String(10))
    country: Mapped[str | None] = mapped_column(String(56), default="India")
    phone: Mapped[str | None] = mapped_column(String(20))
    website: Mapped[str | None] = mapped_column(String(255))

    owner = relationship("User", back_populates="vendor_profile")
    venues = relationship("Venue", back_populates="vendor")
    services = relationship("Service", back_populates="vendor")
