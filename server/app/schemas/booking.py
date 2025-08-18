from datetime import date
from typing import Optional
from pydantic import confloat, conint, constr
from .base import StrictModel
from .common import Currency
from enum import Enum

class BookingStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    COMPLETED = "completed"
    REFUNDED = "refunded"

class BookingCreate(StrictModel):
    user_id: int
    event_date: date
    venue_id: Optional[int] = None
    service_id: Optional[int] = None
    guests: Optional[conint(ge=1)] = None
    total_amount: confloat(ge=0) = 0
    currency: Currency = Currency.INR
    notes: Optional[constr(max_length=2000)] = None

class BookingOut(StrictModel):
    id: int
    user_id: int
    event_date: date
    venue_id: Optional[int]
    service_id: Optional[int]
    guests: Optional[int]
    status: BookingStatus
    total_amount: float
    currency: Currency
    notes: Optional[str]
