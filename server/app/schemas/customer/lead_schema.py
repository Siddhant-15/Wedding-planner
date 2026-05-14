# ============================================================
# FILE:
# app/schemas/customer/lead_schema.py
# ============================================================

from pydantic import BaseModel, EmailStr
from datetime import date, datetime, time
from typing import Optional


class LeadCreate(BaseModel):
    vendor_id: int
    service_id: int
    service_type: Optional[str]

    name: str
    phone: str
    email: Optional[EmailStr]

    event_type: str
    event_date: date
    event_time: Optional[time]

    location: str

    budget: Optional[str]
    guests: Optional[int]

    description: Optional[str]


class LeadUpdate(BaseModel):
    event_date: Optional[date]
    event_time: Optional[time]
    location: Optional[str]
    budget: Optional[str]
    guests: Optional[int]
    description: Optional[str]


class LeadResponse(BaseModel):
    id: int

    user_id: int
    vendor_id: int

    service_id: int
    service_type: Optional[str]

    event_type: str
    event_date: date
    event_time: Optional[time]

    guests: Optional[int]

    location: str

    budget_range: Optional[str]

    description: Optional[str]

    status: str

    customer_status: Optional[str]

    phone_unlocked: bool

    created_at: datetime

    class Config:
        from_attributes = True