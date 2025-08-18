from sqlalchemy import Integer, ForeignKey, Date, Enum, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
import enum
from app.database import Base

class BookingStatus(str, enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    COMPLETED = "completed"
    REFUNDED = "refunded"

class Booking(Base):
    __tablename__ = "bookings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)

    venue_id: Mapped[int | None] = mapped_column(ForeignKey("venues.id"))
    service_id: Mapped[int | None] = mapped_column(ForeignKey("services.id"))

    event_date: Mapped["Date"] = mapped_column(Date, nullable=False)
    guests: Mapped[int | None] = mapped_column(Integer)
    status: Mapped[BookingStatus] = mapped_column(Enum(BookingStatus), default=BookingStatus.PENDING, nullable=False)
    total_amount: Mapped[float] = mapped_column(Numeric(12, 2), default=0, nullable=False)
    currency: Mapped[str] = mapped_column(String(8), default="INR", nullable=False)
    notes: Mapped[str | None] = mapped_column(String(2000))

    user = relationship("User", back_populates="bookings")
    venue = relationship("Venue", back_populates="bookings")
    service = relationship("Service", back_populates="bookings")
    payment = relationship("Payment", back_populates="booking", uselist=False)
