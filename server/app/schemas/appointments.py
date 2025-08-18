from datetime import date
from typing import Optional
from pydantic import constr
from .base import StrictModel
from enum import Enum

class AppointmentStatus(str, Enum):
    REQUESTED = "requested"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    COMPLETED = "completed"

class AppointmentCreate(StrictModel):
    user_id: int
    vendor_id: int
    venue_id: Optional[int] = None
    preferred_date: date
    message: Optional[constr(max_length=1000)] = None

class AppointmentOut(StrictModel):
    id: int
    user_id: int
    vendor_id: int
    venue_id: Optional[int]
    preferred_date: date
    status: AppointmentStatus
    message: Optional[str]
