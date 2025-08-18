from sqlalchemy import Integer, ForeignKey, Date, Enum, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
import enum
from app.database import Base

class AppointmentStatus(str, enum.Enum):
    REQUESTED = "requested"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    COMPLETED = "completed"

class Appointment(Base):
    __tablename__ = "appointments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    vendor_id: Mapped[int] = mapped_column(ForeignKey("vendors.id"), nullable=False)
    venue_id: Mapped[int | None] = mapped_column(ForeignKey("venues.id"))

    preferred_date: Mapped["Date"] = mapped_column(Date, nullable=False)
    status: Mapped[AppointmentStatus] = mapped_column(Enum(AppointmentStatus), default=AppointmentStatus.REQUESTED, nullable=False)
    message: Mapped[str | None] = mapped_column(String(1000))

    user = relationship("User", back_populates="appointments")
