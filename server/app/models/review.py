from sqlalchemy import Integer, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

class Review(Base):
    __tablename__ = "reviews"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    venue_id: Mapped[int | None] = mapped_column(ForeignKey("venues.id"))
    service_id: Mapped[int | None] = mapped_column(ForeignKey("services.id"))
    rating: Mapped[int] = mapped_column(Integer, nullable=False)  # 1..5
    title: Mapped[str | None] = mapped_column(Text())
    body: Mapped[str | None] = mapped_column(Text())

    user = relationship("User", back_populates="reviews")
    venue = relationship("Venue", back_populates="reviews")
    service = relationship("Service", back_populates="reviews")
