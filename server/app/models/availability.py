from sqlalchemy import Integer, ForeignKey, Date, Boolean, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

class Availability(Base):
    __tablename__ = "availabilities"
    __table_args__ = (UniqueConstraint("venue_id", "date", name="uq_venue_date"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    venue_id: Mapped[int] = mapped_column(ForeignKey("venues.id", ondelete="CASCADE"), nullable=False)
    date: Mapped["Date"] = mapped_column(Date, nullable=False)
    is_available: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    venue = relationship("Venue", back_populates="availabilities")
