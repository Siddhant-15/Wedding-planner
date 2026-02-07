# app/models.py
from datetime import datetime
from typing import Optional

from sqlalchemy import String, Boolean, Text, SmallInteger, func, Index
from sqlalchemy import DateTime  # ← this is the correct import
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    """Base class for all models"""
    pass


class Customer(Base):
    __tablename__ = "customer"

    id: Mapped[int] = mapped_column(primary_key=True)  # BIGSERIAL → int
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)

    add_line1: Mapped[Optional[str]] = mapped_column(String(150))
    add_line2: Mapped[Optional[str]] = mapped_column(String(150))
    city: Mapped[Optional[str]] = mapped_column(String(100))
    state: Mapped[Optional[str]] = mapped_column(String(100))
    country: Mapped[Optional[str]] = mapped_column(String(100), server_default="India")
    pincode: Mapped[Optional[str]] = mapped_column(String(20))
    avatar: Mapped[Optional[str]] = mapped_column(String(255))          # URL
    phone: Mapped[Optional[str]] = mapped_column(String(20))

    is_verified: Mapped[bool] = mapped_column(Boolean, server_default="false")

    # Use DateTime(timezone=True) for TIMESTAMPTZ
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )
    last_login: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True)
    )

    __table_args__ = (
        Index("idx_customer_email", "email"),
    )


class Vendor(Base):
    __tablename__ = "vendor"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)

    add_line1: Mapped[Optional[str]] = mapped_column(String(150))
    add_line2: Mapped[Optional[str]] = mapped_column(String(150))
    city: Mapped[Optional[str]] = mapped_column(String(100))
    state: Mapped[Optional[str]] = mapped_column(String(100))
    country: Mapped[Optional[str]] = mapped_column(String(100), server_default="India")
    pincode: Mapped[Optional[str]] = mapped_column(String(20))
    avatar: Mapped[Optional[str]] = mapped_column(String(255))
    phone: Mapped[Optional[str]] = mapped_column(String(20))

    is_verified: Mapped[bool] = mapped_column(Boolean, server_default="false")

    business_name: Mapped[str] = mapped_column(String(150), nullable=False)
    business_description: Mapped[Optional[str]] = mapped_column(Text)
    experience_years: Mapped[int] = mapped_column(SmallInteger, server_default="0")
    contact_person: Mapped[Optional[str]] = mapped_column(String(100))
    website: Mapped[Optional[str]] = mapped_column(String(255))

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )
    last_login: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True)
    )

    __table_args__ = (
        Index("idx_vendor_email", "email"),
        Index("idx_vendor_business_name", "business_name"),
    )